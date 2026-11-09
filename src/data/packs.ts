import type { PackType, Rarity } from "../types";

export type PackConfig = {
  id: PackType;
  name: string;
  cost: number;
  icon: string;
  desc: string;
  odds: Record<Rarity, number>;
};

export const PACKS: Record<PackType, PackConfig> = {
  bronze: {
    id: "bronze",
    name: "Bronze Pack",
    cost: 50,
    icon: "🥉",
    desc: "Cheap pack. Mostly Bronze players.",
    odds: { bronze: 80, silver: 20, gold: 0, icon: 0 },
  },
  silver: {
    id: "silver",
    name: "Silver Pack",
    cost: 250,
    icon: "🥈",
    desc: "Better odds. Silver & Gold players.",
    odds: { bronze: 10, silver: 70, gold: 20, icon: 0 },
  },
  gold: {
    id: "gold",
    name: "Gold Pack",
    cost: 1000,
    icon: "🥇",
    desc: "High chance of Gold. Rare Icon chance.",
    odds: { bronze: 0, silver: 20, gold: 78, icon: 2 }, // بيستخدم نظام الـ Pity برضه
  },
  icon: {
    id: "icon",
    name: "Icon Pack",
    cost: 5000,
    icon: "👑",
    desc: "Guaranteed Icon player. For the big spenders!",
    odds: { bronze: 0, silver: 0, gold: 0, icon: 100 },
  },
};

export function rollRarityForPack(odds: Record<Rarity, number>): Rarity {
  const total = Object.values(odds).reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  
  for (const [rarity, weight] of Object.entries(odds)) {
    if (weight === 0) continue;
    roll -= weight;
    if (roll <= 0) return rarity as Rarity;
  }
  return "bronze";
}