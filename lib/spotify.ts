export const RANGES = {
  short_term: "4 semaines",
  medium_term: "6 mois",
  long_term: "12 mois",
} as const

export type Range = keyof typeof RANGES

export type Artist = {
  id: string
  name: string
  genres: string[]
  images: { url: string }[]
}

export type Track = {
  id: string
  name: string
  duration_ms: number
  artists: { name: string }[]
  album: { images: { url: string }[]; release_date?: string }
}

export type RecentItem = { played_at: string; track: Track }

export async function spotifyGet<T>(
  token: string,
  path: string
): Promise<T | null> {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  if (!res.ok) {
    console.error("Spotify API", path, res.status)
    return null
  }
  return res.json()
}