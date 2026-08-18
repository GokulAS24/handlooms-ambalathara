import { ImageResponse } from "next/og";
import { getSiteData } from "@/lib/data/site";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const { settings } = await getSiteData();

  if (settings.faviconUrl) {
    const res = await fetch(settings.faviconUrl);
    const buffer = await res.arrayBuffer();
    return new Response(buffer, {
      headers: { "Content-Type": res.headers.get("content-type") ?? "image/png" },
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#d8262a",
          borderRadius: 6,
          color: "#fefcfa",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
        }}
      >
        A
      </div>
    ),
    { ...size }
  );
}
