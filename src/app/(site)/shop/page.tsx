import { Suspense } from "react";
import ShopContent from "./ShopContent";
import { getShopProducts } from "@/lib/data/products";
import { getAllCategoriesFlat, getSiteData } from "@/lib/data/site";

export default async function ShopPage() {
  const [products, categories, { settings }] = await Promise.all([
    getShopProducts(),
    getAllCategoriesFlat(),
    getSiteData(),
  ]);

  return (
    <Suspense fallback={null}>
      <ShopContent products={products} categories={categories} whatsappNumber={settings.whatsappNumber} />
    </Suspense>
  );
}
