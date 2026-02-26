"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const TIMER_DURATION = 60 * 60; // 60 minutes in seconds
const STORAGE_KEY = "enrollment_timer_start";

type UseCountdownTimerOptions = {
  onExpire?: () => void;
  onExpireStartLoading?: () => void; // show overlay before clearing/reload
  loadingDelayMs?: number; // delay so user can see overlay
};

// Backward compatible: accepts function OR options object
export function useCountdownTimer(arg?: (() => void) | UseCountdownTimerOptions) {
  const options: UseCountdownTimerOptions =
    typeof arg === "function" ? { onExpire: arg } : arg ?? {};

  const onExpireRef = useRef(options.onExpire);
  const onExpireStartLoadingRef = useRef(options.onExpireStartLoading);
  const loadingDelayMsRef = useRef(options.loadingDelayMs ?? 800);

  onExpireRef.current = options.onExpire;
  onExpireStartLoadingRef.current = options.onExpireStartLoading;
  loadingDelayMsRef.current = options.loadingDelayMs ?? 800;

  const [remaining, setRemaining] = useState<number | null>(null);
  const reloadedRef = useRef(false);

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
    if (reloadedRef.current) return;
    reloadedRef.current = true;

    // reset timer start so next load starts fresh 60 minutes
    sessionStorage.removeItem(STORAGE_KEY);
    const now = Date.now();
    sessionStorage.setItem(STORAGE_KEY, String(now));

    window.location.reload();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let start = getStartTime();

    const updateRemaining = async () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const r = Math.max(TIMER_DURATION - elapsed, 0);
      setRemaining(r);

      if (r <= 0) {
        if (reloadedRef.current) return;

        // show loading overlay FIRST
        onExpireStartLoadingRef.current?.();

        // let user see loading briefly
        await new Promise((res) => setTimeout(res, loadingDelayMsRef.current));

        // clear + reload
        try {
          onExpireRef.current?.();
        } finally {
          restartAndReload();
        }
      }
    };

    void updateRemaining();
    const interval = setInterval(() => {
      void updateRemaining();
    }, 1000);

    const onStorageReset = () => {
      start = getStartTime();
      void updateRemaining();
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

  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart( 2, "0" )}`;

  return { remaining, display, resetTimer };
}