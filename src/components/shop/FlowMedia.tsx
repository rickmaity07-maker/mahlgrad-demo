import Image from "next/image";
import type { Clip } from "@/lib/media";
import { LoopVideo } from "./LoopVideo";

/**
 * A still photo that becomes a looping clip once one is set in lib/media.ts.
 * The clip's first frame is the poster, so nothing jumps when the video starts, and it is
 * all that shows under reduced motion or Save-Data. `drift` adds the slow camera push to stills.
 */
export function FlowMedia(props: {
  clip: Clip;
  poster: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  drift?: string;
  className?: string;
}) {
  const still = props.clip?.poster ?? props.poster;
  const drift = props.drift && !props.clip;
  return (
    <div className={`absolute inset-0 overflow-hidden ${props.className ?? ""}`}>
      <Image
        src={still}
        alt={props.alt}
        fill
        sizes={props.sizes}
        priority={props.priority}
        fetchPriority={props.priority ? "high" : undefined}
        className={`object-cover ${drift ? "kenburns" : ""}`}
        style={drift ? { ["--kb-origin" as string]: props.drift } : undefined}
      />
      {props.clip ? <LoopVideo src={props.clip.src} eager={props.priority} /> : null}
    </div>
  );
}
