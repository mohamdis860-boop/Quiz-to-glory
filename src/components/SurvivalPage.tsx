import { useState, useEffect, useCallback } from "react";
import { questions } from "../data/questions";
import { shuffle } from "../utils/shuffle";
import { playSound } from "../utils/audio";
import type { Question } from "../types";

type SurvivalPageProps = {
  onBack: () => void;
  onAwardCoins: (amount: number) => void;
};

const TIME_PER_QUESTION = 15; // 15 ثانية

export default function SurvivalPage({ onBack, onAwardCoins }: SurvivalPageProps) {
  const [gameState, setGameState] = useState<"lobby" | "playing" | "gameover">("lobby");
  const [round, setRound] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");

  // بدء اللعبة
  function startGame() {
    setRound(shuffle(questions));
    setQuestionIndex(0);
    setScore(0);
    setTimeLeft(TIME_PER_QUESTION);
    setFeedback("");
    setGameState("playing");
  }

  // اللوجيك بتاع المؤقت
  useEffect(() => {
    if (gameState !== "playing" || feedback) return;

    if (timeLeft <= 0) {
      handleGameOver("Time's up!");
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, gameState, feedback]);

  // إنهاء اللعبة
  const handleGameOver = useCallback((reason: string) => {
    playSound("wrong");
    setFeedback(reason);
    setGameState("gameover");
    if (score > 0) {
      onAwardCoins(score * 30); // 30 كوينز لكل إجابة صح
    }
  }, [score, onAwardCoins]);

  // الإجابة على السؤال
  function handleAnswer(option: string) {
    if (feedback) return;

    const currentQ = round[questionIndex];
    if (option === currentQ.answer) {
      playSound("correct");
      setScore((s) => s + 1);
      setFeedback("Correct!");
      
      // استنى نص ثانية وبعدين هات السؤال اللي بعده
      setTimeout(() => {
        if (questionIndex < round.length - 1) {
          setQuestionIndex((i) => i + 1);
          setTimeLeft(TIME_PER_QUESTION);
          setFeedback("");
        } else {
          handleGameOver("You beat all questions!");
        }
      }, 1000);
    } else {
      handleGameOver(`Wrong! The answer was ${currentQ.answer}.`);
    }
  }

  // ── Lobby Screen ──────────────────────────────────────
  if (gameState === "lobby") {
    return (
      <section className="subpage">
        <button className="back-button" onClick={onBack}>← Back to Home</button>
        <p className="eyebrow">ENDLESS CHALLENGE</p>
        <h1>Survival Mode ⏳</h1>
        <div className="quiz-panel" style={{ textAlign: "center", padding: "50px 20px" }}>
          <div className="result-icon">💀</div>
          <h2>How long can you survive?</h2>
          <p style={{ color: "#a8c8eb", marginBottom: "30px" }}>
            You have 15 seconds per question. 
            One wrong answer or timeout and it's game over. 
            Earn 30 coins per correct answer!
          </p>
          <button className="primary-button" onClick={startGame}>
            Start Survival
          </button>
        </div>
      </section>
    );
  }

  // ── Game Over Screen ──────────────────────────────────
  if (gameState === "gameover") {
    return (
      <section className="subpage">
        <button className="back-button" onClick={onBack}>← Back to Home</button>
        <p className="eyebrow">SURVIVAL ENDED</p>
        <h1>Game Over</h1>
        <div className="quiz-panel" style={{ textAlign: "center" }}>
          <div className="result-icon">🪦</div>
          <h2>{feedback}</h2>
          <div style={{ margin: "30px 0" }}>
            <p className="small-note">Your Score</p>
            <strong style={{ fontSize: "48px", color: "#ffd700", display: "block", lineHeight: "1" }}>
              {score}
            </strong>
          </div>
          {score > 0 && (
            <p className="feedback">You earned 🪙 {score * 30} coins!</p>
          )}
          <button className="primary-button" onClick={startGame} style={{ marginTop: "20px" }}>
            Try Again
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
      
      <div className="survival-header">
        <div className="survival-score">
          <span>Score</span>
          <strong>{score}</strong>
        </div>
        <div className={`survival-timer ${timeLeft <= 5 ? "danger" : ""}`}>
          ⏳ {timeLeft}s
        </div>
        <div className="survival-q-num">
          Q {questionIndex + 1}
        </div>
      </div>

      <div className="quiz-panel">
        <h2>{currentQ.question}</h2>
        
        <div className="answer-grid">
          {currentQ.options.map((option) => (
            <button
              key={option}
              className="answer-option"
              onClick={() => handleAnswer(option)}
              disabled={!!feedback}
            >
              {option}
            </button>
          ))}
        </div>

        {feedback && <p className="feedback" style={{ textAlign: "center" }}>{feedback}</p>}
      </div>
    </section>
  );
}