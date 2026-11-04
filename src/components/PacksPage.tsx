import { useState } from "react";
import type { PackResult, PityState, Player } from "../types";
import {
  PITY_GOLD_THRESHOLD,
  PITY_ICON_THRESHOLD,
} from "../data/rarity";
import PlayerCard from "./PlayerCard";

type PacksPageProps = {
  coins: number;
  packsOpened: number;
  pity: PityState;
  onBack: () => void;
  onOpenPack: () => PackResult;
  onPackOpened: () => void;
};

type LastPull = {
  player: Player;
  duplicate: boolean;
  coins: number;
  pityTriggered: "gold" | "icon" | null;
};

export default function PacksPage({
  coins,
  packsOpened,
  pity,
  onBack,
  onOpenPack,
  onPackOpened,
}: PacksPageProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState("");
  const [lastPull, setLastPull] = useState<LastPull | null>(null);

  const goldRemaining = PITY_GOLD_THRESHOLD - pity.packsSinceGold;
  const iconRemaining = PITY_ICON_THRESHOLD - pity.packsSinceIcon;

  function handleOpenPack() {
    setError("");
    setLastPull(null);
    setIsOpening(true);

    // بنعمل تأخير ثانية ونص عشان يبان أنيميشن فتح الباك
    setTimeout(() => {
      const result = onOpenPack();
      setIsOpening(false);

      if (result.type === "error") {
        setError(result.message);
        return;
      }

      onPackOpened();

      const pityTriggered = result.pityTriggered ?? null;
      if (result.type === "duplicate") {
        setLastPull({
          player: result.player,
          duplicate: true,
          coins: result.coins,
          pityTriggered,
        });
      } else {
        setLastPull({
          player: result.player,
          duplicate: false,
          coins: 0,
          pityTriggered,
        });
      }
    }, 1500); // ثانية ونص
  }

  return (
    <section className="subpage">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>
      <p className="eyebrow">YOUR NEXT STAR IS WAITING</p>
      <h1>Player Packs 🃏</h1>

      <div className="pack-panel">
        {/* شاشة عرض النتيجة (لما الباك يتفتح) */}
        {lastPull ? (
          <div className="pack-reveal-container">
            <h2 className="reveal-title">
              {lastPull.duplicate ? "Duplicate Player!" : "New Player Unlocked!"}
            </h2>
            
            <div className="pack-result-large">
              <PlayerCard player={lastPull.player} />
            </div>

            {lastPull.duplicate && (
              <p className="feedback feedback-error">
                You already have {lastPull.player.name}. Auto-sold for 🪙 {lastPull.coins}!
              </p>
            )}
            {lastPull.pityTriggered && (
              <span className="pity-badge" style={{ marginTop: '10px', display: 'inline-block' }}>
                🛡️ PITY TRIGGERED · {lastPull.pityTriggered.toUpperCase()}
              </span>
            )}

            <button className="primary-button" onClick={() => setLastPull(null)} style={{ marginTop: '20px' }}>
              Open Another Pack
            </button>
          </div>
        ) : (
          /* شاشة فتح الباك الأساسية */
          <>
            <div className={`pack-art ${isOpening ? "pack-opening-anim" : ""}`}>
              {isOpening ? "✨ ⚡ ✨" : "✨🃏✨"}
            </div>
            
            <h2>Starter Player Pack</h2>
            <p>Discover a new player to add to your collection.</p>
            <p className="pack-price">🪙 100 coins</p>
            <p className="small-note">Your balance: 🪙 {coins.toLocaleString()}</p>
            
            <button 
              className="primary-button" 
              onClick={handleOpenPack} 
              disabled={isOpening}
              style={{ opacity: isOpening ? 0.5 : 1 }}
            >
              {isOpening ? "Opening..." : "Open Pack"}
            </button>

            {error && <p className="feedback feedback-error">{error}</p>}
            <p className="small-note">Packs opened: {packsOpened}</p>
          </>
        )}

        {/* شريط الـ Pity */}
        <div className="pity-panel">
          <p className="pity-title">🛡️ Pity Protection</p>
          <div className="pity-row">
            <span className="pity-label">Gold+</span>
            <div className="pity-bar">
              <div
                className="pity-fill pity-fill-gold"
                style={{ width: `${(pity.packsSinceGold / PITY_GOLD_THRESHOLD) * 100}%` }}
              />
            </div>
            <span className="pity-count">
              {goldRemaining === 1 ? "Next!" : `${goldRemaining} packs`}
            </span>
          </div>
          <div className="pity-row">
            <span className="pity-label">Icon</span>
            <div className="pity-bar">
              <div
                className="pity-fill pity-fill-icon"
                style={{ width: `${(pity.packsSinceIcon / PITY_ICON_THRESHOLD) * 100}%` }}
              />
            </div>
            <span className="pity-count">
              {iconRemaining === 1 ? "Next!" : `${iconRemaining} packs`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}