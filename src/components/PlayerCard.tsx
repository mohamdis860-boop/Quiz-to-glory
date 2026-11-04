import type { Player } from "../types";
import { RARITY_CONFIG, getRarityFromRating } from "../data/rarity";

type PlayerCardProps = {
  player: Player;
};

export default function PlayerCard({ player }: PlayerCardProps) {
  // حماية للبيانات القديمة اللي محفوظة قبل إضافة الـ rarity
  const rarity = player.rarity ?? getRarityFromRating(player.rating);

  return (
    <article className={`player-card rarity-${rarity}`}>
      <span className="player-rating">{player.rating}</span>
      <span className="player-position">{player.position}</span>
      <div className="player-symbol">⚽</div>
      <strong>{player.name}</strong>
      <span className={`player-label rarity-label-${rarity}`}>
        {RARITY_CONFIG[rarity].label}
      </span>
    </article>
  );
}