/**
 * Moving pictures for the home page. Each slot shows its still photo until a Google Flow clip
 * is added. Shot list and prompts: FLOW_SHOTS.md. To add one, save the Flow download as
 * flow/<slot>.mp4 and run `npm run clips`. That writes public/video/<slot>.mp4 (web-encoded, no audio)
 * and public/video/<slot>.jpg (its first frame, used as the poster so nothing jumps when it starts),
 * then set the slot below to { src: "/video/<slot>.mp4", poster: "/video/<slot>.jpg" }.
 * Clips play muted and looped, only while on screen; reduced motion and Save-Data always get the still.
 */
export type Clip = { src: string; poster: string } | null;

export type Slot = "hero" | "latte" | "roast" | "grind" | "pour" | "handoff" | "beans" | "steam" | "visit";

export const CLIPS: Record<Slot, Clip> = {
  /** espresso shot pouring, full-screen hero */
  hero: null,
  /** latte art being poured, beside the bar menu */
  latte: null,
  /** green beans roasting to brown, first step of the bean-to-cup chapter */
  roast: null,
  /** burr grinder, fresh grounds falling, second step of the chapter */
  grind: null,
  /** V60 bloom, third step of the chapter */
  pour: null,
  /** the cup handed across the counter, last step of the chapter */
  handoff: null,
  /** beans falling into a bag, beans-for-home section */
  beans: null,
  /** steam over a black coffee, behind the stamp card */
  steam: null,
  /** the café at dusk in the rain, visit section */
  visit: null,
};
