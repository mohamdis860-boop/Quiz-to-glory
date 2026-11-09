import type { SeasonState } from "../types";
import { SEASON_NAME, SEASON_TIERS } from "../data/season";

type SeasonPageProps = {
  season: SeasonState;
  onClaim: (level: number) => void;
  onBack: () => void;
};

export default function SeasonPage({ season, onClaim, onBack }: SeasonPageProps) {
  let currentLevel = 0;
  let nextLevelXp = SEASON_TIERS[0].xpRequired;
  
  for (let i = 0; i < SEASON_TIERS.length; i++) {
    if (season.xp >= SEASON_TIERS[i].xpRequired) {
      currentLevel = SEASON_TIERS[i].level;
      nextLevelXp = SEASON_TIERS[i + 1]?.xpRequired || SEASON_TIERS[i].xpRequired;
    } else {
      nextLevelXp = SEASON_TIERS[i].xpRequired;
      break;
    }
  }

  const currentXpBase = currentLevel === 0 ? 0 : SEASON_TIERS[currentLevel - 1].xpRequired;
  const xpProgress = season.xp - currentXpBase;
  const xpNeeded = nextLevelXp - currentXpBase;
  const progressPercent = Math.min(100, (xpProgress / xpNeeded) * 100);

  return (
    <section className="subpage">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
        <div>
          <p className="eyebrow">SEASON PASS</p>
          <h1>{SEASON_NAME}</h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="small-note" style={{ margin: 0 }}>Season Ends</span>
          <strong style={{ color: "#ff8a95", display: "block" }}>In 45 Days</strong>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="season-header">
        <div className="season-level">
          <span>Level</span>
          <strong>{currentLevel}</strong>
        </div>
        <div className="season-progress-container">
          <div className="season-bar">
            <div className="season-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="season-xp-text">
            <span>{season.xp} XP</span>
            <span>{nextLevelXp} XP</span>
          </div>
        </div>
      </div>

      {/* Tiers List */}
      <div className="season-tiers">
        {SEASON_TIERS.map((tier) => {
          const isUnlocked = season.xp >= tier.xpRequired;
          const isClaimed = season.claimedLevels.includes(tier.level);
          const canClaim = isUnlocked && !isClaimed;

          return (
            <article
              key={tier.level}
              className={`season-tier-card ${isClaimed ? "claimed" : isUnlocked ? "unlocked" : "locked"}`}
            >
              <div className="tier-level">Lvl {tier.level}</div>
              
              <div className="tier-reward">
                {tier.reward.type === "coins" && (
                  <div className="tier-reward-icon">🪙</div>
                )}
                {tier.reward.type === "pack" && (
                  <div className="tier-reward-icon">🃏</div>
                )}
                {tier.reward.type === "player" && (
                  <div className="tier-reward-icon">⚽</div>
                )}
                
                <span className="tier-reward-text">
                  {tier.reward.type === "coins" && `${tier.reward.amount} Coins`}
                  {tier.reward.type === "pack" && `${tier.reward.packType} Pack`}
                  {tier.reward.type === "player" && `${tier.reward.rarity} Player`}
                </span>
              </div>

              <div className="tier-action">
                {isClaimed ? (
                  <span className="mission-claimed-label">✓ Claimed</span>
                ) : canClaim ? (
                  <button className="primary-button mission-claim" onClick={() => onClaim(tier.level)}>
                    Claim
                  </button>
                ) : (
                  <span className="mission-locked">🔒 {tier.xpRequired} XP</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}