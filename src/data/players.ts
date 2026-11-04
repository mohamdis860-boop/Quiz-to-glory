import type { Player } from "../types";
import { getRarityFromRating } from "./rarity";

type BasePlayer = Omit<Player, "rarity">;

const basePlayers: BasePlayer[] = [
  { id: "init-gk",  name: "Goalkeeper", position: "GK", rating: 75 },
  { id: "init-lb",  name: "Left Back",  position: "LB", rating: 72 },
  { id: "init-cb1", name: "Center Back", position: "CB", rating: 74 },
  { id: "init-cb2", name: "Center Back", position: "CB", rating: 73 },
  { id: "init-rb",  name: "Right Back",  position: "RB", rating: 72 },
  { id: "init-cm1", name: "Midfielder", position: "CM", rating: 76 },
  { id: "init-cm2", name: "Midfielder", position: "CM", rating: 74 },
  { id: "init-cm3", name: "Midfielder", position: "CM", rating: 75 },
  { id: "init-lw",  name: "Left Wing",  position: "LW", rating: 78 },
  { id: "init-st",  name: "Striker",    position: "ST", rating: 80 },
  { id: "init-rw",  name: "Right Wing", position: "RW", rating: 77 },
];

export const initialPlayers: Player[] = basePlayers.map((p) => ({
  ...p,
  rarity: getRarityFromRating(p.rating),
}));