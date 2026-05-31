"use client";

import { useEffect, useCallback } from "react";

type KeyHandler = (e: KeyboardEvent) => void;

interface Hotkey {
  keys: string[];
  handler: KeyHandler;
}

const registry: Hotkey[] = [];

export function registerHotkey(keys: string[], handler: KeyHandler) {
  registry.push({ keys, handler });
  return () => {
    const idx = registry.findIndex((h) => h.handler === handler);
    if (idx >= 0) registry.splice(idx, 1);
  };
}

function matches(e: KeyboardEvent, keys: string[]): boolean {
  const modifiers = keys.filter((k) => k === "ctrl" || k === "meta" || k === "shift" || k === "alt");
  const key = keys.find((k) => !["ctrl", "meta", "shift", "alt"].includes(k));

  const ctrl = modifiers.includes("ctrl") ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
  const shift = modifiers.includes("shift") ? e.shiftKey : !e.shiftKey;
  const alt = modifiers.includes("alt") ? e.altKey : !e.altKey;

  return ctrl && shift && alt && e.key.toLowerCase() === key?.toLowerCase();
}

if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    for (const { keys, handler } of registry) {
      if (matches(e, keys)) {
        e.preventDefault();
        handler(e);
        return;
      }
    }
  });
}

export function useHotkeys(keys: string[], handler: KeyHandler, deps: unknown[] = []) {
  const stableHandler = useCallback(handler, deps);
  useEffect(() => registerHotkey(keys, stableHandler), [keys.join(","), stableHandler]);
}
