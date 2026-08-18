import Link from "next/link";
import type { Prisma } from "@prisma/client";

type HeroBannerWithCategory = Prisma.HeroBannerGetPayload<{ include: { category: true } }>;

const cardClassName =
  "group relative aspect-[16/7] w-[82%] shrink-0 snap-start overflow-hidden rounded-lg bg-clay-100 sm:w-[360px]";

function CardImage({ banner }: { banner: HeroBannerWithCategory }) {
  const desktopSrc = banner.desktopImageUrl;
  const mobileSrc = banner.mobileImageUrl || banner.desktopImageUrl;

  return (
    <picture className="block h-full w-full">
      <source media="(min-width: 640px)" srcSet={desktopSrc} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mobileSrc}
        alt={banner.title || "Promotion"}
        loading="eager"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </picture>
  );
}

export default function PromoCards({ banners }: { banners: HeroBannerWithCategory[] }) {
  if (banners.length === 0) return null;

  return (
    <section
      aria-label="Promotions"
      className="mx-auto max-w-7xl px-6 pb-4 pt-8"
    >
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {banners.map((banner) =>
          banner.category ? (
            <Link key={banner.id} href={`/shop?category=${banner.category.slug}`} className={cardClassName}>
              <CardImage banner={banner} />
            </Link>
          ) : (
            <div key={banner.id} className={cardClassName}>
              <CardImage banner={banner} />
            </div>
          )
        )}
      </div>
    </section>
  );
}
