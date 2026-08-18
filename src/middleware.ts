import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "@/auth.config";

// Uses the lightweight, provider-free config (see auth.config.ts) — the
// full auth.ts (Prisma + bcryptjs) blew past Vercel's 1MB Edge Function
// limit when imported here. JWT sessions only need the shared secret to
// verify, so this separate, smaller instance works identically for the
// "is there a valid session" check middleware actually needs.
const { auth } = NextAuth(authConfig);

export default async function middleware(req: NextRequest) {
  if (req.method !== "GET") return NextResponse.next();

  const session = await auth();
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = req.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute && !session) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
