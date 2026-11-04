import type { DailyState, MissionId } from "../types";

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function emptyProgress(): Record<MissionId, number> {
  return {
    "play-quiz": 0,
    "correct-answers": 0,
    "open-pack": 0,
    "open-packs-3": 0,
    "high-score": 0,
  };
}

export function emptyClaimed(): Record<MissionId, boolean> {
  return {
    "play-quiz": false,
    "correct-answers": false,
    "open-pack": false,
    "open-packs-3": false,
    "high-score": false,
  };
}

export function createInitialDailyState(): DailyState {
  const today = todayKey();
  return {
    dateKey: today,
    progress: emptyProgress(),
    claimed: emptyClaimed(),
    streak: 1,
    lastVisitDate: today,
    loginClaimed: false,
  };
}

/** لو اليوم اتغير، رجّع حالة جديدة — غير كده رجّع نفس المرجع */
export function refreshDailyState(current: DailyState): DailyState {
  const today = todayKey();
  if (current.dateKey === today) return current;

  const wasYesterday = current.lastVisitDate === yesterdayKey();
  const newStreak = wasYesterday ? current.streak + 1 : 1;

  return {
    dateKey: today,
    progress: emptyProgress(),
    claimed: emptyClaimed(),
    streak: newStreak,
    lastVisitDate: today,
    loginClaimed: false,
  };
}