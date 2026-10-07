"use client"

import Link from "next/link"
import { useCallback, useEffect, useState, type ReactNode } from "react"

export type StoryData = {
  name: string
  range: string
  rangeLabel: string
  artists: { name: string; image?: string }[]
  tracks: { name: string; artist: string; image?: string }[]
  diversity?: number
  avgYear?: number | null
  topDecade?: string
  discovered: string[]
}

const BACKGROUNDS = [
  "from-[#1DB954] to-black",
  "from-purple-700 to-black",
  "from-pink-600 to-black",
  "from-orange-500 to-black",
  "from-blue-700 to-black",
  "from-emerald-600 to-black",
  "from-fuchsia-700 to-black",
  "from-[#1DB954] to-black",
]

const SLIDE_MS = 6000

const Label = ({ children }: { children: ReactNode }) => (
  <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/70">{children}</p>
)

const Rank = ({ items }: { items: string[] }) => (
  <ol className="w-full max-w-sm space-y-3 text-left">
    {items.map((n, i) => (
      <li key={i} className="flex items-baseline gap-3">
        <span className="w-8 text-2xl font-black text-white/50">{i + 1}</span>
        <span className="truncate text-2xl font-bold">{n}</span>
      </li>
    ))}
  </ol>
)

export default function Story({ data }: { data: StoryData }) {
  const [index, setIndex] = useState(0)
  const d = data

  const slides: ReactNode[] = [
    <>
      <Label>Ton Wrapped</Label>
      <h1 className="text-5xl font-black leading-tight">{d.name}</h1>
      <p className="mt-4 text-xl text-white/80">Tes {d.rangeLabel} en musique</p>
    </>,
  ]

  if (d.artists[0]) {
    slides.push(
      <>
        <Label>Ton artiste n°1</Label>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={d.artists[0].image} alt="" className="mb-6 h-56 w-56 rounded-full object-cover shadow-2xl" />
        <h2 className="text-5xl font-black leading-tight">{d.artists[0].name}</h2>
      </>,
      <>
        <Label>Tes top artistes</Label>
        <Rank items={d.artists.slice(0, 5).map((a) => a.name)} />
      </>
    )
  }

  if (d.tracks[0]) {
    slides.push(
      <>
        <Label>Ton titre n°1</Label>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={d.tracks[0].image} alt="" className="mb-6 h-56 w-56 rounded-2xl object-cover shadow-2xl" />
        <h2 className="text-4xl font-black leading-tight">{d.tracks[0].name}</h2>
        <p className="mt-2 text-xl text-white/80">{d.tracks[0].artist}</p>
      </>,
      <>
        <Label>Tes top titres</Label>
        <Rank items={d.tracks.slice(0, 5).map((t) => t.name)} />
      </>
    )
  }

  if (d.diversity !== undefined) {
    slides.push(
      <>
        <Label>Ta diversité</Label>
        <p className="text-8xl font-black">{d.diversity} %</p>
        <p className="mt-4 max-w-xs text-xl text-white/80">
          {d.diversity >= 80
            ? "Tu aimes varier les plaisirs : presque chaque titre vient d'un artiste différent."
            : d.diversity >= 50
              ? "Un bon équilibre entre tes artistes fétiches et la découverte."
              : "Tu es fidèle : tu écoutes surtout les mêmes artistes en boucle."}
        </p>
      </>
    )
  }

  if (d.avgYear) {
    slides.push(
      <>
        <Label>L&apos;âge de ta musique</Label>
        <p className="text-8xl font-black">{d.avgYear}</p>
        <p className="mt-4 max-w-xs text-xl text-white/80">
          est l&apos;année de sortie moyenne de tes titres
          {d.topDecade ? `, avec une majorité des ${d.topDecade}.` : "."}
        </p>
      </>
    )
  }

  if (d.discovered.length) {
    slides.push(
      <>
        <Label>Tes découvertes</Label>
        <p className="mb-6 max-w-xs text-lg text-white/80">Ces artistes sont entrés dans ton top récemment :</p>
        <Rank items={d.discovered} />
      </>
    )
  }

  slides.push(
    <>
      <Label>C&apos;est tout !</Label>
      <h2 className="mb-8 text-4xl font-black">Partage ton Wrapped</h2>
      <div className="flex w-full max-w-xs flex-col gap-3" onClick={(e) => e.stopPropagation()}>
        <a
          href={`/api/share?range=${d.range}`}
          download="wrapped.png"
          className="rounded-full bg-white py-3 font-bold text-black active:scale-95"
        >
          Télécharger ma carte
        </a>
        <Link href={`/dashboard?range=${d.range}`} className="rounded-full bg-black/40 py-3 font-semibold active:scale-95">
          Retour au dashboard
        </Link>
      </div>
    </>
  )

  const last = slides.length - 1
  const next = useCallback(() => setIndex((i) => Math.min(i + 1, last)), [last])
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next()
      if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [next, prev])

  return (
    <div
      className={`relative flex min-h-dvh cursor-pointer select-none flex-col bg-gradient-to-b text-white ${BACKGROUNDS[index % BACKGROUNDS.length]}`}
      onClick={(e) => (e.clientX < window.innerWidth / 3 ? prev() : next())}
    >
      <style>{`@keyframes story-grow{from{width:0}to{width:100%}}`}</style>

      {/* Barres de progression */}
      <div className="absolute inset-x-0 top-0 z-10 flex gap-1 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {slides.map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full bg-white"
              style={
                i < index
                  ? { width: "100%" }
                  : i === index && i !== last
                    ? { animation: `story-grow ${SLIDE_MS}ms linear forwards` }
                    : i === index
                      ? { width: "100%" }
                      : { width: 0 }
              }
              onAnimationEnd={i === index ? next : undefined}
            />
          </div>
        ))}
      </div>

      <Link
        href={`/dashboard?range=${d.range}`}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-3 top-[max(2rem,calc(env(safe-area-inset-top)+1.25rem))] z-10 rounded-full bg-black/30 px-3 py-1 text-sm"
      >
        ✕
      </Link>

      <div key={index} className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        {slides[index]}
      </div>
    </div>
  )
}
