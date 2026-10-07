import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Story from "@/components/Story"
import { RANGES, spotifyGet, type Artist, type Range, type Track } from "@/lib/spotify"
import { evolution, profile } from "@/lib/stats"

export default async function StoryPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const session = await auth()
  if (!session || session.error) redirect("/")

  const { range: r } = await searchParams
  const range: Range = r && r in RANGES ? (r as Range) : "short_term"
  const token = session.accessToken!

  const get = <T,>(kind: "artists" | "tracks", tr: Range) =>
    spotifyGet<{ items: T[] }>(token, `/me/top/${kind}?limit=50&time_range=${tr}`)

  const [artists, tracks, artistsShort, artistsLong] = await Promise.all([
    get<Artist>("artists", range),
    get<Track>("tracks", range),
    get<Artist>("artists", "short_term"),
    get<Artist>("artists", "long_term"),
  ])
  if (!artists || !tracks) redirect("/dashboard")

  const p = profile(tracks.items)
  const topDecade = p?.decades.slice().sort((a, b) => b.pct - a.pct)[0]?.label
  const ev = evolution(artistsShort?.items ?? [], artistsLong?.items ?? [])

  return (
    <Story
      data={{
        name: session.user?.name ?? "toi",
        range,
        rangeLabel: RANGES[range],
        artists: artists.items.slice(0, 5).map((a) => ({ name: a.name, image: a.images[0]?.url })),
        tracks: tracks.items.slice(0, 5).map((t) => ({
          name: t.name,
          artist: t.artists.map((a) => a.name).join(", "),
          image: t.album.images[0]?.url,
        })),
        diversity: p?.diversity,
        avgYear: p?.avgYear,
        topDecade,
        discovered: ev.nouveaux.map((a) => a.name),
      }}
    />
  )
}
