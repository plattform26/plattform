import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    email: string;
    name?: string;
    lastName?: string;
    expirationDate?: string | Date;
    pausedRemainingDays?: number;
    subscriptionStatus?: string;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: string;
    email: string;
    expirationDate?: string | Date;
    pausedRemainingDays?: number;
    subscriptionStatus?: string;
  }
}
