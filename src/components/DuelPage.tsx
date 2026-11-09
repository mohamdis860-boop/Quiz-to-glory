import { useState } from "react";
import { questions } from "../data/questions";
import { shuffle } from "../utils/shuffle";
import { playSound } from "../utils/audio";
import type { Question } from "../types";

type DuelPageProps = {
  onBack: () => void;
  onAwardCoins: (amount: number) => void;
};

const OPPONENTS = ["Messi_10", "CR7_Fan", "PepGuardiola", "Klopp_The_Boss", "Zlatan"];
const TOTAL_ROUNDS = 5;

export default function DuelPage({ onBack, onAwardCoins }: DuelPageProps) {
  const [gameState, setGameState] = useState<"lobby" | "playing" | "results">("lobby");
  const [opponentName, setOpponentName] = useState("");
  
  const [round, setRound] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [reward, setReward] = useState(0);

  function startDuel() {
    setOpponentName(OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)]);
    const newRound = shuffle(questions).slice(0, TOTAL_ROUNDS).map(q => ({ ...q, options: shuffle(q.options) }));
    setRound(newRound);
    setQuestionIndex(0);
    setSelectedAnswer("");
    setFeedback("");
    setMyScore(0);
    setOpponentScore(0);
    setGameState("playing");
  }

  function handleAnswerSubmit() {
    if (!selectedAnswer || feedback) return;

    const currentQ = round[questionIndex];
    const isCorrect = selectedAnswer === currentQ.answer;

    if (isCorrect) {
      playSound("correct");
      setMyScore(s => s + 1);
      setFeedback("Correct! You scored a point.");
    } else {
      playSound("wrong");
      setFeedback(`Wrong! The answer is ${currentQ.answer}.`);
    }

    // محاكاة إجابة الخصم (نسبة نجاحه 60%)
    const opponentIsCorrect = Math.random() < 0.6;
    if (opponentIsCorrect) {
      setOpponentScore(s => s + 1);
    }

    setTimeout(() => {
      if (questionIndex < TOTAL_ROUNDS - 1) {
        setQuestionIndex(i => i + 1);
        setSelectedAnswer("");
        setFeedback("");
      } else {
        endGame(isCorrect, opponentIsCorrect);
      }
    }, 2500); // استنى ثانيتين ونص عشان تشوف إجابة الخصم
  }

  function endGame(myLastPoint: boolean, oppLastPoint: boolean) {
    const finalMyScore = myScore + (myLastPoint ? 1 : 0);
    const finalOppScore = opponentScore + (oppLastPoint ? 1 : 0);
    
    let earned = 0;
    if (finalMyScore > finalOppScore) {
      earned = 200; // مكافأة الفوز
      playSound("win");
    } else if (finalMyScore === finalOppScore) {
      earned = 50;  // مكافأة التعادل
    }

    setReward(earned);
    onAwardCoins(earned);
    setGameState("results");
  }

  // ── Lobby Screen ──────────────────────────────────────
  if (gameState === "lobby") {
    return (
      <section className="subpage">
        <button className="back-button" onClick={onBack}>← Back to Home</button>
        <p className="eyebrow">MULTIPLAYER MODE</p>
        <h1>1v1 Quiz Duel ⚔️</h1>
        <div className="quiz-panel" style={{ textAlign: "center", padding: "50px 20px" }}>
          <div className="result-icon">🎮</div>
          <h2>Ready to face an opponent?</h2>
          <p style={{ color: "#a8c8eb", marginBottom: "30px" }}>
            You will play 5 random questions against a live opponent. 
            Winner takes 200 Coins!
          </p>
          <button className="primary-button" onClick={startDuel}>
            Find Match
          </button>
        </div>
      </section>
    );
  }

  // ── Results Screen ────────────────────────────────────
  if (gameState === "results") {
    const isWin = myScore > opponentScore;
    const isDraw = myScore === opponentScore;

    return (
      <section className="subpage">
        <button className="back-button" onClick={onBack}>← Back to Home</button>
        <p className="eyebrow">MATCH RESULTS</p>
        <h1>Duel Finished</h1>

        <div className="quiz-panel" style={{ textAlign: "center" }}>
          <div className="result-icon">{isWin ? "🏆" : isDraw ? "🤝" : "😢"}</div>
          <h2>{isWin ? "You Won!" : isDraw ? "It's a Draw!" : "You Lost!"}</h2>
          
          <div className="duel-scoreboard" style={{ margin: "30px 0" }}>
            <div className="duel-player">
              <span>You</span>
              <strong>{myScore}</strong>
            </div>
            <div className="duel-vs">VS</div>
            <div className="duel-player">
              <span>{opponentName}</span>
              <strong>{opponentScore}</strong>
            </div>
          </div>

          {reward > 0 && <p className="feedback">You earned 🪙 {reward} coins!</p>}
          {!isWin && !isDraw && <p className="feedback feedback-error">Better luck next time.</p>}

          <button className="primary-button" onClick={startDuel} style={{ marginTop: "20px" }}>
            Play Again
          </button>
        </div>
      </section>
    );
  }

  // ── Playing Screen ────────────────────────────────────
  const currentQ = round[questionIndex];

  return (
    <section className="subpage">
      <button className="back-button" onClick={onBack}>← Back to Home</button>
      
      <div className="duel-header">
        <div className="duel-score-box me">
          <span>You</span>
          <strong>{myScore}</strong>
        </div>
        <div className="duel-round">Q {questionIndex + 1} / {TOTAL_ROUNDS}</div>
        <div className="duel-score-box opp">
          <span>{opponentName}</span>
          <strong>{opponentScore}</strong>
        </div>
      </div>

      <div className="quiz-panel">
        <h2>{currentQ.question}</h2>
        
        <div className="answer-grid">
          {currentQ.options.map((option) => (
            <button
              key={option}
              className={`answer-option ${selectedAnswer === option ? "selected" : ""}`}
              onClick={() => !feedback && setSelectedAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>

        {feedback ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <p className="feedback">{feedback}</p>
            <p className="small-note">Waiting for next round...</p>
          </div>
        ) : (
          <button className="primary-button" onClick={handleAnswerSubmit} style={{ width: "100%" }}>
            Submit Answer
          </button>
        )}
      </div>
    </section>
  );
}