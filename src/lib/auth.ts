// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import authService from "@/services/auth.service";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.identifier || !credentials.password) return null;
          const user = await authService.loginWithCredentials(
            credentials.identifier,
            credentials.password
          );
          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            isVerified: user.isVerified
          };
        } catch (err) {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: { signIn: "/sign-in" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user.id;
        token.username = user.username;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      session.user._id = token._id;
      session.user.username = token.username;
      session.user.isVerified = token.isVerified;
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
