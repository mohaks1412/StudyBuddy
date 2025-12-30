import NextAuth, { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      username: string;
      isVerified: boolean;
    } & DefaultSession["user"];
  }

    interface User {
    id: string;         
    _id: string;        
    username: string;
    isVerified: boolean;
  }


  interface AdapterUser {
    id: string;
    _id: string;
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
  interface JWT extends DefaultJWT {
    _id: string;
    username: string;
    isVerified: boolean;
  }
}
