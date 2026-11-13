import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { BRAND } from "@/brand.config";
import { pitchName } from "@/lib/pitch";

/** Share card for pitch links: the regular preview photo with "A draft for <name>" on top. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const name = pitchName(url.searchParams.get("for"));
  // read from disk (traced in next.config.ts) rather than fetching our own origin
  const bg = await readFile(join(process.cwd(), "public", "og-base.jpg"));
  const src = `data:image/jpeg;base64,${bg.toString("base64")}`;

  const png = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#000" }}>
        {/* the photo sits on the right and fades into the black text panel */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={840} height={630} alt="" style={{ position: "absolute", left: 360, top: 0 }} />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: 720,
            display: "flex",
            backgroundImage: "linear-gradient(90deg, #000 0%, #000 72%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 64px",
            width: 640,
            color: "#fff",
          }}
        >
          <div style={{ fontSize: 30, color: BRAND.colors.accent, letterSpacing: 0 }}>{BRAND.wordmark}</div>
          <div style={{ fontSize: 32, marginTop: 28, color: "rgba(255,255,255,0.75)" }}>Website-Entwurf für</div>
          <div style={{ fontSize: 68, lineHeight: 1.05, marginTop: 10 }}>{name ?? BRAND.name}</div>
          <div style={{ fontSize: 24, marginTop: 30, color: "rgba(255,255,255,0.7)" }}>
            Vorbestellen · Abholen · Stempel sammeln
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
  // ImageResponse only makes PNG (~900 KB with a photo); messengers drop previews that large.
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}
