import Link from "next/link"

export default async function AuthError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-black px-6 text-center text-white">
      <h1 className="text-2xl font-bold">Connexion impossible</h1>
      <p className="max-w-xs text-sm text-neutral-400">
        Cette app est en accès limité par Spotify : seuls les comptes ajoutés
        par son auteur peuvent s&apos;y connecter. Envoie-lui le nom et l&apos;e-mail
        de ton compte Spotify pour qu&apos;il t&apos;autorise, puis réessaie.
      </p>
      <Link
        href="/"
        className="rounded-full bg-[#1DB954] px-6 py-3 text-sm font-bold text-black active:scale-95"
      >
        Réessayer
      </Link>
      {error && (
        <p className="text-xs text-neutral-600">Code : {error}</p>
      )}
    </main>
  )
}