import { useState } from "react";
import type { PackResult, PityState, Player } from "../types";
import {
  RARITY_CONFIG,
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
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [lastPull, setLastPull] = useState<LastPull | null>(null);

  const goldRemaining = PITY_GOLD_THRESHOLD - pity.packsSinceGold;
  const iconRemaining = PITY_ICON_THRESHOLD - pity.packsSinceIcon;

  function handleOpenPack() {
    setError("");
    setFeedback("");

    const result = onOpenPack();

    if (result.type === "error") {
      setError(result.message);
      setLastPull(null);
      return;
    }

    onPackOpened();

    const pityTriggered = result.pityTriggered ?? null;

    if (result.type === "duplicate") {
      setFeedback(
        `Duplicate! You already have ${result.player.name}. Auto-sold for 🪙 ${result.coins}.`
      );
      setLastPull({
        player: result.player,
        duplicate: true,
        coins: result.coins,
        pityTriggered,
      });
      return;
    }

    const rarityLabel = RARITY_CONFIG[result.player.rarity].label;
    const pityText = pityTriggered
      ? ` 🛡️ Pity triggered! Guaranteed ${
          pityTriggered === "icon" ? "Icon" : "Gold"
        }.`
      : "";
    setFeedback(
      `You pulled a ${rarityLabel} ${result.player.position} — ${result.player.name} (${result.player.rating} OVR)!${pityText}`
    );
    setLastPull({
      player: result.player,
      duplicate: false,
      coins: 0,
      pityTriggered,
    });
  }

  return (
    <section className="subpage">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>
      <p className="eyebrow">YOUR NEXT STAR IS WAITING</p>
      <h1>Player Packs 🃏</h1>

      <div className="pack-panel">
        <div className="pack-art">✨🃏✨</div>
        <h2>Starter Player Pack</h2>
        <p>Discover a new player to add to your collection.</p>
        <p className="pack-price">🪙 100 coins</p>
        <p className="small-note">Your balance: 🪙 {coins.toLocaleString()}</p>
        <button className="primary-button" onClick={handleOpenPack}>
          Open Pack
        </button>
        <p className="small-note">Packs opened: {packsOpened}</p>

        {feedback && <p className="feedback">{feedback}</p>}
        {error && <p className="feedback feedback-error">{error}</p>}

        {lastPull && (
          <div className="pack-result" key={packsOpened}>
            <PlayerCard player={lastPull.player} />
            {lastPull.duplicate && (
              <span className="duplicate-badge">
                DUPLICATE · +🪙 {lastPull.coins}
              </span>
            )}
            {lastPull.pityTriggered && (
              <span className="pity-badge">
                🛡️ PITY · {lastPull.pityTriggered.toUpperCase()}
              </span>
            )}
          </div>
        )}

        <div className="pity-panel">
          <p className="pity-title">🛡️ Pity Protection</p>
          <div className="pity-row">
            <span className="pity-label">Gold+</span>
            <div className="pity-bar">
              <div
                className="pity-fill pity-fill-gold"
                style={{
                  width: `${
                    (pity.packsSinceGold / PITY_GOLD_THRESHOLD) * 100
                  }%`,
                }}
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
                style={{
                  width: `${
                    (pity.packsSinceIcon / PITY_ICON_THRESHOLD) * 100
                  }%`,
                }}
              />
            </div>
            <span className="pity-count">
              {iconRemaining === 1 ? "Next!" : `${iconRemaining} packs`}
            </span>
          </div>
          <p className="pity-note">
            Pity counters reset when you pull the corresponding rarity. Icons
            also reset the Gold counter.
          </p>
        </div>

        <div className="rarity-legend">
          <p className="small-note">Base drop rates (before pity)</p>
          <div className="rarity-legend-list">
            {(["icon", "gold", "silver", "bronze"] as const).map((r) => (
              <span key={r} className={`rarity-chip rarity-chip-${r}`}>
                {RARITY_CONFIG[r].label} · {RARITY_CONFIG[r].weight}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}