import Link from "next/link"
import { redirect } from "next/navigation"
import { auth, signOut } from "@/lib/auth"
import {
  RANGES,
  spotifyGet,
  type Artist,
  type Range,
  type RecentItem,
  type Track,
} from "@/lib/spotify"

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const session = await auth()
  if (!session || session.error) redirect("/")

  const { range: r } = await searchParams
  const range: Range = r && r in RANGES ? (r as Range) : "short_term"
  const token = session.accessToken!

  const [artists, tracks, recent] = await Promise.all([
    spotifyGet<{ items: Artist[] }>(
      token,
      `/me/top/artists?limit=10&time_range=${range}`
    ),
    spotifyGet<{ items: Track[] }>(
      token,
      `/me/top/tracks?limit=10&time_range=${range}`
    ),
    spotifyGet<{ items: RecentItem[] }>(
      token,
      "/me/player/recently-played?limit=50"
    ),
  ])

  // Temps d'écoute par jour (50 dernières écoutes seulement, durée complète des titres)
  const byDay = new Map<string, { label: string; ms: number }>()
  for (const { played_at, track } of recent?.items ?? []) {
    const d = new Date(played_at)
    const key = d.toLocaleDateString("sv-SE")
    const label = d.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
    byDay.set(key, { label, ms: (byDay.get(key)?.ms ?? 0) + track.duration_ms })
  }
  const days = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b))
  const totalMin = Math.round(days.reduce((s, [, d]) => s + d.ms, 0) / 60000)
  const maxMs = Math.max(1, ...days.map(([, d]) => d.ms))
  const avgMin = days.length ? Math.round(totalMin / days.length) : 0

  return (
    <main className="mx-auto max-w-3xl space-y-10 p-8 text-white">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Salut {session.user?.name} 👋</h1>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: process.env.AUTH_URL })
          }}
        >
          <button className="text-sm text-neutral-400 underline">
            Déconnexion
          </button>
        </form>
      </header>

      {/* Sélecteur de période */}
      <nav className="flex gap-2">
        {(Object.keys(RANGES) as Range[]).map((key) => (
          <Link
            key={key}
            href={`/dashboard?range=${key}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              key === range
                ? "bg-[#1DB954] text-black"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            {RANGES[key]}
          </Link>
        ))}
      </nav>

      {/* Temps d'écoute */}
      <section>
        <h2 className="mb-1 text-xl font-semibold">Temps d&apos;écoute récent</h2>
        <p className="mb-4 text-sm text-neutral-500">
          Basé sur tes 50 dernières écoutes (limite de l&apos;API Spotify) :
          estimation, pas un total sur la période choisie.
        </p>
        <div className="mb-4 flex gap-8">
          <div>
            <p className="text-4xl font-bold">{totalMin.toLocaleString("fr-FR")}</p>
            <p className="text-sm text-neutral-400">minutes au total</p>
          </div>
          <div>
            <p className="text-4xl font-bold">{avgMin}</p>
            <p className="text-sm text-neutral-400">min / jour en moyenne</p>
          </div>
        </div>
        <ul className="space-y-2">
          {days.map(([key, d]) => (
            <li key={key} className="flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0 text-neutral-400">{d.label}</span>
              <div className="h-3 flex-1 rounded-full bg-neutral-800">
                <div
                  className="h-3 rounded-full bg-[#1DB954]"
                  style={{ width: `${(d.ms / maxMs) * 100}%` }}
                />
              </div>
              <span className="w-16 text-right">{Math.round(d.ms / 60000)} min</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Top titres */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Top titres</h2>
          <ol className="space-y-3">
            {tracks?.items.map((t, i) => (
              <li key={t.id} className="flex items-center gap-3">
                <span className="w-5 text-neutral-500">{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.album.images.at(-1)?.url}
                  alt=""
                  className="h-12 w-12 rounded object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.name}</p>
                  <p className="truncate text-sm text-neutral-400">
                    {t.artists.map((a) => a.name).join(", ")}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Top artistes */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Top artistes</h2>
          <ol className="space-y-3">
            {artists?.items.map((a, i) => (
              <li key={a.id} className="flex items-center gap-3">
                <span className="w-5 text-neutral-500">{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.images.at(-1)?.url}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.name}</p>
                  <p className="truncate text-sm text-neutral-400">
                    {a.genres?.slice(0, 2).join(", ")}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  )
}