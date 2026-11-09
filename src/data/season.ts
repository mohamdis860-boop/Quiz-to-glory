import type { SeasonTier } from "../types";

export const SEASON_NAME = "Season 1: Winter Clash";
export const SEASON_END_DATE = "2027-01-01";

export const SEASON_TIERS: SeasonTier[] = [
  { level: 1, xpRequired: 100, reward: { type: "coins", amount: 100 } },
  { level: 2, xpRequired: 250, reward: { type: "coins", amount: 200 } },
  { level: 3, xpRequired: 500, reward: { type: "pack", packType: "silver" } },
  { level: 4, xpRequired: 800, reward: { type: "coins", amount: 500 } },
  { level: 5, xpRequired: 1200, reward: { type: "player", rarity: "gold" } },
  { level: 6, xpRequired: 1700, reward: { type: "pack", packType: "gold" } },
  { level: 7, xpRequired: 2300, reward: { type: "coins", amount: 1000 } },
  { level: 8, xpRequired: 3000, reward: { type: "player", rarity: "icon" } },
  { level: 9, xpRequired: 4000, reward: { type: "pack", packType: "icon" } },
  { level: 10, xpRequired: 5000, reward: { type: "coins", amount: 5000 } },
];