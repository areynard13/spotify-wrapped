import { redirect } from "next/navigation"
import { auth, signIn } from "@/lib/auth"

export default async function Home() {
  const session = await auth()
  if (session && !session.error) redirect("/dashboard")

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-black px-6 text-center text-white">
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold sm:text-5xl">
          Mon Spotify <span className="text-[#1DB954]">Wrapped</span>
        </h1>
        <p className="text-neutral-400">
          Tes top titres et artistes, quand tu veux.
        </p>
      </div>

      <form
        action={async () => {
          "use server"
          await signIn("spotify", {
            redirectTo: `${process.env.AUTH_URL}/dashboard`,
          })
        }}
        className="w-full max-w-xs"
      >
        <button
          type="submit"
          className="w-full rounded-full bg-[#1DB954] px-8 py-4 font-bold text-black transition active:scale-95"
        >
          Se connecter avec Spotify
        </button>
      </form>
    </main>
  )
}
