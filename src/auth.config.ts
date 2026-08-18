import type { NextAuthConfig } from "next-auth";

// Deliberately provider-free: middleware imports only this file, so it
// never pulls in Prisma/bcryptjs (both far too heavy — and Prisma isn't
// edge-compatible anyway) just to check whether a JWT session exists.
export const authConfig = {
  trustHost: true,
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
