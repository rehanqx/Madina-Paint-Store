import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    // Providers will be configured in subsequent steps
  ],
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
