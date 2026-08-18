import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const IMAGE_COLS = [14, 15, 16]; // 1-indexed sheet columns for Image 1/2/3
const THUMB_SIZE = 70;

function extensionFromUrl(url: string): "jpeg" | "png" | "gif" | null {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "jpeg";
  if (ext === "png") return "png";
  if (ext === "gif") return "gif";
  return null; // webp and anything else isn't embeddable — cell is left blank
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, images: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Products");

  sheet.columns = [
    { header: "Product ID (do not edit)", key: "id", width: 20 },
    { header: "Name", key: "name", width: 30 },
    { header: "Description", key: "description", width: 40 },
    { header: "Price", key: "price", width: 12 },
    { header: "Compare At Price", key: "compareAtPrice", width: 16 },
    { header: "Stock", key: "stock", width: 10 },
    { header: "Category", key: "category", width: 18 },
    { header: "Weave Type", key: "weaveType", width: 18 },
    { header: "Fabric", key: "fabric", width: 18 },
    { header: "Pattern", key: "pattern", width: 18 },
    { header: "Wash Care", key: "washCare", width: 18 },
    { header: "Featured (TRUE/FALSE)", key: "isFeatured", width: 12 },
    { header: "Active (TRUE/FALSE)", key: "isActive", width: 12 },
    { header: "Image 1", key: "image1", width: 14 },
    { header: "Image 2", key: "image2", width: 14 },
    { header: "Image 3", key: "image3", width: 14 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const p of products) {
    const row = sheet.addRow({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? "",
      stock: p.stock,
      category: p.category.name,
      weaveType: p.weaveType ?? "",
      fabric: p.fabric ?? "",
      pattern: p.pattern ?? "",
      washCare: p.washCare ?? "",
      isFeatured: p.isFeatured,
      isActive: p.isActive,
    });
    row.height = 60;

    for (let i = 0; i < Math.min(3, p.images.length); i++) {
      const extension = extensionFromUrl(p.images[i].url);
      if (!extension) continue; // e.g. webp — not embeddable, leave the cell blank
      try {
        const res = await fetch(p.images[i].url);
        if (!res.ok) continue;
        const bytes = Buffer.from(await res.arrayBuffer());
        const imageId = workbook.addImage({ buffer: bytes as unknown as ExcelJS.Image["buffer"], extension });
        sheet.addImage(imageId, {
          tl: { col: IMAGE_COLS[i] - 1, row: row.number - 1 },
          ext: { width: THUMB_SIZE, height: THUMB_SIZE },
        });
      } catch {
        // best-effort — a missing/unreachable image shouldn't fail the whole export
      }
    }
  }

  const instructions = workbook.addWorksheet("Instructions");
  instructions.columns = [{ width: 90 }];
  [
    "How to use this sheet",
    "",
    "- Do not edit the 'Product ID' column. Leave it blank on a row to create a new product; keep it as-is to update an existing one.",
    "- 'Category' must exactly match one of the names on the 'Valid Categories' sheet.",
    "- 'Featured' and 'Active' accept TRUE or FALSE.",
    "- To set or replace photos: click the Image 1/2/3 cell for that product's row and paste (Ctrl+V) a copied image directly into it.",
    "  Leaving all three image cells blank for a row keeps that product's existing photos unchanged.",
    "  Use a plain image paste, not Excel's 'Place in Cell' picture feature.",
    "- Save as .xlsx and re-upload it from the Products page in the admin panel.",
  ].forEach((line) => instructions.addRow([line]));

  const catSheet = workbook.addWorksheet("Valid Categories");
  catSheet.addRow(["Category Name"]).font = { bold: true };
  categories.forEach((c) => catSheet.addRow([c.name]));

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="products-export.xlsx"`,
    },
  });
}
