import { Suspense } from "react";
import Header from "@/components/Header";
import HighlightBar from "@/components/HighlightBar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import RouteLoadingBar from "@/components/RouteLoadingBar";
import SmoothScroll from "@/components/SmoothScroll";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { getSiteData, getCategoryTree } from "@/lib/data/site";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ settings }, categories] = await Promise.all([getSiteData(), getCategoryTree()]);

  return (
    <WishlistProvider>
      <CartProvider>
        <SmoothScroll>
          <Suspense fallback={null}>
            <RouteLoadingBar />
          </Suspense>
          <ScrollProgress />
          <Header settings={settings} />
          <HighlightBar />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} categories={categories} />
        </SmoothScroll>
      </CartProvider>
    </WishlistProvider>
  );
}
