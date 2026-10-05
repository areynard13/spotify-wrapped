import type { Track } from "./spotify"

export function profile(tracks: Track[]) {
  if (!tracks.length) return null

  const artists = new Set(tracks.map((t) => t.artists[0]?.name))
  const years = tracks
    .map((t) => parseInt(t.album.release_date ?? "", 10))
    .filter(Number.isFinite)

  const byDecade = new Map<number, number>()
  for (const y of years) {
    const d = Math.floor(y / 10) * 10
    byDecade.set(d, (byDecade.get(d) ?? 0) + 1)
  }

  return {
    diversity: Math.round((artists.size / tracks.length) * 100),
    avgYear: years.length
      ? Math.round(years.reduce((a, b) => a + b, 0) / years.length)
      : null,
    decades: [...byDecade.entries()]
      .sort(([a], [b]) => a - b)
      .map(([d, n]) => ({ label: `${d}s`, pct: Math.round((n / years.length) * 100) })),
  }
}

export function evolution<T extends { id: string; name: string }>(
  short: T[],
  long: T[]
) {
  const shortTop = short.slice(0, 10)
  const longTop = long.slice(0, 10)
  const inLong = new Set(long.map((i) => i.id))
  const inShort = new Set(short.map((i) => i.id))
  return {
    nouveaux: shortTop.filter((i) => !inLong.has(i.id)).slice(0, 5),
    fideles: shortTop.filter((i) => longTop.some((l) => l.id === i.id)).slice(0, 5),
    oublies: longTop.filter((i) => !inShort.has(i.id)).slice(0, 5),
  }
}