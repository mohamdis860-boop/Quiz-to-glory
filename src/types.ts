// ── Pages ─────────────────────────────────────────────
export type Page =
  | "home"
  | "quiz"
  | "team"
  | "packs"
  | "daily"
  | "achievements"
  | "settings";

// ── Players & Rarity ──────────────────────────────────
export type Rarity = "bronze" | "silver" | "gold" | "icon";

export type Player = {
  id: string;
  name: string;
  position: string;
  rating: number;
  rarity: Rarity;
};

// ── Squad / Formation ─────────────────────────────────
export type Formation = "4-3-3" | "4-4-2" | "4-2-3-1";

export type Slot = {
  id: string;
  position: string;
  x: number; // 0–100
  y: number; // 0–100
};

export type Squad = {
  formation: Formation;
  assignments: Record<string, string | null>; // slotId → playerId
};

// ── Pity System ───────────────────────────────────────
export type PityState = {
  packsSinceGold: number;
  packsSinceIcon: number;
};

// ── Pack results ──────────────────────────────────────
export type PackResult =
  | { type: "new"; player: Player; pityTriggered?: "gold" | "icon" }
  | {
      type: "duplicate";
      player: Player;
      coins: number;
      pityTriggered?: "gold" | "icon";
    }
  | { type: "error"; message: string };

// ── Quiz / Questions ──────────────────────────────────
export type Category =
  | "world-cup"
  | "clubs"
  | "players"
  | "history"
  | "general";

export type Difficulty = "easy" | "medium" | "hard";

export type Question = {
  id: string;
  category: Category;
  difficulty: Difficulty;
  question: string;
  options: string[];
  answer: string;
};

// ── Daily Missions ────────────────────────────────────
export type MissionId =
  | "play-quiz"
  | "correct-answers"
  | "open-pack"
  | "open-packs-3"
  | "high-score";

export type DailyState = {
  dateKey: string;
  progress: Record<MissionId, number>;
  claimed: Record<MissionId, boolean>;
  streak: number;
  lastVisitDate: string;
  loginClaimed: boolean;
};

// ── Stats (for Achievements) ──────────────────────────
export type Stats = {
  quizzesCompleted: number;
  correctAnswers: number;
  bestQuizScore: number;
  highestStreak: number;
};

export const INITIAL_STATS: Stats = {
  quizzesCompleted: 0,
  correctAnswers: 0,
  bestQuizScore: 0,
  highestStreak: 0,
};

// ── Achievements ──────────────────────────────────────
export type AchievementId =
  | "first-quiz"
  | "first-pack"
  | "perfect-quiz"
  | "sniper"
  | "sharpshooter"
  | "pack-rat"
  | "collector"
  | "golden-touch"
  | "legendary"
  | "team-builder"
  | "squad-complete"
  | "veteran"
  | "streak-master";