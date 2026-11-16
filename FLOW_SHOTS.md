# Google Flow shot list: Mahlgrad

Nine short loops that turn the home page's still photos into moving pictures. Until a clip is added,
each slot keeps its photo with the slow camera drift, so the site is complete with any number of them.

## How to make each clip in Flow (labs.google/flow)

1. New project → **Frames to Video**, model **Veo 3 Quality** (Fast is fine for drafts), **16:9**, 8 s.
2. **Start frame and end frame: the same photo** from the table (upload it from `public/img/`).
   That gives a seamless loop, and the clip's first frame matches the photo on the site.
3. Paste the prompt + the style line. Generate 2-4 takes, keep the calmest one (no warping hands,
   no morphing cups, no text appearing).
4. Download (1080p if offered) and save as `flow/<slot>.mp4` in this project.
5. Run `npm run clips`. It encodes `public/video/<slot>.mp4` (~1-3 MB, no audio) + a poster, and
   switches the slot on in `src/lib/media.ts`. Then `npm run build` or `npm run dev` to look.

**Style line (add to every prompt):**
`Cinematic, shot on 35mm, shallow depth of field, warm low-key light, deep espresso-brown shadows, soft copper highlights, natural film grain, slow and calm motion, no text, no logos, no faces, seamless loop.`

## The shots

| Slot | Where on the page | Start/end frame | Prompt |
|---|---|---|---|
| `hero` | Full-screen opening shot, headline sits on the dark left side | `img/c8.jpg` | A barista's hand pours a thin, steady stream of hot water from a copper gooseneck kettle into a paper filter on a glass pour-over brewer; steam curls up through window light, coffee drips into the carafe. Camera locked off, very slow push in. Keep the left third dark and quiet. |
| `latte` | Tall portrait card beside the bar menu (cropped to 4:5, keep the subject centred) | `img/c1.jpg` | Overhead: three hands hold two flat whites and an iced coffee over a wooden café table; the cups meet gently in a toast, the milk foam ripples, ice shifts in the glass. Static overhead camera. |
| `roast` | Bean-to-cup chapter, step 1 "Roast" | `img/c4.jpg` | Extreme close-up of freshly roasted coffee beans slowly turning and tumbling in a drum roaster, a faint wisp of smoke, beans glistening with oil. Slow drift across the surface. |
| `grind` | Chapter step 2 "Grind" | `img/c3.jpg` | Overhead on a steel counter: three portafilters (latte art, fresh grounds, whole beans); fine coffee grounds sift down into the middle basket, the crema on the latte slowly settles. Locked-off overhead camera. |
| `pour` | Chapter step 3 "Brew" | `img/c8.jpg` | Macro of the coffee bloom: water spirals onto fresh grounds in a paper filter, the bed swells and bubbles, dark coffee begins to drip. Very slow push in. |
| `handoff` | Chapter step 4 "Pick up" | `img/c1.jpg` | Overhead: a hand slides a flat white across the wooden counter towards another hand, which lifts it; latte art steady, gentle movement only. |
| `beans` | "Beans for home" shop section | `img/c4.jpg` | Roasted coffee beans pour slowly from above onto a deep pile of beans, a few roll and settle, oil sheen catching the light. Static camera, top-down. |
| `steam` | Behind the stamp card | `img/c5-top.jpg` | Top-down on a white cup of black coffee on a worn wooden table; crema bubbles slowly drift and swirl, soft steam rises across the frame. Locked-off camera. |
| `visit` | "Come by" section with opening hours (darkened behind text) | `img/c12.jpg` | A warm café bar at dusk: copper pendant bulbs glowing and gently swaying, a barista working at the back, steam from the espresso machine, rain on the window reflecting light. Very slow sideways dolly. |

## Tips

- Priority if time is short: `hero` first (biggest impact), then `steam`, `visit`, `latte`.
- If Flow adds readable words or logos (chalkboard, machine brands), regenerate or add "blank chalkboard, unbranded machines".
- Keep motion slow: text sits on top of most of these. Fast motion makes the headline hard to read.
- Visitors who chose reduced motion, or have Save-Data on, always get the still photo. The site's pause button stops the clips too.
- Clips are not committed while in `flow/` (git-ignored); the encoded files in `public/video/` are.
