import { useEffect, useState } from "react";
import { questions, CATEGORY_LABELS } from "../data/questions";
import { shuffle } from "../utils/shuffle";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Question } from "../types";

const QUESTIONS_PER_ROUND = 10;

type QuizSession = {
  round: Question[];
  questionIndex: number;
  selectedAnswer: string;
  score: number;
  feedback: string;
  completed: boolean;
};

function buildRound(): Question[] {
  return shuffle(questions)
    .slice(0, QUESTIONS_PER_ROUND)
    .map((q) => ({ ...q, options: shuffle(q.options) }));
}

function createNewSession(): QuizSession {
  return {
    round: buildRound(),
    questionIndex: 0,
    selectedAnswer: "",
    score: 0,
    feedback: "",
    completed: false,
  };
}

type QuizPageProps = {
  onBack: () => void;
  onAwardCoins: (amount: number) => void;
  onCorrectAnswer: () => void;
  onQuizComplete: (score: number) => void;
};

export default function QuizPage({
  onBack,
  onAwardCoins,
  onCorrectAnswer,
  onQuizComplete,
}: QuizPageProps) {
  const [savedSession, setSavedSession] = useLocalStorage<QuizSession | null>(
    "qtg:quizSession",
    null
  );
  const [session, setSession] = useState<QuizSession | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  // On mount: resume or start new
  useEffect(() => {
    const isValidResume =
      savedSession &&
      !savedSession.completed &&
      savedSession.round.length > 0 &&
      savedSession.round[0]?.id;

    if (isValidResume) {
      setShowResumePrompt(true);
    } else {
      setSession(createNewSession());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save session on every change
  useEffect(() => {
    if (session) {
      setSavedSession(session);
    }
  }, [session, setSavedSession]);

  function continueSession() {
    if (savedSession) {
      setSession(savedSession);
    }
    setShowResumePrompt(false);
  }

  function startNewSession() {
    setSession(createNewSession());
    setShowResumePrompt(false);
  }

  function checkAnswer() {
    if (!session || !session.selectedAnswer || session.feedback) return;
    const currentQuestion = session.round[session.questionIndex];

    if (session.selectedAnswer === currentQuestion.answer) {
      onAwardCoins(50);
      onCorrectAnswer();
      setSession({
        ...session,
        score: session.score + 1,
        feedback: "Correct answer! +50 coins 🎉",
      });
    } else {
      setSession({
        ...session,
        feedback: `Not quite! The answer is ${currentQuestion.answer}.`,
      });
    }
  }

  function nextQuestion() {
    if (!session) return;

    if (session.questionIndex < session.round.length - 1) {
      setSession({
        ...session,
        questionIndex: session.questionIndex + 1,
        selectedAnswer: "",
        feedback: "",
      });
    } else {
      setSession({
        ...session,
        feedback: `Quiz completed! Your score: ${session.score}/${session.round.length}`,
        completed: true,
      });
      onQuizComplete(session.score);
    }
  }

  function restart() {
    setSession(createNewSession());
  }

  // ── Resume prompt ──────────────────────────────────────
  if (showResumePrompt && savedSession) {
    const progress = savedSession.questionIndex + 1;
    const total = savedSession.round.length;

    return (
      <section className="subpage">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>
        <p className="eyebrow">FOOTBALL KNOWLEDGE CHALLENGE</p>
        <h1>Play Quiz ⚽</h1>

        <div className="quiz-panel">
          <div className="result-icon">⏸️</div>
          <h2>Resume your quiz?</h2>
          <p>You have an unfinished quiz in progress.</p>

          <div className="resume-stats">
            <div>
              <span className="small-note">Progress</span>
              <strong>
                {progress} / {total}
              </strong>
            </div>
            <div>
              <span className="small-note">Score</span>
              <strong>{savedSession.score} correct</strong>
            </div>
          </div>

          <div className="resume-actions">
            <button className="primary-button" onClick={continueSession}>
              Continue Quiz →
            </button>
            <button className="card-button" onClick={startNewSession}>
              Start New Quiz
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ── Loading (before mount effect runs) ────────────────
  if (!session) {
    return (
      <section className="subpage">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>
        <p className="eyebrow">FOOTBALL KNOWLEDGE CHALLENGE</p>
        <h1>Play Quiz ⚽</h1>
        <div className="quiz-panel">
          <p className="small-note">Loading…</p>
        </div>
      </section>
    );
  }

  // ── Results screen ────────────────────────────────────
  if (session.completed) {
    return (
      <section className="subpage">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>
        <p className="eyebrow">FOOTBALL KNOWLEDGE CHALLENGE</p>
        <h1>Play Quiz ⚽</h1>

        <div className="quiz-panel">
          <div className="result-icon">🏆</div>
          <h2>Challenge Complete!</h2>
          <p>{session.feedback}</p>
          <p>You earned coins for every correct answer.</p>
          <button className="primary-button" onClick={restart}>
            Play Again
          </button>
        </div>
      </section>
    );
  }

  // ── Playing ───────────────────────────────────────────
  const currentQuestion = session.round[session.questionIndex];

  return (
    <section className="subpage">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>
      <p className="eyebrow">FOOTBALL KNOWLEDGE CHALLENGE</p>
      <h1>Play Quiz ⚽</h1>

      <div className="quiz-panel">
        <div className="quiz-progress">
          <span>
            Question {session.questionIndex + 1} of {session.round.length}
          </span>
          <span>⭐ Score: {session.score}</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${
                ((session.questionIndex + 1) / session.round.length) * 100
              }%`,
            }}
          />
        </div>

        <div className="question-meta">
          <span className="badge">
            {CATEGORY_LABELS[currentQuestion.category]}
          </span>
          <span className={`badge badge-${currentQuestion.difficulty}`}>
            {currentQuestion.difficulty}
          </span>
        </div>

        <h2>{currentQuestion.question}</h2>
        <div className="answer-grid">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              className={`answer-option ${
                session.selectedAnswer === option ? "selected" : ""
              }`}
              onClick={() => {
                if (!session.feedback) {
                  setSession({ ...session, selectedAnswer: option });
                }
              }}
            >
              {option}
            </button>
          ))}
        </div>
        {session.feedback && <p className="feedback">{session.feedback}</p>}
        {!session.feedback ? (
          <button className="primary-button" onClick={checkAnswer}>
            Submit Answer →
          </button>
        ) : (
          <button className="primary-button" onClick={nextQuestion}>
            {session.questionIndex === session.round.length - 1
              ? "See Results"
              : "Next Question →"}
          </button>
        )}
      </div>
    </section>
  );
}