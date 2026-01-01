import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import authService from "@/services/auth.service";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" } 
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.identifier) return null;

          if (credentials.otp) {
            const user = await authService.findUserByEmailOrUsername(credentials.identifier);
            if (user && user.isVerified) {
              return {
                id: user._id.toString(),
                email: user.email,
                username: user.username,
                isVerified: user.isVerified
              };
            }
            return null;
          }

          if (!credentials.password) return null;
          const user = await authService.loginWithCredentials(
            credentials.identifier,
            credentials.password
          );
          return {
            _id: user._id,
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            isVerified: user.isVerified
          } as any;
        } catch (err) {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",  
          scope: "openid email profile",
          access_type: "offline"
        }
      }
    }),
  ],
  pages: { signIn: "/sign-in" },
  callbacks: {
    async jwt({ token, user, account, profile }: any) {
      if (user && account?.provider === "credentials") {
        token._id = user.id;
        token.username = (user as any).username;
        token.isVerified = (user as any).isVerified;
        return token;
      }

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

      return token;
    },

    async session({ session, token }: any) {
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
