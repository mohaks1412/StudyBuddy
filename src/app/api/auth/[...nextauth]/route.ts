// app/api/auth/[...auth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import authService from "@/services/auth.service";

export const authOptions : NextAuthOptions={
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
    async jwt({ token, user, account, profile }:any) {
      // Credentials login
      if (user && account?.provider === "credentials") {
        token._id = user.id;
        token.username = (user as any).username;
        token.isVerified = (user as any).isVerified;
        return token;
      }

      // Google login – only when profile is present
      if (account?.provider === "google" && profile && (profile as any).email) {
        const p = profile as { name?: string; email: string };

        const email = p.email;
        const name = p.name ?? email.split("@")[0];

        let dbUser = await authService.findUserByEmailOrUsername(email);
        if (!dbUser) {
          dbUser = await authService.createSocialUser({ name, email });
        }

        token._id = dbUser._id.toString();
        token.username = dbUser.username;
        token.isVerified = dbUser.isVerified;
        return token;
      }

      // Subsequent calls (no account/profile/user), just keep existing token
      return token;
    },

    async session({ session, token }:any) {
      session.user._id = token._id;
      session.user.username = token.username;
      session.user.isVerified = token.isVerified;
      
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST };
