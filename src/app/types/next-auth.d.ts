import NextAuth, { DefaultSession, User } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      username: string;
      isVerified: boolean;
    } & DefaultSession["user"];

    
  }

  interface User {
    username: string;
    isVerified: boolean;
  }

    interface Profile {
    id: string;
    email: string;
    name?: string;
    picture?: string;
  }


}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    username: string;
    isVerified: boolean;
  }
}


