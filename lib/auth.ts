import NextAuth, { customFetch } from "next-auth"
import Spotify from "next-auth/providers/spotify"
import type { JWT } from "next-auth/jwt"

const SCOPES = [
  "user-read-email",
  "user-top-read",
  "user-read-recently-played",
].join(" ")

const BASE_URL = process.env.AUTH_URL ?? "http://127.0.0.1:3000"
const REDIRECT_URI = `${BASE_URL}/api/auth/callback/spotify`

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.AUTH_SPOTIFY_ID}:${process.env.AUTH_SPOTIFY_SECRET}`
          ).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken!,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw data

    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
      refreshToken: data.refresh_token ?? token.refreshToken,
      error: undefined,
    }
  } catch (error) {
    console.error("Erreur lors du refresh du token Spotify", error)
    return { ...token, error: "RefreshTokenError" }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Spotify({
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: { scope: SCOPES },
      },

      // Next fournit parfois "localhost" comme origine : on force le redirect_uri
      // pour qu'il soit identique à celui de l'étape d'autorisation.
      [customFetch]: async (input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.href
              : input.url

        if (url.includes("accounts.spotify.com/api/token")) {
          const body = new URLSearchParams(init?.body as any)
          body.set("redirect_uri", REDIRECT_URI)
          return fetch(input, { ...init, body })
        }

        return fetch(input, init)
      },
    }),
  ],
  pages: { signIn: "/", error: "/auth/error" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      if (nextUrl.pathname.startsWith("/dashboard")) return !!auth
      return true
    },

    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        }
      }

      if (token.expiresAt && Date.now() < token.expiresAt * 1000) return token

      return refreshAccessToken(token)
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.error = token.error
      return session
    },

    // Force toutes les redirections sur l'origine d'AUTH_URL (127.0.0.1)
    async redirect({ url }) {
      try {
        const target = new URL(url, BASE_URL)
        if (target.hostname === "localhost" || target.origin === BASE_URL) {
          return BASE_URL + target.pathname + target.search
        }
      } catch {}
      return BASE_URL
    },
  },
})
