import Link from "next/link"
import { redirect } from "next/navigation"
import { auth, signOut } from "@/lib/auth"
import {
  RANGES,
  spotifyGet,
  type Artist,
  type Range,
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

  const [artists, tracks] = await Promise.all([
    spotifyGet<{ items: Artist[] }>(
      token,
      `/me/top/artists?limit=10&time_range=${range}`
    ),
    spotifyGet<{ items: Track[] }>(
      token,
      `/me/top/tracks?limit=10&time_range=${range}`
    ),
  ])

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