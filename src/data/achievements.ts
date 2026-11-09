import type {
  AchievementId,
  DailyState,
  Player,
  Squad,
  Stats,
} from "../types";
import { getRarityFromRating } from "./rarity";

export type AchievementContext = {
  stats: Stats;
  players: Player[];
  daily: DailyState;
  packsOpened: number;
  squad: Squad;
};

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  reward: number;
  goal: number;
  getProgress: (ctx: AchievementContext) => number;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-quiz",
    title: "First Steps",
    description: "Complete your first quiz",
    icon: "🎓",
    reward: 50,
    goal: 1,
    getProgress: (ctx) => Math.min(ctx.stats.quizzesCompleted, 1),
  },
  {
    id: "first-pack",
    title: "Unboxer",
    description: "Open your first pack",
    icon: "📦",
    reward: 30,
    goal: 1,
    getProgress: (ctx) => Math.min(ctx.packsOpened, 1),
  },
  {
    id: "perfect-quiz",
    title: "Perfect Mind",
    description: "Score 10/10 in a single quiz",
    icon: "💎",
    reward: 500,
    goal: 1,
    getProgress: (ctx) => (ctx.stats.bestQuizScore >= 10 ? 1 : 0),
  },
  {
    id: "sniper",
    title: "Sniper",
    description: "Answer 50 questions correctly",
    icon: "🎯",
    reward: 150,
    goal: 50,
    getProgress: (ctx) => Math.min(ctx.stats.correctAnswers, 50),
  },
  {
    id: "sharpshooter",
    title: "Sharpshooter",
    description: "Answer 100 questions correctly",
    icon: "🏹",
    reward: 400,
    goal: 100,
    getProgress: (ctx) => Math.min(ctx.stats.correctAnswers, 100),
  },
  {
    id: "pack-rat",
    title: "Pack Rat",
    description: "Open 10 packs",
    icon: "🃏",
    reward: 100,
    goal: 10,
    getProgress: (ctx) => Math.min(ctx.packsOpened, 10),
  },
  {
    id: "collector",
    title: "Collector",
    description: "Open 50 packs",
    icon: "🎁",
    reward: 500,
    goal: 50,
    getProgress: (ctx) => Math.min(ctx.packsOpened, 50),
  },
  {
    id: "golden-touch",
    title: "Golden Touch",
    description: "Collect your first Gold+ player",
    icon: "✨",
    reward: 150,
    goal: 1,
    getProgress: (ctx) =>
      ctx.players.some((p) => {
        const r = p.rarity ?? getRarityFromRating(p.rating);
        return r === "gold" || r === "icon";
      })
        ? 1
        : 0,
  },
  {
    id: "legendary",
    title: "Legendary",
    description: "Collect your first Icon player",
    icon: "👑",
    reward: 500,
    goal: 1,
    getProgress: (ctx) =>
      ctx.players.some((p) => {
        const r = p.rarity ?? getRarityFromRating(p.rating);
        return r === "icon";
      })
        ? 1
        : 0,
  },
  {
    id: "team-builder",
    title: "Team Builder",
    description: "Fill all 11 starting positions",
    icon: "🏟️",
    reward: 200,
    goal: 11,
    getProgress: (ctx) =>
      Math.min(
        Object.values(ctx.squad.assignments).filter(Boolean).length,
        11
      ),
  },
  {
    id: "squad-complete",
    title: "Squad Complete",
    description: "Collect 25 players",
    icon: "👥",
    reward: 300,
    goal: 25,
    getProgress: (ctx) => Math.min(ctx.players.length, 25),
  },
  {
    id: "veteran",
    title: "Veteran",
    description: "Complete 10 quizzes",
    icon: "🎖️",
    reward: 300,
    goal: 10,
    getProgress: (ctx) => Math.min(ctx.stats.quizzesCompleted, 10),
  },
  {
    id: "streak-master",
    title: "Streak Master",
    description: "Reach a 7-day login streak",
    icon: "🔥",
    reward: 400,
    goal: 7,
    getProgress: (ctx) => Math.min(ctx.stats.highestStreak, 7),
  },
];

export function getAchievement(id: AchievementId): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}