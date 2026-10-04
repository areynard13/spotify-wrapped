import { redirect } from "next/navigation"
import { auth, signOut } from "@/lib/auth"

type Artist = {
  id: string
  name: string
  images: { url: string }[]
}

export default async function Dashboard() {
  const session = await auth()
  if (!session || session.error) redirect("/")

  // Exemple d'appel à l'API Spotify avec le token
  const res = await fetch(
    "https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term",
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  )
  const { items = [] }: { items: Artist[] } = res.ok
    ? await res.json()
    : { items: [] }

  return (
    <main className="mx-auto max-w-2xl p-8 text-white">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Salut {session.user?.name} 👋
        </h1>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}
        >
          <button className="text-sm text-neutral-400 underline">
            Déconnexion
          </button>
        </form>
      </div>

      <h2 className="mb-4 text-xl font-semibold">Tes top artistes (4 semaines)</h2>
      <ol className="space-y-3">
        {items.map((artist, i) => (
          <li key={artist.id} className="flex items-center gap-4">
            <span className="w-6 text-neutral-500">{i + 1}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artist.images[0]?.url}
              alt={artist.name}
              className="h-14 w-14 rounded-full object-cover"
            />
            <span className="font-medium">{artist.name}</span>
          </li>
        ))}
      </ol>
    </main>
  )
}