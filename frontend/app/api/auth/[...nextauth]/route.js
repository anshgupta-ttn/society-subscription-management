import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (user.email !== ADMIN_EMAIL) return false;
      return true;
    },
    async session({ session, token }) {
      session.user.email = token.email;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.email = user.email;
      return token;
    },
  },
  pages: {
    error: "/admin/login",
  },
});

export { handler as GET, handler as POST };
