import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PackResult, PackType, PityState, Player } from "../types";
import { PITY_GOLD_THRESHOLD, PITY_ICON_THRESHOLD } from "../data/rarity";
import { PACKS } from "../data/packs";
import { playSound } from "../utils/audio";
import { fireConfetti } from "../utils/confetti";
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

      playSound("pack");
      onPackOpened();

      const pityTriggered = result.pityTriggered ?? null;
      if (result.type === "duplicate") {
        setLastPull({ player: result.player, duplicate: true, coins: result.coins, pityTriggered });
      } else {
        setLastPull({ player: result.player, duplicate: false, coins: 0, pityTriggered });
        if (result.player.rarity === "icon" || result.player.rarity === "gold") {
          fireConfetti();
        }
      }
    }, 1500);
  }

  return (
    <section className="subpage">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>
      
      <AnimatePresence mode="wait">
        {lastPull || isOpening ? (
          <motion.div
            key="opening"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4 }}
            className="pack-panel"
          >
            <div className="flip-container">
              <motion.div 
                className="flip-card"
                initial={false}
                animate={{ rotateY: lastPull ? 180 : 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
              >
                <div className="flip-front">
                  <div className={`pack-art ${isOpening ? "pack-opening-anim" : ""}`}>
                    {activePack ? PACKS[activePack].icon : "🎁"} ⚡
                  </div>
                  <h2>Opening {activePack ? PACKS[activePack].name : "Pack"}...</h2>
                </div>

                <div className="flip-back">
                  {lastPull && (
                    <div className="pack-reveal-container">
                      
                      {/* العنوان بيتغير حسب لو مكرر أو جديد */}
                      <h2 className={`reveal-title ${lastPull.duplicate ? "duplicate-title" : ""}`}>
                        {lastPull.duplicate ? "DUPLICATE PLAYER" : "NEW PLAYER!"}
                      </h2>

                      {/* الكارت بيتحط في غلاف عشان نعمله فلتر لو مكرر */}
                      <div className={`reveal-card-wrapper ${lastPull.duplicate ? "is-duplicate" : ""}`}>
                        <div className="pack-result-large">
                          <PlayerCard player={lastPull.player} />
                        </div>
                      </div>

                      {/* بادج البيع */}
                      {lastPull.duplicate && (
                        <div className="sold-banner">
                          <span>Auto-sold for</span>
                          <div className="sold-coins">🪙 {lastPull.coins}</div>
                        </div>
                      )}

                      {lastPull.pityTriggered && !lastPull.duplicate && (
                        <span className="pity-badge">🛡️ PITY · {lastPull.pityTriggered.toUpperCase()}</span>
                      )}

                      {/* الأزرار متظبطة في صف واحد */}
                      <div className="reveal-actions-row">
                        <button className="card-button" onClick={() => { setLastPull(null); setActivePack(null); }}>
                          Back
                        </button>
                        <button className="primary-button" onClick={() => handleOpenPack(activePack!)}>
                          Again (🪙 {activePack ? PACKS[activePack].cost : 0})
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
            {error && <p className="feedback feedback-error" style={{ marginTop: '20px' }}>{error}</p>}
          </motion.div>
        ) : (
          <motion.div
            key="store"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
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
                    <button className="primary-button" onClick={() => handleOpenPack(pack.id)} disabled={!canAfford}>
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
                  <div className="pity-fill pity-fill-gold" style={{ width: `${(pity.packsSinceGold / PITY_GOLD_THRESHOLD) * 100}%` }} />
                </div>
                <span className="pity-count">{goldRemaining === 1 ? "Next!" : `${goldRemaining} packs`}</span>
              </div>
              <div className="pity-row">
                <span className="pity-label">Icon</span>
                <div className="pity-bar">
                  <div className="pity-fill pity-fill-icon" style={{ width: `${(pity.packsSinceIcon / PITY_ICON_THRESHOLD) * 100}%` }} />
                </div>
                <span className="pity-count">{iconRemaining === 1 ? "Next!" : `${iconRemaining} packs`}</span>
              </div>
            </div>

            <p className="small-note" style={{ textAlign: "center", marginTop: "20px" }}>
              Packs opened: {packsOpened}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}