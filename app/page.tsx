import { redirect } from "next/navigation"
import { auth, signIn } from "@/lib/auth"

export default async function Home() {
  const session = await auth()
  if (session && !session.error) redirect("/dashboard")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black text-white">
      <h1 className="text-5xl font-bold">Mon Spotify Wrapped</h1>
      <p className="text-neutral-400">
        Connecte-toi pour découvrir tes stats musicales.
      </p>
      <form
        action={async () => {
          "use server"
          await signIn("spotify", {
            redirectTo: `${process.env.AUTH_URL}/dashboard`,
          })
        }}
      >
        <button
          type="submit"
          className="rounded-full bg-[#1DB954] px-8 py-3 font-semibold text-black transition hover:scale-105"
        >
          Se connecter avec Spotify
        </button>
      </form>
    </main>
  )
}