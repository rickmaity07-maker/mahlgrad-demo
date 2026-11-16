import { Quotes, Star } from "@phosphor-icons/react/dist/ssr";
import type { Lang } from "@/lib/types";

/** Sample reviews for the demo. They are labelled as samples on the page. */
const REVIEWS = [
  { name: "Mara S.", stars: 5, de: "Flat White mit Hafer, morgens um acht vorbestellt und um zehn nach acht in der Hand. Die Schlange habe ich nur von außen gesehen.", en: "Oat flat white, ordered ahead at eight and in my hand at ten past. I only saw the queue from outside." },
  { name: "Henrik B.", stars: 5, de: "Der Guji schmeckt wirklich nach Pfirsich. Hätte ich nicht geglaubt.", en: "The Guji really does taste of peach. Wouldn't have believed it." },
  { name: "Selin Ö.", stars: 4, de: "Hafermilch kostet hier nur 40 Cent extra, das merkt man sich. Am Wochenende ist es voll.", en: "Oat milk is only 40 cents extra here, you remember that. Busy at the weekend." },
  { name: "Paul R.", stars: 5, de: "Zehnter Kaffee aufs Haus, ganz ohne App. Die Stempelkarte füllt sich schneller, als mir lieb ist.", en: "Tenth coffee on the house, no app needed. The stamp card fills up faster than I'd like." },
  { name: "Chiara M.", stars: 5, de: "Die Zimtschnecke ist morgens noch warm. Zusammen mit dem Batch Brew mein Lieblingsfrühstück.", en: "The cinnamon bun is still warm in the morning. With the batch brew it's my favourite breakfast." },
  { name: "Jan-Ole F.", stars: 4, de: "Cold Brew ist schokoladig und gar nicht bitter. Gern auch in größer.", en: "The cold brew is chocolatey and not bitter at all. Would love a bigger size." },
];

export function ReviewWall({ lang, title, note }: { lang: Lang; title: string; note: string }) {
  return (
    <section className="border-t border-line py-28 md:py-44">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-[clamp(3rem,6vw,5.6rem)]">{title}</h2>
          <p className="text-sm text-muted">{note}</p>
        </div>
        <ul className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {REVIEWS.map((r) => (
            <li key={r.name} className="mb-4 break-inside-avoid rounded-[var(--radius-m)] border border-line bg-card/60 p-7">
              <Quotes size={28} weight="fill" className="text-copper" aria-hidden />
              <p className="display mt-4 text-[1.55rem] leading-[1.2]">{r[lang]}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-ink/85">{r.name}</span>
                <span className="flex gap-0.5" role="img" aria-label={`${r.stars}/5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={15} weight="fill" className={i < r.stars ? "text-copper" : "text-line"} aria-hidden />
                  ))}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
