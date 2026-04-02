import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, otpCodes } from "./db/schema/users";
import { merchants } from "./db/schema/merchants";
import { adminUsers } from "./db/schema/admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    // Consumer: Phone OTP
    Credentials({
      id: "otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code:  { label: "Code",  type: "text" },
      },
      async authorize(credentials) {
        const { phone, code } = credentials as { phone: string; code: string };
        if (!phone || !code) return null;

        // Verify OTP
        const otp = await db.query.otpCodes.findFirst({
          where: (t, { and, eq, gt }) =>
            and(eq(t.phone, phone), eq(t.code, code), eq(t.used, false), gt(t.expiresAt, new Date())),
        });
        if (!otp) return null;

        // Mark used
        await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));

        // Upsert user
        let user = await db.query.users.findFirst({ where: eq(users.phone, phone) });
        if (!user) {
          const [created] = await db.insert(users).values({ phone }).returning();
          user = created;
        }

        return { id: user.id, phone: user.phone, role: "consumer" };
      },
    }),

    // Merchant: Email + Password
    Credentials({
      id: "merchant",
      name: "Merchant",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        if (!email || !password) return null;

        const merchant = await db.query.merchants.findFirst({
          where: eq(merchants.email, email),
        });
        if (!merchant || merchant.status !== "active") return null;

        const valid = await bcrypt.compare(password, merchant.passwordHash);
        if (!valid) return null;

        return { id: merchant.id, email: merchant.email, role: "merchant", merchantId: merchant.id };
      },
    }),

    // Admin: Email + Password
    Credentials({
      id: "admin",
      name: "Admin",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        if (!email || !password) return null;

        const admin = await db.query.adminUsers.findFirst({
          where: eq(adminUsers.email, email),
        });
        if (!admin || !admin.isActive) return null;

        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) return null;

        await db.update(adminUsers)
          .set({ lastLoginAt: new Date() })
          .where(eq(adminUsers.id, admin.id));

        return { id: admin.id, email: admin.email, role: "admin", adminRole: admin.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role       = (user as Record<string, string>).role;
        token.merchantId = (user as Record<string, string>).merchantId;
        token.adminRole  = (user as Record<string, string>).adminRole;
        token.phone      = (user as Record<string, string>).phone;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role       = token.role as string;
      session.user.merchantId = token.merchantId as string | undefined;
      session.user.adminRole  = token.adminRole as string | undefined;
      session.user.phone      = token.phone as string | undefined;
      return session;
    },
  },
});

// Type augmentation
declare module "next-auth" {
  interface User {
    role?: string;
    merchantId?: string;
    adminRole?: string;
    phone?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      merchantId?: string;
      adminRole?: string;
      phone?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    merchantId?: string;
    adminRole?: string;
    phone?: string;
  }
}
