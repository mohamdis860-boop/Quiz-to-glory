import type { Formation, Player, Squad } from "../types";
import { FORMATIONS } from "../data/formations";

export const POSITION_GROUPS: Record<string, string[]> = {
  GK: ["GK"],
  DEF: ["LB", "CB", "RB"],
  MID: ["CDM", "CM", "CAM"],
  ATT: ["LW", "RW", "ST"],
};

function groupOf(pos: string): string | null {
  for (const [group, positions] of Object.entries(POSITION_GROUPS)) {
    if (positions.includes(pos)) return group;
  }
  return null;
}

export function positionChemistry(slotPos: string, playerPos: string): number {
  if (slotPos === playerPos) return 100;
  const slotGroup = groupOf(slotPos);
  const playerGroup = groupOf(playerPos);
  if (slotGroup && slotGroup === playerGroup) return 75;
  return 50;
}

export function getPlayerById(
  players: Player[],
  id: string | null
): Player | undefined {
  if (!id) return undefined;
  return players.find((p) => p.id === id);
}

export function calculateSquadRating(squad: Squad, players: Player[]): number {
  let sum = 0;
  for (const slotId of Object.keys(squad.assignments)) {
    const p = getPlayerById(players, squad.assignments[slotId]);
    if (p) sum += p.rating;
  }
  return Math.round(sum / 11);
}

export function calculateChemistry(squad: Squad, players: Player[]): number {
  const slots = FORMATIONS[squad.formation];
  let sum = 0;
  for (const slot of slots) {
    const p = getPlayerById(players, squad.assignments[slot.id]);
    if (p) sum += positionChemistry(slot.position, p.position);
  }
  return Math.round(sum / 11);
}

export function countStarters(squad: Squad): number {
  return Object.values(squad.assignments).filter(Boolean).length;
}

export function createEmptySquad(formation: Formation): Squad {
  const assignments: Record<string, string | null> = {};
  for (const slot of FORMATIONS[formation]) assignments[slot.id] = null;
  return { formation, assignments };
}

export function createAutoSquad(formation: Formation, players: Player[]): Squad {
  const squad = createEmptySquad(formation);
  const slots = FORMATIONS[formation];
  const used = new Set<string>();

  // Pass 1: exact position matches
  for (const slot of slots) {
    const match = players.find(
      (p) => !used.has(p.id) && p.position === slot.position
    );
    if (match) {
      squad.assignments[slot.id] = match.id;
      used.add(match.id);
    }
  }

  // Pass 2: fill remaining with best chemistry/rating
  for (const slot of slots) {
    if (squad.assignments[slot.id]) continue;
    const available = players.filter((p) => !used.has(p.id));
    if (available.length === 0) break;
    const best = available
      .map((p) => ({
        player: p,
        chem: positionChemistry(slot.position, p.position),
      }))
      .sort((a, b) => b.chem - a.chem || b.player.rating - a.player.rating)[0];
    squad.assignments[slot.id] = best.player.id;
    used.add(best.player.id);
  }

  return squad;
}