// Turns Google Flow downloads into web clips and switches them on.
//   1. save each Flow download as flow/<slot>.mp4   (slots: see src/lib/media.ts / FLOW_SHOTS.md)
//   2. npm run clips            (or: npm run clips -- hero latte   to do only some)
// For each clip it writes public/video/<slot>.mp4 (H.264, no audio, max 1920 px wide, fast start,
// ~1-3 MB) and public/video/<slot>.jpg (first frame = poster), then sets the slot in src/lib/media.ts.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
// ffmpeg-static is fetched on first use instead of living in package.json, so Vercel builds
// don't download an 80 MB binary they never need.
async function getFfmpeg() {
  try {
    return (await import("ffmpeg-static")).default;
  } catch {
    console.log("Fetching ffmpeg (one time)...");
    execFileSync("npm", ["install", "--no-save", "ffmpeg-static@5"], { stdio: "inherit", shell: process.platform === "win32" });
    return (await import("ffmpeg-static")).default;
  }
}

const MEDIA = "src/lib/media.ts";
const slots = [...readFileSync(MEDIA, "utf8").matchAll(/^ {2}(\w+): (?:null|\{[^}]*\}),$/gm)].map((m) => m[1]);
const only = process.argv.slice(2);
if (!existsSync("flow")) mkdirSync("flow");
mkdirSync("public/video", { recursive: true });

const found = readdirSync("flow").filter((f) => /\.(mp4|mov|webm)$/i.test(f));
let media = readFileSync(MEDIA, "utf8");
const ffmpeg = found.length ? await getFfmpeg() : null;
let done = 0;

for (const file of found) {
  const slot = file.replace(/\.\w+$/, "");
  if (!slots.includes(slot)) {
    console.warn(`skip flow/${file}: no slot "${slot}" (slots: ${slots.join(", ")})`);
    continue;
  }
  if (only.length && !only.includes(slot)) continue;
  const input = `flow/${file}`;
  const out = `public/video/${slot}.mp4`;
  const poster = `public/video/${slot}.jpg`;

  // the hero loads first, so it gets a little more bitrate; everything else is lighter
  const crf = slot === "hero" ? "23" : "26";
  execFileSync(ffmpeg, [
    "-y", "-loglevel", "error", "-i", input,
    "-an",
    "-vf", "scale='min(1920,iw)':-2:flags=lanczos,fps=30",
    "-c:v", "libx264", "-preset", "slow", "-crf", crf, "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    out,
  ]);
  execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-i", out, "-frames:v", "1", "-q:v", "3", poster]);

  media = media.replace(
    new RegExp(`^( {2}${slot}): (?:null|\\{[^}]*\\}),$`, "m"),
    `$1: { src: "/video/${slot}.mp4", poster: "/video/${slot}.jpg" },`,
  );
  const mb = (statSync(out).size / 1024 / 1024).toFixed(1);
  console.log(`${slot}: ${out} (${mb} MB) + ${poster}`);
  done++;
}

writeFileSync(MEDIA, media);
console.log(done ? `${done} clip(s) ready; ${MEDIA} updated.` : "No clips found in flow/. Save Flow downloads there as <slot>.mp4.");
