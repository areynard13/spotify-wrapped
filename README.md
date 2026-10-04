# Spotify Wrapped

A Next.js app that lets you sign in with Spotify and see your top tracks and top artists, with a selectable time range.

## Features

- Spotify sign-in with [Auth.js](https://authjs.dev) (`next-auth` v5 beta)
- Automatic access token refresh
- Top tracks and top artists
- Time range selector: ~4 weeks, ~6 months, ~12 months
- Protected `/dashboard` route

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router)
- React 19
- Auth.js (`next-auth@5.0.0-beta.32`)
- Tailwind CSS 4
- TypeScript
- [Bun](https://bun.sh) as package manager

## Getting started

### 1. Create a Spotify app

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and create an app.
2. Add this Redirect URI and click **Save**:

   ```
   http://127.0.0.1:3000/api/auth/callback/spotify
   ```

   Spotify does not accept `localhost`, so use `127.0.0.1`.
3. While the app is in development mode, add your Spotify account under **User Management**.

### 2. Configure environment variables

Create a `.env` file at the project root:

```env
AUTH_SECRET=
AUTH_URL=http://127.0.0.1:3000

AUTH_SPOTIFY_ID=
AUTH_SPOTIFY_SECRET=
```

Generate `AUTH_SECRET` with:

```bash
bunx auth secret
```

### 3. Install and run

```bash
bun install
bun dev
```

Then open **http://127.0.0.1:3000** (not `localhost`).

## Project structure

```
proxy.ts                             Protects /dashboard (Next.js 16 replacement for middleware)
next.config.ts                       allowedDevOrigins for 127.0.0.1
lib/auth.ts                          Auth.js config (Spotify provider, token refresh)
lib/spotify.ts                       Spotify API helper, types and time ranges
types/next-auth.d.ts                 Session / JWT type augmentation
app/page.tsx                         Login page
app/dashboard/page.tsx               Dashboard (top tracks and artists)
app/api/auth/[...nextauth]/route.ts  Auth.js route handlers
```

## Spotify API limitations

- Top tracks and artists only support three time ranges: `short_term` (~4 weeks), `medium_term` (~6 months) and `long_term` (~12 months). Arbitrary ranges such as 6 or 12 weeks are not available.
- The API does not provide total listening time. The recently played endpoint only returns the last 50 plays, so it cannot be used to compute accurate totals. For exact numbers you would need Spotify's *Extended streaming history* data export.

## Local development notes

- Always use `127.0.0.1`, not `localhost`, for the app URL, `AUTH_URL` and the Spotify Redirect URI. Cookies are host-specific, so mixing both hosts breaks the login.
- In dev, Next.js can report `localhost` as the request origin, which makes Spotify reject the token exchange with `invalid_grant: Invalid redirect URI`. `auth.ts` works around this by:
  - forcing the `redirect_uri` of the token request with `customFetch`;
  - forcing all redirects back to the `AUTH_URL` origin with the `redirect` callback.
- `debug: true` in `auth.ts` logs your client secret. Only enable it temporarily and never share the logs.

## Scripts

| Command       | Description              |
| ------------- | ------------------------ |
| `bun dev`     | Start the dev server     |
| `bun run build` | Build for production   |
| `bun start`   | Start the production server |

## Production

Set `AUTH_URL` to your production URL, add `https://your-domain/api/auth/callback/spotify` to the Spotify Redirect URIs, and update the `REDIRECT_URI` handling in `auth.ts` if you no longer need the localhost workaround.
