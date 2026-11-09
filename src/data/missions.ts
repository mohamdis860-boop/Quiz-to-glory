import type { MissionId } from "../types";

export type Mission = {
  id: MissionId;
  title: string;
  description: string;
  goal: number;
  reward: number;
  icon: string;
};

export const MISSIONS: Mission[] = [
  {
    id: "play-quiz",
    title: "Play a Quiz",
    description: "Complete one full quiz today",
    goal: 1,
    reward: 20,
    icon: "📝",
  },
  {
    id: "correct-answers",
    title: "Sharp Shooter",
    description: "Answer 5 questions correctly",
    goal: 5,
    reward: 50,
    icon: "🎯",
  },
  {
    id: "open-pack",
    title: "First Pack",
    description: "Open at least one pack",
    goal: 1,
    reward: 25,
    icon: "🃏",
  },
  {
    id: "open-packs-3",
    title: "Pack Hunter",
    description: "Open 3 packs in one day",
    goal: 3,
    reward: 75,
    icon: "✨",
  },
  {
    id: "high-score",
    title: "Perfectionist",
    description: "Score 8+ in a single quiz",
    goal: 1,
    reward: 100,
    icon: "🏆",
  },
];

export const LOGIN_STREAK_REWARDS = [50, 75, 100, 150, 200, 300, 500];

export function getLoginReward(streak: number): number {
  const idx = Math.min(streak - 1, LOGIN_STREAK_REWARDS.length - 1);
  return LOGIN_STREAK_REWARDS[Math.max(0, idx)];
}

export function getMission(id: MissionId): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}