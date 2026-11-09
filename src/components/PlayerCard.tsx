import type { Player } from "../types";
import { getRarityFromRating } from "../data/rarity";

type PlayerCardProps = {
  player: Player;
};

export default function PlayerCard({ player }: PlayerCardProps) {
  const rarity = player.rarity ?? getRarityFromRating(player.rating);

  return (
    <article className={`fut-card fut-${rarity}`}>
      {/* الجزء العلوي: التقييم والمركز والجنسية */}
      <div className="fut-top">
        <div className="fut-rating-pos">
          <span className="fut-rating">{player.rating}</span>
          <span className="fut-pos">{player.position}</span>
        </div>
        {player.nationality && (
          <div className="fut-nation">{player.nationality}</div>
        )}
      </div>

      {/* صورة اللاعب أو شكل افتراضي */}
      <div className="fut-photo">
        {player.photoUrl ? (
          <img 
            src={player.photoUrl} 
            alt={player.name} 
            onError={(e) => {
              // لو الصورة ضربت، نخفيها ونظهر الشكل الافتراضي
              (e.currentTarget as HTMLImageElement).style.display = "none";
              (e.currentTarget.nextSibling as HTMLElement).style.display = "flex";
            }}
          />
        ) : null}
        {/* الشكل الافتراضي (رأس لاعب) - بيظهر لو مفيش صورة أو الصورة ضربت */}
        <div className="fut-photo-fallback" style={{ display: player.photoUrl ? "none" : "flex" }}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="60%" height="60%">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      {/* اسم اللاعب */}
      <div className="fut-name">{player.name}</div>

      {/* الإحصائيات */}
      {player.stats && (
        <div className="fut-stats">
          <div className="stat-col">
            <span>PAC</span>
            <strong>{player.stats.pace}</strong>
          </div>
          <div className="stat-col">
            <span>SHO</span>
            <strong>{player.stats.shooting}</strong>
          </div>
          <div className="stat-col">
            <span>PAS</span>
            <strong>{player.stats.passing}</strong>
          </div>
          <div className="stat-col">
            <span>DRI</span>
            <strong>{player.stats.dribbling}</strong>
          </div>
          <div className="stat-col">
            <span>DEF</span>
            <strong>{player.stats.defending}</strong>
          </div>
          <div className="stat-col">
            <span>PHY</span>
            <strong>{player.stats.physical}</strong>
          </div>
        </div>
      )}
    </article>
  );
}