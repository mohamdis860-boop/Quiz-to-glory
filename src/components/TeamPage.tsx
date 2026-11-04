import { useMemo, useState } from "react";
import type { Player, Squad } from "../types";
import { FORMATIONS } from "../data/formations";
import { SELL_VALUES, getRarityFromRating } from "../data/rarity";
import {
  calculateSquadRating,
  calculateChemistry,
  countStarters,
  positionChemistry,
  getPlayerById,
  createAutoSquad,
  POSITION_GROUPS,
} from "../utils/squad";

type TeamPageProps = {
  players: Player[];
  squad: Squad;
  onSquadChange: (updater: (prev: Squad) => Squad) => void;
  onSellPlayer: (playerId: string) => number;
  onBack: () => void;
};

type RarityFilter = "all" | "bronze" | "silver" | "gold" | "icon";
type PositionFilter = "all" | "GK" | "DEF" | "MID" | "ATT";
type SortBy = "rating-desc" | "rating-asc" | "rarity-desc" | "name-asc";

export default function TeamPage({
  players,
  squad,
  onSquadChange,
  onSellPlayer,
  onBack,
}: TeamPageProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("rating-desc");
  const [sellFeedback, setSellFeedback] = useState("");

  const slots = FORMATIONS[squad.formation];
  const starterIds = new Set(
    Object.values(squad.assignments).filter(Boolean) as string[]
  );
  const bench = players.filter((p) => !starterIds.has(p.id));

  const filteredBench = useMemo(() => {
    const rarityOf = (p: Player) => p.rarity ?? getRarityFromRating(p.rating);
    const filtered = bench.filter((p) => {
      if (rarityFilter !== "all" && rarityOf(p) !== rarityFilter) return false;
      if (positionFilter !== "all") {
        const group = POSITION_GROUPS[positionFilter];
        if (!group || !group.includes(p.position)) return false;
      }
      return true;
    });

    const rarityOrder: Record<string, number> = {
      bronze: 1,
      silver: 2,
      gold: 3,
      icon: 4,
    };

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "rating-desc":
          return b.rating - a.rating;
        case "rating-asc":
          return a.rating - b.rating;
        case "rarity-desc":
          return rarityOrder[rarityOf(b)] - rarityOrder[rarityOf(a)];
        case "name-asc":
          return a.name.localeCompare(b.name);
      }
    });
  }, [bench, rarityFilter, positionFilter, sortBy]);

  const rating = calculateSquadRating(squad, players);
  const chemistry = calculateChemistry(squad, players);
  const starters = countStarters(squad);

  function handleSlotClick(slotId: string) {
    const currentPlayerId = squad.assignments[slotId];

    if (selectedPlayerId) {
      onSquadChange((prev) => {
        const assignments = { ...prev.assignments };
        for (const sid of Object.keys(assignments)) {
          if (assignments[sid] === selectedPlayerId) assignments[sid] = null;
        }
        assignments[slotId] = selectedPlayerId;
        return { ...prev, assignments };
      });
      setSelectedPlayerId(null);
    } else if (currentPlayerId) {
      onSquadChange((prev) => ({
        ...prev,
        assignments: { ...prev.assignments, [slotId]: null },
      }));
    }
  }

  function handlePlayerClick(playerId: string) {
    setSellFeedback("");
    setSelectedPlayerId((prev) => (prev === playerId ? null : playerId));
  }

  function handleSell(p: Player) {
    const value = SELL_VALUES[p.rarity ?? getRarityFromRating(p.rating)];
    const ok = window.confirm(
      `Sell ${p.name} (${p.rating} OVR, ${p.position}) for 🪙 ${value}?`
    );
    if (!ok) return;

    const earned = onSellPlayer(p.id);
    setSellFeedback(`Sold ${p.name} for 🪙 ${earned}.`);
    if (selectedPlayerId === p.id) setSelectedPlayerId(null);
  }

  function autoFill() {
    onSquadChange((prev) => {
      const auto = createAutoSquad(prev.formation, players);
      const merged = { ...auto.assignments };
      for (const [slotId, playerId] of Object.entries(prev.assignments)) {
        if (playerId) merged[slotId] = playerId;
      }
      return { ...prev, assignments: merged };
    });
  }

  return (
    <section className="subpage">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>
      <p className="eyebrow">YOUR PLAYERS, YOUR LEGACY</p>
      <h1>My Team 🏆</h1>

      <div className="squad-summary">
        <div className="summary-item">
          <span className="summary-label">Rating</span>
          <strong className="summary-value">{rating}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Chemistry</span>
          <strong className="summary-value">{chemistry}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Starters</span>
          <strong className="summary-value">{starters}/11</strong>
        </div>
      </div>

      <div className="squad-actions">
        <p className="small-note">
          {selectedPlayerId
            ? "Now tap a slot on the pitch to place the player."
            : "Tap a bench player, then a slot. Tap a filled slot to remove."}
        </p>
        <button className="card-button" onClick={autoFill}>
          Auto-fill empty slots
        </button>
      </div>

      <div className="pitch">
        <div className="pitch-lines" aria-hidden="true">
          <div className="pitch-center-line" />
          <div className="pitch-circle" />
          <div className="pitch-box pitch-box-top" />
          <div className="pitch-box pitch-box-bottom" />
        </div>

        {slots.map((slot) => {
          const player = getPlayerById(players, squad.assignments[slot.id]);
          const rarity = player
            ? player.rarity ?? getRarityFromRating(player.rating)
            : null;
          const chem = player
            ? positionChemistry(slot.position, player.position)
            : null;
          const isSelected = player?.id === selectedPlayerId;

          return (
            <button
              key={slot.id}
              className={`pitch-slot ${
                player ? `filled rarity-${rarity}` : "empty"
              } ${isSelected ? "selected" : ""}`}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              onClick={() => handleSlotClick(slot.id)}
              title={
                player
                  ? `${player.name} (${player.position}) — ${chem}% chemistry`
                  : `Empty ${slot.position} slot`
              }
            >
              {player ? (
                <>
                  <span className="slot-rating">{player.rating}</span>
                  <span className="slot-name">{player.name}</span>
                  <span className="slot-position">{player.position}</span>
                  {chem !== null && (
                    <span className={`slot-chem chem-${chem}`}>{chem}</span>
                  )}
                </>
              ) : (
                <span className="slot-position-empty">{slot.position}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="bench-section">
        <div className="bench-header">
          <h2>
            Bench · {filteredBench.length}
            {filteredBench.length !== bench.length && ` / ${bench.length}`}
          </h2>
          {selectedPlayerId && (
            <button
              className="bench-cancel"
              onClick={() => setSelectedPlayerId(null)}
            >
              Cancel selection
            </button>
          )}
        </div>

        <div className="bench-controls">
          <div className="filter-group">
            <span className="filter-label">Rarity</span>
            <div className="filter-chips">
              {(["all", "bronze", "silver", "gold", "icon"] as const).map((r) => (
                <button
                  key={r}
                  className={`filter-chip ${
                    rarityFilter === r ? "active" : ""
                  }`}
                  onClick={() => setRarityFilter(r)}
                >
                  {r === "all" ? "All" : r[0].toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Position</span>
            <div className="filter-chips">
              {(["all", "GK", "DEF", "MID", "ATT"] as const).map((p) => (
                <button
                  key={p}
                  className={`filter-chip ${
                    positionFilter === p ? "active" : ""
                  }`}
                  onClick={() => setPositionFilter(p)}
                >
                  {p === "all" ? "All" : p}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Sort</span>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="rating-desc">Rating ↓</option>
              <option value="rating-asc">Rating ↑</option>
              <option value="rarity-desc">Rarity ↓</option>
              <option value="name-asc">Name (A–Z)</option>
            </select>
          </div>
        </div>

        {sellFeedback && <p className="sell-feedback">{sellFeedback}</p>}

        {bench.length === 0 ? (
          <p className="bench-empty">
            All your players are in the starting XI. Open more packs to build
            your squad.
          </p>
        ) : filteredBench.length === 0 ? (
          <p className="bench-empty">
            No players match these filters. Try changing them.
          </p>
        ) : (
          <div className="bench-grid">
            {filteredBench.map((p) => {
              const r = p.rarity ?? getRarityFromRating(p.rating);
              return (
                <div className="bench-item" key={p.id}>
                  <button
                    className={`bench-card rarity-${r} ${
                      selectedPlayerId === p.id ? "selected" : ""
                    }`}
                    onClick={() => handlePlayerClick(p.id)}
                  >
                    <span className="bench-rating">{p.rating}</span>
                    <span className="bench-position">{p.position}</span>
                    <strong className="bench-name">{p.name}</strong>
                  </button>
                  <button
                    className="bench-sell"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSell(p);
                    }}
                    title={`Quick sell for ${SELL_VALUES[r]} coins`}
                    aria-label={`Sell ${p.name}`}
                  >
                    💰
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}