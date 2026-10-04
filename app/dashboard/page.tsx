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

type Item = {
  id: string
  title: string
  subtitle: string
  image?: string
  round?: boolean
}

function Top({ title, items }: { title: string; items: Item[] }) {
  const [first, ...rest] = items
  if (!first) return null

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold sm:text-xl">{title}</h2>

      {/* N°1 mis en avant */}
      <div className="mb-2 flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#1DB954]/30 to-neutral-900 p-3 sm:p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={first.image}
          alt=""
          className={`h-24 w-24 shrink-0 object-cover sm:h-28 sm:w-28 ${
            first.round ? "rounded-full" : "rounded-xl"
          }`}
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#1DB954]">
            N°1
          </p>
          <p className="line-clamp-2 text-lg font-bold leading-tight sm:text-xl">
            {first.title}
          </p>
          <p className="truncate text-sm text-neutral-300">{first.subtitle}</p>
        </div>
      </div>

      <ol className="space-y-1" start={2}>
        {rest.map((item, i) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-xl p-2 active:bg-neutral-900"
          >
            <span className="w-6 shrink-0 text-center text-sm text-neutral-500">
              {i + 2}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt=""
              className={`h-12 w-12 shrink-0 object-cover ${
                item.round ? "rounded-full" : "rounded-md"
              }`}
            />
            <div className="min-w-0">
              <p className="truncate font-medium">{item.title}</p>
              <p className="truncate text-sm text-neutral-400">{item.subtitle}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

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

  if (!artists && !tracks) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-black px-6 text-center text-white">
        <h1 className="text-2xl font-bold">Accès non autorisé</h1>
        <p className="max-w-xs text-sm text-neutral-400">
          Cette app est en accès limité par Spotify. Envoie le nom et l&apos;e-mail
          de ton compte Spotify à son auteur pour qu&apos;il t&apos;ajoute à la liste
          des utilisateurs.
        </p>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: process.env.AUTH_URL })
          }}
        >
          <button className="rounded-full bg-neutral-800 px-6 py-3 text-sm font-medium active:bg-neutral-700">
            Se déconnecter
          </button>
        </form>
      </main>
    )
  }

  const trackItems: Item[] = (tracks?.items ?? []).map((t) => ({
    id: t.id,
    title: t.name,
    subtitle: t.artists.map((a) => a.name).join(", "),
    image: t.album.images[0]?.url,
  }))

  const artistItems: Item[] = (artists?.items ?? []).map((a) => ({
    id: a.id,
    title: a.name,
    subtitle: a.genres?.slice(0, 2).join(", ") ?? "",
    image: a.images[0]?.url,
    round: true,
  }))

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-3xl px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-8">
        <header className="flex items-center justify-between gap-3 pt-6 sm:pt-8">
          <h1 className="min-w-0 truncate text-xl font-bold sm:text-3xl">
            Salut {session.user?.name} 👋
          </h1>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: process.env.AUTH_URL })
            }}
          >
            <button className="-mr-2 rounded-lg px-2 py-2 text-sm text-neutral-400 active:bg-neutral-900">
              Déconnexion
            </button>
          </form>
        </header>

        {/* Sélecteur de période : reste visible au scroll */}
        <nav className="sticky top-0 z-10 -mx-4 bg-black/80 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
          <div className="grid grid-cols-3 gap-1 rounded-full bg-neutral-900 p-1">
            {(Object.keys(RANGES) as Range[]).map((key) => (
              <Link
                key={key}
                href={`/dashboard?range=${key}`}
                scroll={false}
                className={`rounded-full py-2 text-center text-sm font-medium transition ${
                  key === range
                    ? "bg-[#1DB954] text-black"
                    : "text-neutral-300 active:bg-neutral-800"
                }`}
              >
                {RANGES[key]}
              </Link>
            ))}
          </div>
        </nav>

        <div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-10">
          <Top title="Top titres" items={trackItems} />
          <Top title="Top artistes" items={artistItems} />
        </div>
      </main>
    </div>
  )
}
