import type { Player, PityState, Rarity } from "../types";
import { generateId } from "../utils/id";
import { PLAYER_NAMES } from "./names";

export type RarityConfig = {
  label: string;
  minRating: number;
  maxRating: number;
  weight: number;
};

export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  bronze: { label: "Bronze", minRating: 65, maxRating: 74, weight: 55 },
  silver: { label: "Silver", minRating: 75, maxRating: 79, weight: 28 },
  gold:   { label: "Gold",   minRating: 80, maxRating: 84, weight: 14 },
  icon:   { label: "Icon",   minRating: 85, maxRating: 95, weight: 3 },
};

export const RARITY_ORDER: Rarity[] = ["bronze", "silver", "gold", "icon"];

export const SELL_VALUES: Record<Rarity, number> = {
  bronze: 10,
  silver: 30,
  gold: 100,
  icon: 400,
};

/** عدد الباكات اللي بعدها الباك مضمون */
export const PITY_GOLD_THRESHOLD = 10;
export const PITY_ICON_THRESHOLD = 50;

export const INITIAL_PITY: PityState = {
  packsSinceGold: 0,
  packsSinceIcon: 0,
};

/** اختيار rarity عشوائيًا بناءً على الأوزان */
export function rollRarity(): Rarity {
  const total = RARITY_ORDER.reduce(
    (sum, r) => sum + RARITY_CONFIG[r].weight,
    0
  );
  let roll = Math.random() * total;
  for (const rarity of RARITY_ORDER) {
    roll -= RARITY_CONFIG[rarity].weight;
    if (roll <= 0) return rarity;
  }
  return "bronze";
}

/** الـ roll مع تطبيق Pity Protection */
export function rollWithPity(pity: PityState): {
  rarity: Rarity;
  newPity: PityState;
  pityTriggered: "gold" | "icon" | null;
} {
  let rarity: Rarity;
  let pityTriggered: "gold" | "icon" | null = null;

  if (pity.packsSinceIcon >= PITY_ICON_THRESHOLD - 1) {
    rarity = "icon";
    pityTriggered = "icon";
  } else if (pity.packsSinceGold >= PITY_GOLD_THRESHOLD - 1) {
    rarity = "gold";
    pityTriggered = "gold";
  } else {
    rarity = rollRarity();
  }

  const newPity = { ...pity };
  if (rarity === "icon") {
    newPity.packsSinceGold = 0;
    newPity.packsSinceIcon = 0;
  } else if (rarity === "gold") {
    newPity.packsSinceGold = 0;
    newPity.packsSinceIcon += 1;
  } else {
    newPity.packsSinceGold += 1;
    newPity.packsSinceIcon += 1;
  }

  return { rarity, newPity, pityTriggered };
}

/** استنتاج الـ rarity من تقييم اللاعب (للبيانات الأولية) */
export function getRarityFromRating(rating: number): Rarity {
  for (const rarity of [...RARITY_ORDER].reverse()) {
    const { minRating } = RARITY_CONFIG[rarity];
    if (rating >= minRating) return rarity;
  }
  return "bronze";
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const POSITIONS = ["GK", "LB", "CB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"];

/** توليد لاعب جديد عشوائي (أو بـ rarity محدّدة) */
export function createRandomPlayer(rarity?: Rarity): Player {
  const actualRarity = rarity ?? rollRarity();
  const { minRating, maxRating } = RARITY_CONFIG[actualRarity];
  return {
    id: generateId(),
    name: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)],
    position: POSITIONS[Math.floor(Math.random() * POSITIONS.length)],
    rating: randomInt(minRating, maxRating),
    rarity: actualRarity,
  };
}