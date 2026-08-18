import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      category: true,
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return NextResponse.json({
    results: products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images[0]?.url ?? null,
      category: p.category.name,
    })),
  });
}
