export type Page = "home" | "quiz" | "team" | "packs" | "settings";

export type Rarity = "bronze" | "silver" | "gold" | "icon";

export type Player = {
  id: string;
  name: string;
  position: string;
  rating: number;
  rarity: Rarity;
};

export type Formation = "4-3-3" | "4-4-2" | "4-2-3-1";

export type Slot = {
  id: string;
  position: string;
  x: number;
  y: number;
};

export type Squad = {
  formation: Formation;
  assignments: Record<string, string | null>;
};

export type PityState = {
  packsSinceGold: number;
  packsSinceIcon: number;
};

export type PackResult =
  | { type: "new"; player: Player; pityTriggered?: "gold" | "icon" }
  | {
      type: "duplicate";
      player: Player;
      coins: number;
      pityTriggered?: "gold" | "icon";
    }
  | { type: "error"; message: string };

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