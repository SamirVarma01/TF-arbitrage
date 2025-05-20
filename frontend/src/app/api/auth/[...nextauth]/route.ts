import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "steam",
      name: "Steam",
      type: "oauth",
      authorization: "https://steamcommunity.com/openid/login",
      token: "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002",
      userinfo: "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002",
      profile(profile) {
        return {
          id: profile.steamid,
          name: profile.personaname,
          image: profile.avatarfull,
        };
      },
      clientId: process.env.STEAM_CLIENT_ID,
      clientSecret: process.env.STEAM_CLIENT_SECRET,
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 