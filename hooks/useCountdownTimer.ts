"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const TIMER_DURATION = 60 * 60; // 60 minutes in seconds
const STORAGE_KEY = "enrollment_timer_start";

export function useCountdownTimer(onExpire?: () => void) {
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const [remaining, setRemaining] = useState<number | null>(null);
  const reloadedRef = useRef(false);

  // Get or create start time (browser only)
  const getStartTime = (): number => {
    if (typeof window === "undefined") return Date.now();

    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return parseInt(stored, 10);

    const now = Date.now();
    sessionStorage.setItem(STORAGE_KEY, String(now));
    return now;
  };

  const restartAndReload = useCallback(() => {
    if (typeof window === "undefined") return;
    if (reloadedRef.current) return; // prevent reload loops within same render
    reloadedRef.current = true;

    // reset timer start so next load starts fresh 60 minutes
    sessionStorage.removeItem(STORAGE_KEY);
    const now = Date.now();
    sessionStorage.setItem(STORAGE_KEY, String(now));

    // reload page
    window.location.reload();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let start = getStartTime();

    const updateRemaining = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const r = Math.max(TIMER_DURATION - elapsed, 0);
      setRemaining(r);

      if (r <= 0) {
        // Optional callback (e.g., clear form state), but page will reload anyway
        try {
          onExpireRef.current?.();
        } finally {
          restartAndReload();
        }
      }
    };

    updateRemaining(); // run immediately
    const interval = setInterval(updateRemaining, 1000);

    // If user calls resetTimer, we update `start` too
    const onStorageReset = () => {
      start = getStartTime();
      updateRemaining();
    };

    window.addEventListener("enrollment_timer_reset", onStorageReset);

    return () => {
      clearInterval(interval);
      window.removeEventListener("enrollment_timer_reset", onStorageReset);
    };
  }, [restartAndReload]);

  const resetTimer = useCallback(() => {
    if (typeof window === "undefined") return;

    sessionStorage.removeItem(STORAGE_KEY);
    const now = Date.now();
    sessionStorage.setItem(STORAGE_KEY, String(now));
    setRemaining(TIMER_DURATION);

    // notify effect to pick up the new start time immediately
    window.dispatchEvent(new Event("enrollment_timer_reset"));
  }, []);

  // Prevent hydration mismatch
  if (remaining === null) {
    return {
      remaining: TIMER_DURATION,
      display: "60:00",
      resetTimer,
    };
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return { remaining, display, resetTimer };
}