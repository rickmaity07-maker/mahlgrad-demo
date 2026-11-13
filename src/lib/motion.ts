"use client";

import { useSyncExternalStore } from "react";

/**
 * Site-wide "pause animations" switch (WCAG 2.2.2: moving content that runs
 * longer than 5 seconds needs a way to stop it). Remembered per browser.
 */
const KEY = "motion.paused";
const listeners = new Set<() => void>();
let paused: boolean | null = null;

function read() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function getMotionPaused() {
  if (paused === null) paused = read();
  return paused;
}

export function setMotionPaused(value: boolean) {
  paused = value;
  try {
    localStorage.setItem(KEY, value ? "1" : "0");
  } catch {
    /* private mode: remember for this page only */
  }
  document.documentElement.dataset.motion = value ? "paused" : "on";
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMotionPaused() {
  return useSyncExternalStore(subscribe, getMotionPaused, () => false);
}
