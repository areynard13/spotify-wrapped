import { ImageResponse } from "next/og"
import { auth } from "@/lib/auth"
import { RANGES, spotifyGet, type Artist, type Range, type Track } from "@/lib/spotify"
import { profile } from "@/lib/stats"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.accessToken || session.error) {
    return new Response("Unauthorized", { status: 401 })
  }

  const r = new URL(req.url).searchParams.get("range") ?? ""
  const range: Range = r in RANGES ? (r as Range) : "short_term"

  const [artists, tracks] = await Promise.all([
    spotifyGet<{ items: Artist[] }>(session.accessToken, `/me/top/artists?limit=5&time_range=${range}`),
    spotifyGet<{ items: Track[] }>(session.accessToken, `/me/top/tracks?limit=50&time_range=${range}`),
  ])
  if (!artists || !tracks) return new Response("Spotify error", { status: 502 })

  const p = profile(tracks.items)
  const top = artists.items[0]

  const list = (title: string, names: string[]) => (
    <div style={{ display: "flex", flexDirection: "column", width: 440 }}>
      <div style={{ display: "flex", fontSize: 30, color: "#1DB954", marginBottom: 20 }}>{title}</div>
      {names.map((n, i) => (
        <div
          key={i}
          style={{ display: "flex", fontSize: 36, marginBottom: 16, width: 440, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
        >{`${i + 1}. ${n}`}</div>
      ))}
    </div>
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: 80, color: "white",
          background: "linear-gradient(160deg, #0b3d1e 0%, #000 55%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 34, color: "#1DB954" }}>{`Mon Wrapped · ${RANGES[range]}`}</div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, marginTop: 12 }}>{session.user?.name ?? ""}</div>
        </div>

        {top?.images[0]?.url && (
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={top.images[0].url} width={220} height={220} style={{ borderRadius: 110, objectFit: "cover" }} alt="" />
            <div style={{ display: "flex", flexDirection: "column", marginLeft: 36 }}>
              <div style={{ display: "flex", fontSize: 30, color: "#1DB954" }}>Artiste n°1</div>
              <div style={{ display: "flex", fontSize: 64, fontWeight: 800 }}>{top.name}</div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {list("Top artistes", artists.items.map((a) => a.name))}
          {list("Top titres", tracks.items.slice(0, 5).map((t) => t.name))}
        </div>

        {p && (
          <div style={{ display: "flex", fontSize: 34, color: "#d4d4d4" }}>
            {`${p.diversity} % de diversité${p.avgYear ? ` · année moyenne ${p.avgYear}` : ""}`}
          </div>
        )}
      </div>
    ),
    { width: 1080, height: 1350 }
  )
}
