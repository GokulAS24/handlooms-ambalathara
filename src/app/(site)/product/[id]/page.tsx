import { notFound } from "next/navigation";
import { getProductDetail, getRelatedProducts, getProductVariants } from "@/lib/data/products";
import { getSiteData } from "@/lib/data/site";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, { settings }] = await Promise.all([getProductDetail(id), getSiteData()]);
  if (!product) notFound();

  const [related, variants] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId),
    product.style ? getProductVariants(product.style, product.id) : Promise.resolve([]),
  ]);

  return (
    <ProductDetailClient
      product={product}
      related={related}
      variants={variants}
      whatsappNumber={settings.whatsappNumber}
    />
  );
}
