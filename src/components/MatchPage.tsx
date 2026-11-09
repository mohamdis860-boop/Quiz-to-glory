import { useState } from "react";
import type { MatchResult, Player, Squad } from "../types";
import { calculateSquadRating, calculateChemistry } from "../utils/squad";
import { playSound } from "../utils/audio";

type MatchPageProps = {
  players: Player[];
  squad: Squad;
  onAwardCoins: (amount: number) => void;
  onBack: () => void;
};

const OPPONENTS = [
  "Real Madrid", "FC Barcelona", "Man City", "Liverpool", 
  "Arsenal", "Man United", "Chelsea", "Tottenham", 
  "Atletico Madrid", "Newcastle United"
];

export default function MatchPage({ players, squad, onAwardCoins, onBack }: MatchPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);

  const teamRating = calculateSquadRating(squad, players);
  const chemistry = calculateChemistry(squad, players);

  function playMatch() {
    setIsPlaying(true);
    setResult(null);

    setTimeout(() => {
      const opponentName = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
      const opponentRating = Math.floor(Math.random() * 16) + 75; 

      const playerPower = teamRating + (chemistry / 10);
      const opponentPower = opponentRating + (Math.random() * 10);

      let playerScore = 0;
      let opponentScore = 0;
      let outcome: "win" | "draw" | "loss" = "draw";
      let coinsEarned = 0;

      if (playerPower > opponentPower + 3) {
        playerScore = Math.floor(Math.random() * 3) + 3;
        opponentScore = Math.floor(Math.random() * 2);
        outcome = "win";
        coinsEarned = 150;
        playSound("win"); // 👈 تشغيل صوت الفوز
      } else if (playerPower > opponentPower) {
        playerScore = Math.floor(Math.random() * 2) + 2;
        opponentScore = Math.floor(Math.random() * 2);
        outcome = "win";
        coinsEarned = 100;
        playSound("win"); // 👈 تشغيل صوت الفوز
      } else if (playerPower === opponentPower) {
        playerScore = Math.floor(Math.random() * 2) + 1;
        opponentScore = playerScore;
        outcome = "draw";
        coinsEarned = 30;
      } else {
        playerScore = Math.floor(Math.random() * 2);
        opponentScore = Math.floor(Math.random() * 2) + 2;
        outcome = "loss";
        coinsEarned = 0;
      }

      onAwardCoins(coinsEarned);

      setResult({
        playerScore,
        opponentScore,
        opponentName,
        outcome,
        coinsEarned,
      });
      setIsPlaying(false);
    }, 2000); 
  }

  return (
    <section className="subpage">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>
      <p className="eyebrow">TEST YOUR SQUAD</p>
      <h1>Match Simulation ⚽</h1>

      <div className="match-panel">
        <div className="team-powers">
          <div className="power-box">
            <span>Your Team</span>
            <strong>{teamRating} OVR</strong>
            <span className="small-note">Chem: {chemistry}</span>
          </div>
          <div className="vs-badge">VS</div>
          <div className="power-box">
            <span>Opponent</span>
            <strong>???</strong>
            <span className="small-note">Random</span>
          </div>
        </div>

        <div className="match-action">
          {isPlaying ? (
            <div className="match-loading">
              <div className="spinner"></div>
              <p>Match in progress...</p>
            </div>
          ) : result ? (
            <div className="match-result-box">
              <h2>Match Finished!</h2>
              <div className="score-board">
                <div className="score-team">
                  <strong>Your Team</strong>
                  <span className="score-num">{result.playerScore}</span>
                </div>
                <div className="score-divider">-</div>
                <div className="score-team">
                  <strong>{result.opponentName}</strong>
                  <span className="score-num">{result.opponentScore}</span>
                </div>
              </div>
              
              {result.outcome === "win" && (
                <p className="match-msg win">Victory! You earned 🪙 {result.coinsEarned} coins.</p>
              )}
              {result.outcome === "draw" && (
                <p className="match-msg draw">Draw. You earned 🪙 {result.coinsEarned} coins.</p>
              )}
              {result.outcome === "loss" && (
                <p className="match-msg loss">Defeat. Better luck next time!</p>
              )}

              <button className="primary-button" onClick={playMatch} style={{ marginTop: '20px' }}>
                Play Another Match
              </button>
            </div>
          ) : (
            <>
              <p className="small-note" style={{ marginBottom: '15px' }}>
                Play a quick match against a random team. Winning earns you coins!
              </p>
              <button className="primary-button" onClick={playMatch}>
                Play Match Now
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}