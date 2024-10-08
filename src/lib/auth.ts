import { db } from "@/lib/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions, getServerSession } from "next-auth";
import Google from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { UserId } from "@/app/api/user/model";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      // version: "2.0",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (user && user.password) {
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isValid) {
            return user;
          }
          // return user;
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token }) {
      const userInDb = await db.user.findUnique({
        where: {
          email: token.email!,
        },
      });
      if (userInDb) {
        // OAuth画像が異なる場合にデータベースを更新
        if (userInDb.oAuthProfileImage !== token.picture) {
          try {
            await db.user.update({
              where: { email: token.email! },
              data: { oAuthProfileImage: token.picture },
            });
          } catch (error) {
            console.error("fault to update oAuthProfileImage:", error);
          }
        }
        token.image = userInDb.image ?? token.picture; // プロフィール画像として使用する
      }
      token.isFirstLogin = userInDb?.isFirstLogin;
      token.isAdmin = userInDb?.isAdmin ?? false;
      token.name = userInDb?.name ?? "";
      return token;
    },
    async session({ token, session }) {
      if (token && session.user) {
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isFirstLogin = token.isFirstLogin as boolean;
        session.user.image = token.image as string;
        session.user.oAuthProfileImage = token.picture as string;
        // TODO: asで無理やり型エラーが出ないようにした
        session.user.id = token.sub as UserId;
      }
      return session;
    },
  },
};

// サーバーコンポーネントやAPIのtsファイルからセッション情報を取得できる
export const getAuthSession = () => getServerSession(authOptions);
