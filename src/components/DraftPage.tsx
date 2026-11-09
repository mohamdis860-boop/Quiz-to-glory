import { useState } from "react";
import type { Player } from "../types";
import { shuffle } from "../utils/shuffle";
import { playSound } from "../utils/audio";

type DraftPageProps = {
  dbPlayers: Player[];
  onAwardCoins: (amount: number) => void;
  onBack: () => void;
};

const OPPONENTS = ["Real Madrid", "FC Barcelona", "Man City", "Liverpool", "Arsenal", "Bayern Munich"];

// إحداثيات الملعب 4-3-3
const SLOTS = [
  { id: "gk", pos: "GK", x: 50, y: 85 },
  { id: "lb", pos: "LB", x: 15, y: 70 },
  { id: "cb1", pos: "CB", x: 38, y: 75 },
  { id: "cb2", pos: "CB", x: 62, y: 75 },
  { id: "rb", pos: "RB", x: 85, y: 70 },
  { id: "cm1", pos: "CM", x: 25, y: 50 },
  { id: "cm2", pos: "CM", x: 50, y: 55 },
  { id: "cm3", pos: "CM", x: 75, y: 50 },
  { id: "lw", pos: "LW", x: 20, y: 25 },
  { id: "st", pos: "ST", x: 50, y: 15 },
  { id: "rw", pos: "RW", x: 80, y: 25 },
];

// دالة لتحديد المركز العام للاعب عشان الفلترة
const getPositionGroup = (pos: string) => {
  if (pos === "GK") return "GK";
  if (["CB", "LB", "RB"].includes(pos)) return "DEF";
  if (["CDM", "CM", "CAM"].includes(pos)) return "MID";
  if (["LW", "RW", "ST"].includes(pos)) return "ATT";
  return "MID";
};

export default function DraftPage({ dbPlayers, onAwardCoins, onBack }: DraftPageProps) {
  const [gameState, setGameState] = useState<"lobby" | "drafting" | "review" | "result">("lobby");
  const [pool, setPool] = useState<Player[]>([]);
  const [currentOptions, setCurrentOptions] = useState<Player[]>([]);
  const [draftedPlayers, setDraftedPlayers] = useState<Player[]>([]); // هنا بنحفظ اللاعيبة
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [rerollsLeft, setRerollsLeft] = useState(2);

  const [opponent, setOpponent] = useState("");
  const [matchScore, setMatchScore] = useState({ my: 0, opp: 0 });
  const [reward, setReward] = useState(0);

  function startDraft() {
    if (dbPlayers.length < 50) {
      alert("Not enough players in database to start a draft!");
      return;
    }
    const shuffled = shuffle(dbPlayers);
    generateOptions(0, [], shuffled);
    setDraftedPlayers([]);
    setCurrentSlotIndex(0);
    setRerollsLeft(2);
    setGameState("drafting");
  }

  function generateOptions(slotIndex: number, drafted: Player[], availablePool?: Player[]) {
    const currentPool = availablePool || pool;
    const slot = SLOTS[slotIndex];
    let targetGroup = getPositionGroup(slot.pos);
    
    // لو الخانة دفاع أو هجوم، بندور على المركز الصح
    let newOptions = currentPool.filter(p => 
      getPositionGroup(p.position) === targetGroup && !drafted.find(d => d.id === p.id)
    ).slice(0, 5);

    // Fallback لو مفيش لاعيبة كفاية
    if (newOptions.length < 5) {
      const extras = currentPool.filter(p => !newOptions.find(o => o.id === p.id) && !drafted.find(d => d.id === p.id)).slice(0, 5 - newOptions.length);
      newOptions = [...newOptions, ...extras];
    }

    setCurrentOptions(newOptions);
    setPool(currentPool.filter(p => !newOptions.find(o => o.id === p.id))); 
  }

  function handlePick(player: Player) {
    playSound("correct");
    const newDrafted = [...draftedPlayers, player];
    setDraftedPlayers(newDrafted);

    const nextIndex = currentSlotIndex + 1;
    if (nextIndex === SLOTS.length) {
      setGameState("review");
      return;
    }

    generateOptions(nextIndex, newDrafted);
    setCurrentSlotIndex(nextIndex);
  }

  function handleReroll() {
    if (rerollsLeft <= 0) return;
    playSound("pack");
    setRerollsLeft(r => r - 1);
    generateOptions(currentSlotIndex, draftedPlayers);
  }

  function calculateFinalRating() {
    if (draftedPlayers.length === 0) return { base: 0, chem: 0, final: 0 };
    const base = Math.round(draftedPlayers.reduce((sum, p) => sum + p.rating, 0) / draftedPlayers.length);
    
    const clubCounts: Record<string, number> = {};
    draftedPlayers.forEach(p => {
      const club = p.club || "Unknown";
      clubCounts[club] = (clubCounts[club] || 0) + 1;
    });

    let chemBoost = 0;
    Object.values(clubCounts).forEach(count => {
      if (count >= 4) chemBoost += 3;
      else if (count === 3) chemBoost += 2;
      else if (count === 2) chemBoost += 1;
    });

    chemBoost = Math.min(chemBoost, 5);
    return { base, chem: chemBoost, final: base + chemBoost };
  }

  function playMatch() {
    setGameState("result");
    const { final } = calculateFinalRating();
    const opponentName = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
    const opponentRating = Math.floor(Math.random() * 15) + 75;
    const playerPower = final + (Math.random() * 10);
    const opponentPower = opponentRating + (Math.random() * 10);

    let myScore = 0;
    let oppScore = 0;
    let earned = 0;

    if (playerPower > opponentPower + 2) {
      myScore = Math.floor(Math.random() * 3) + 2; oppScore = Math.floor(Math.random() * 2);
      earned = 250; playSound("win");
    } else if (playerPower > opponentPower) {
      myScore = Math.floor(Math.random() * 2) + 1; oppScore = Math.floor(Math.random() * 2);
      earned = 150; playSound("win");
    } else {
      myScore = Math.floor(Math.random() * 2); oppScore = Math.floor(Math.random() * 3) + 1;
      playSound("wrong");
    }

    onAwardCoins(earned);
    setReward(earned);
    setOpponent(opponentName);
    setMatchScore({ my: myScore, opp: oppScore });
  }

  // ── Lobby Screen ──────────────────────────────────────
  if (gameState === "lobby") {
    return (
      <section className="subpage">
        <button className="back-button" onClick={onBack}>← Back to Home</button>
        <p className="eyebrow">FIFA DRAFT MODE</p>
        <h1>Draft Challenge 🏆</h1>
        <div className="quiz-panel" style={{ textAlign: "center", padding: "50px 20px" }}>
          <div className="result-icon">📋</div>
          <h2>Build your ultimate squad</h2>
          <p style={{ color: "#a8c8eb", marginBottom: "30px" }}>
            Draft exactly 11 players based on a 4-3-3 formation. 
            Fill the pitch, boost your Chemistry, and win up to 250 Coins!
          </p>
          <button className="primary-button" onClick={startDraft}>Start Draft</button>
        </div>
      </section>
    );
  }

  // ── Drafting Screen (With Pitch) ─────────────────────────
  if (gameState === "drafting") {
    const activeSlot = SLOTS[currentSlotIndex];

    return (
      <section className="subpage">
        <div className="draft-header" style={{ padding: "10px 20px", marginBottom: "10px" }}>
          <div>
            <h2>Pick a <span style={{color: "#ffd700"}}>{activeSlot.pos}</span> ({currentSlotIndex + 1}/11)</h2>
          </div>
          <button className="card-button" onClick={handleReroll} disabled={rerollsLeft === 0}>
            🔄 Reroll ({rerollsLeft})
          </button>
        </div>

        {/* الملعب */}
        <div className="draft-pitch-container">
          <div className="draft-pitch-lines">
             <div className="draft-pitch-circle"></div>
             <div className="draft-pitch-box-top"></div>
             <div className="draft-pitch-box-bottom"></div>
          </div>

          {SLOTS.map((slot, idx) => {
            const player = draftedPlayers[idx];
            const isActive = idx === currentSlotIndex;

            return (
              <div 
                key={slot.id} 
                className={`draft-pitch-slot ${player ? `filled rarity-${player.rarity}` : "empty"} ${isActive ? "active" : ""}`}
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              >
                {player ? (
                  <>
                    <span className="d-slot-rating">{player.rating}</span>
                    <span className="d-slot-name">{player.name.split(' ').pop()}</span>
                  </>
                ) : (
                  <span className="d-slot-empty-text">{slot.pos}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* الخيارات المتاحة تحت الملعب */}
        <div className="draft-options-container">
          {currentOptions.map((player) => (
            <button key={player.id} className="draft-option-card" onClick={() => handlePick(player)}>
              <div className={`draft-option-inner rarity-${player.rarity}`}>
                <div className="do-top">
                  <strong>{player.rating}</strong>
                  <span>{player.position}</span>
                </div>
                <div className="do-photo">
                   {player.photoUrl ? <img src={player.photoUrl} alt="" /> : <span>⚽</span>}
                </div>
                <div className="do-name">{player.name.split(' ').pop()}</div>
                <div className="do-club">{player.club}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    );
  }

  // ── Review & Result ─────────────────────────────────────
  if (gameState === "review") {
    const { base, chem, final } = calculateFinalRating();
    return (
      <section className="subpage">
        <p className="eyebrow">YOUR FINAL SQUAD</p>
        <h1>Draft Review</h1>
        <div className="squad-summary" style={{ marginTop: "20px" }}>
          <div className="summary-item">
            <span className="summary-label">Base Rating</span>
            <strong className="summary-value">{base}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Chemistry</span>
            <strong className="summary-value" style={{ color: "#68dca9" }}>+{chem}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Final OVR</span>
            <strong className="summary-value" style={{ color: "#ffd700", fontSize: "26px" }}>{final}</strong>
          </div>
        </div>

        <div className="draft-review-grid">
          {draftedPlayers.map(p => (
             <div key={p.id} className={`draft-review-item rarity-${p.rarity}`}>
               <span>{p.rating} {p.position}</span>
               <strong>{p.name}</strong>
               <p className="small-note" style={{margin: 0, fontSize: "10px"}}>{p.club}</p>
             </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button className="primary-button" style={{ flex: 1 }} onClick={playMatch}>Play Match Now</button>
          <button className="card-button" onClick={startDraft}>Draft Again</button>
        </div>
      </section>
    );
  }

  if (gameState === "result") {
    const isWin = matchScore.my > matchScore.opp;
    return (
      <section className="subpage">
        <p className="eyebrow">DRAFT MATCH RESULT</p>
        <h1>Match Finished</h1>
        <div className="quiz-panel" style={{ textAlign: "center", marginTop: "20px" }}>
          <div className="result-icon">{isWin ? "🏆" : "😢"}</div>
          <h2>{isWin ? "Victory!" : "Defeat"}</h2>
          
          <div className="score-board" style={{ margin: "30px 0" }}>
            <div className="score-team">
              <strong>Your Draft</strong>
              <span className="score-num">{matchScore.my}</span>
            </div>
            <div className="score-divider">-</div>
            <div className="score-team">
              <strong>{opponent}</strong>
              <span className="score-num">{matchScore.opp}</span>
            </div>
          </div>

          {reward > 0 ? <p className="feedback">You earned 🪙 {reward} coins!</p> : <p className="feedback feedback-error">Better luck next time.</p>}
          <button className="primary-button" onClick={startDraft} style={{ marginTop: "20px" }}>Draft Again</button>
        </div>
      </section>
    );
  }

  return null;
}