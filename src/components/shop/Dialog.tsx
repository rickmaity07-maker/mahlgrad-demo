"use client";

import { useEffect, useRef } from "react";

/**
 * Native <dialog> as a modal: focus trap, Esc and inert background come from the browser.
 * `side` turns it into a right-hand drawer on wide screens.
 */
export function Dialog(props: {
  open: boolean;
  onClose: () => void;
  label: string;
  side?: "center" | "right";
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { open, onClose } = props;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const placement =
    props.side === "right"
      ? "m-0 ml-auto h-dvh max-h-dvh w-full max-w-md rounded-none sm:rounded-l-[var(--radius-m)]"
      : "m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-lg rounded-[var(--radius-m)]";

  return (
    <dialog
      ref={ref}
      aria-label={props.label}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`bg-card p-0 text-ink shadow-[0_30px_80px_rgb(12_13_11/0.35)] ${placement}`}
    >
      {props.children}
    </dialog>
  );
}
