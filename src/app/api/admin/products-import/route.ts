import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin, UPLOADS_BUCKET } from "@/lib/supabase";

const COL = {
  id: 1,
  name: 2,
  description: 3,
  price: 4,
  compareAtPrice: 5,
  stock: 6,
  category: 7,
  weaveType: 8,
  fabric: 9,
  pattern: 10,
  washCare: 11,
  isFeatured: 12,
  isActive: 13,
} as const;

const IMAGE_COL_START_0INDEXED = 13; // columns 14/15/16 (1-indexed) house Image 1/2/3

type RowResult =
  | { row: number; name: string; status: "created" }
  | { row: number; name: string; status: "updated" }
  | { row: number; name: string; status: "error"; message: string };

function cellText(row: ExcelJS.Row, col: number): string | null {
  const value = row.getCell(col).value;
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function parseBool(value: ExcelJS.CellValue, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["true", "yes", "1"].includes(v)) return true;
    if (["false", "no", "0"].includes(v)) return false;
  }
  if (typeof value === "number") return value !== 0;
  return fallback;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const workbook = new ExcelJS.Workbook();
  const uploadBytes = Buffer.from(await file.arrayBuffer());
  await workbook.xlsx.load(uploadBytes as unknown as Parameters<typeof workbook.xlsx.load>[0]);

  const sheet = workbook.getWorksheet("Products");
  if (!sheet) {
    return NextResponse.json({ error: "This file has no 'Products' sheet. Use the exported template." }, { status: 400 });
  }

  const categories = await prisma.category.findMany();
  const categoryByName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c]));
  const validCategoryNames = categories.map((c) => c.name).join(", ");

  // Group embedded images by the row they're anchored to, ordered left-to-right.
  const rowImages = new Map<number, string[]>(); // 1-indexed row -> ordered imageId list
  for (const img of sheet.getImages()) {
    const anchorRow = img.range.tl.nativeRow + 1;
    const anchorCol = img.range.tl.nativeCol;
    if (anchorCol < IMAGE_COL_START_0INDEXED) continue; // not in the image columns
    const list = rowImages.get(anchorRow) ?? [];
    list.push(img.imageId);
    rowImages.set(anchorRow, list);
  }
  // Stable left-to-right order per row
  for (const [row, ids] of rowImages) {
    const withCol = ids.map((id) => {
      const match = sheet.getImages().find((i) => i.imageId === id);
      return { id, col: match ? match.range.tl.nativeCol : 0 };
    });
    withCol.sort((a, b) => a.col - b.col);
    rowImages.set(row, withCol.map((w) => w.id));
  }

  const supabase = getSupabaseAdmin();

  async function uploadEmbeddedImage(imageId: string): Promise<string | null> {
    const media = workbook.getImage(Number(imageId));
    if (!media?.buffer) return null;
    const contentType = media.extension === "png" ? "image/png" : media.extension === "gif" ? "image/gif" : "image/jpeg";
    const filename = `${randomUUID()}.${media.extension}`;
    const { error } = await supabase.storage
      .from(UPLOADS_BUCKET)
      .upload(filename, media.buffer as unknown as ArrayBuffer, { contentType });
    if (error) return null;
    return supabase.storage.from(UPLOADS_BUCKET).getPublicUrl(filename).data.publicUrl;
  }

  const results: RowResult[] = [];

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    const name = cellText(row, COL.name);
    if (!name) continue; // blank row — skip silently

    try {
      const productId = cellText(row, COL.id);

      const priceRaw = row.getCell(COL.price).value;
      const price = typeof priceRaw === "number" ? priceRaw : parseFloat(String(priceRaw ?? ""));
      if (!price || Number.isNaN(price) || price <= 0) {
        throw new Error("Price is required and must be a positive number");
      }

      const stockRaw = row.getCell(COL.stock).value;
      const stock = typeof stockRaw === "number" ? Math.round(stockRaw) : parseInt(String(stockRaw ?? "0"), 10) || 0;

      const compareAtPriceRaw = row.getCell(COL.compareAtPrice).value;
      const compareAtPrice =
        compareAtPriceRaw !== null && compareAtPriceRaw !== undefined && compareAtPriceRaw !== ""
          ? Number(compareAtPriceRaw)
          : null;

      const categoryName = cellText(row, COL.category);
      const category = categoryName ? categoryByName.get(categoryName.toLowerCase()) : undefined;
      if (!category) {
        throw new Error(`Category "${categoryName ?? ""}" not found. Valid categories: ${validCategoryNames}`);
      }

      const description = cellText(row, COL.description) ?? name;
      const isFeatured = parseBool(row.getCell(COL.isFeatured).value, false);
      const isActive = parseBool(row.getCell(COL.isActive).value, true);

      const embeddedIds = rowImages.get(rowNumber) ?? [];
      const uploadedUrls: string[] = [];
      for (const imageId of embeddedIds.slice(0, 3)) {
        const url = await uploadEmbeddedImage(imageId);
        if (url) uploadedUrls.push(url);
      }

      const data = {
        name,
        slug: slugify(name),
        description,
        price,
        compareAtPrice,
        stock,
        categoryId: category.id,
        weaveType: cellText(row, COL.weaveType),
        fabric: cellText(row, COL.fabric),
        pattern: cellText(row, COL.pattern),
        washCare: cellText(row, COL.washCare),
        isFeatured,
        isActive,
      };

      if (productId) {
        const existing = await prisma.product.findUnique({ where: { id: productId } });
        if (!existing) throw new Error(`Product ID "${productId}" not found`);

        await prisma.product.update({ where: { id: productId }, data });

        if (uploadedUrls.length > 0) {
          await prisma.productImage.deleteMany({ where: { productId } });
          await prisma.productImage.createMany({
            data: uploadedUrls.map((url, i) => ({ productId, url, order: i })),
          });
        }
        results.push({ row: rowNumber, name, status: "updated" });
      } else {
        await prisma.product.create({
          data: { ...data, images: { create: uploadedUrls.map((url, i) => ({ url, order: i })) } },
        });
        results.push({ row: rowNumber, name, status: "created" });
      }
    } catch (e) {
      results.push({ row: rowNumber, name, status: "error", message: e instanceof Error ? e.message : "Unknown error" });
    }
  }

  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/admin/products");

  return NextResponse.json({ results });
}
