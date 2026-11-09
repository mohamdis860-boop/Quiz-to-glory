import { useCallback, useEffect, useMemo } from "react";
import type { DailyState, MissionId } from "../types";
import { useLocalStorage } from "./useLocalStorage";
import { createInitialDailyState, refreshDailyState } from "../utils/daily";

export function useDailyState(storageKey = "qtg:daily") {
  const [raw, setRaw] = useLocalStorage<DailyState>(
    storageKey,
    createInitialDailyState()
  );

  const state = useMemo(() => refreshDailyState(raw), [raw]);

  // احفظ الحالة المحدّثة لو اليوم اتغير
  useEffect(() => {
    if (state !== raw) setRaw(state);
  }, [state, raw, setRaw]);

  // لمسة احتياطية: لو التاب فضل مفتوح عبر نص الليل
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") {
        setRaw((prev) => refreshDailyState(prev));
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [setRaw]);

  const update = useCallback(
    (fn: (prev: DailyState) => DailyState) => {
      setRaw((prev) => fn(refreshDailyState(prev)));
    },
    [setRaw]
  );

  const trackProgress = useCallback(
    (id: MissionId, amount = 1) => {
      update((prev) => ({
        ...prev,
        progress: {
          ...prev.progress,
          [id]: prev.progress[id] + amount,
        },
      }));
    },
    [update]
  );

  return { daily: state, update, trackProgress };
}