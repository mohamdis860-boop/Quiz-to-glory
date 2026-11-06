import { useState } from "react";
import type { PackResult, PackType, PityState, Player } from "../types";
import { PITY_GOLD_THRESHOLD, PITY_ICON_THRESHOLD } from "../data/rarity";
import { PACKS } from "../data/packs";
import PlayerCard from "./PlayerCard";

type PacksPageProps = {
  coins: number;
  packsOpened: number;
  pity: PityState;
  onBack: () => void;
  onOpenPack: (packType: PackType) => PackResult;
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
  const [activePack, setActivePack] = useState<PackType | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState("");
  const [lastPull, setLastPull] = useState<LastPull | null>(null);

  const goldRemaining = PITY_GOLD_THRESHOLD - pity.packsSinceGold;
  const iconRemaining = PITY_ICON_THRESHOLD - pity.packsSinceIcon;

  function handleOpenPack(packType: PackType) {
    setError("");
    setLastPull(null);
    setActivePack(packType);
    setIsOpening(true);

    setTimeout(() => {
      const result = onOpenPack(packType);
      setIsOpening(false);

      if (result.type === "error") {
        setError(result.message);
        setActivePack(null);
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
    }, 1500);
  }

  // لو فيه باك مفتوح، نعرض شاشة النتيجة
  if (lastPull || isOpening) {
    const pack = activePack ? PACKS[activePack] : PACKS.bronze;

    return (
      <section className="subpage">
        <div className="pack-panel">
          {isOpening ? (
            <div className="pack-reveal-container">
              <div className={`pack-art pack-opening-anim`}>
                {pack.icon} ⚡
              </div>
              <h2>Opening {pack.name}...</h2>
            </div>
          ) : lastPull ? (
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

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button className="primary-button" onClick={() => { setLastPull(null); setActivePack(null); }}>
                  Back to Packs
                </button>
                <button className="card-button" onClick={() => handleOpenPack(pack.id)}>
                  Open Again (🪙 {pack.cost})
                </button>
              </div>
            </div>
          ) : null}

          {error && <p className="feedback feedback-error" style={{ marginTop: '20px' }}>{error}</p>}
        </div>
      </section>
    );
  }

  // شاشة اختيار الباكات
  return (
    <section className="subpage">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>
      <p className="eyebrow">YOUR NEXT STAR IS WAITING</p>
      <h1>Player Packs 🃏</h1>
      
      <p className="small-note" style={{ textAlign: "center", marginBottom: "20px" }}>
        Your balance: 🪙 {coins.toLocaleString()}
      </p>

      <div className="packs-grid">
        {Object.values(PACKS).map((pack) => {
          const canAfford = coins >= pack.cost;
          return (
            <article 
              key={pack.id} 
              className={`pack-store-card pack-store-${pack.id}`}
              style={{ opacity: canAfford ? 1 : 0.5 }}
            >
              <div className="pack-store-icon">{pack.icon}</div>
              <h2>{pack.name}</h2>
              <p>{pack.desc}</p>
              <p className="pack-price">🪙 {pack.cost.toLocaleString()} coins</p>
              <button 
                className="primary-button" 
                onClick={() => handleOpenPack(pack.id)}
                disabled={!canAfford}
              >
                Open Pack
              </button>
            </article>
          );
        })}
      </div>

      <div className="pity-panel" style={{ maxWidth: "600px", margin: "30px auto 0" }}>
        <p className="pity-title">🛡️ Pity Protection (Applies to Gold Pack)</p>
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

      <p className="small-note" style={{ textAlign: "center", marginTop: "20px" }}>
        Packs opened: {packsOpened}
      </p>
    </section>
  );
}