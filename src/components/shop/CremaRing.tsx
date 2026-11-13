import Image from "next/image";

/**
 * A black coffee seen from above (c5-top.jpg is cropped so the cup sits exactly in the middle), turning slowly, inside a ring of text that turns
 * the other way. Pure CSS animation; the pause switch and reduced motion stop it.
 */
export function CremaRing({ text, className = "" }: { text: string; className?: string }) {
  const ring = text.repeat(2);
  return (
    <div className={`relative aspect-square ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="spin-reverse absolute inset-0 size-full text-ink/70">
        <defs>
          <path id="crema-ring" d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0" />
        </defs>
        <text fontSize="8.4" letterSpacing="2.2" fill="currentColor" style={{ textTransform: "uppercase", fontWeight: 600 }}>
          <textPath href="#crema-ring" textLength="548">
            {ring}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[14%] overflow-hidden rounded-full shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)]">
        <Image
          src="/img/c5-top.jpg"
          alt=""
          fill
          sizes="(min-width: 768px) 30vw, 70vw"
          className="spin-slow object-cover"
        />
      </div>
    </div>
  );
}
