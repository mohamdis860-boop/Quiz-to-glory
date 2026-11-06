import type { DailyState, Page, Player, Squad } from "../types";
import { MISSIONS } from "../data/missions";
import { calculateSquadRating } from "../utils/squad";

type HomePageProps = {
  coins: number;
  players: Player[];
  squad: Squad;
  daily: DailyState;
  achievementSummary: {
    claimable: number;
    unlocked: number;
    total: number;
  };
  onStartQuiz: () => void;
  onNavigate: (page: Page) => void;
};

export default function HomePage({
  coins,
  players,
  squad,
  daily,
  achievementSummary,
  onStartQuiz,
  onNavigate,
}: HomePageProps) {
  const teamRating = calculateSquadRating(squad, players);

  const claimableMissions = MISSIONS.filter(
    (m) => daily.progress[m.id] >= m.goal && !daily.claimed[m.id]
  ).length;
  const claimableDaily = claimableMissions + (daily.loginClaimed ? 0 : 1);
  const completedMissions = MISSIONS.filter(
    (m) => daily.progress[m.id] >= m.goal
  ).length;

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">YOUR FOOTBALL JOURNEY STARTS HERE</p>
          <h1>
            Welcome to
            <br />
            <span>Quiz to Glory</span>
          </h1>
          <p className="hero-description">
            Test your football knowledge, build your dream team, and become a
            legend!
          </p>
          <button className="primary-button" onClick={onStartQuiz}>
            Start Your Journey <span>→</span>
          </button>
        </div>
        <div className="hero-ball" aria-hidden="true">
          ⚽
          <span>👑</span>
        </div>
      </section>

      <section className="stats">
        <div className="stat">
          <span className="stat-icon">🪙</span>
          <div>
            <p>Coins</p>
            <strong>{coins.toLocaleString()}</strong>
          </div>
        </div>
        <div className="stat">
          <span className="stat-icon">⭐</span>
          <div>
            <p>Team Rating</p>
            <strong>{teamRating}</strong>
          </div>
        </div>
        <div className="stat">
          <span className="stat-icon">🏆</span>
          <div>
            <p>Players Collected</p>
            <strong>{players.length}</strong>
          </div>
        </div>
      </section>

      <button className="daily-banner" onClick={() => onNavigate("daily")}>
        <span className="daily-banner-flame">🔥</span>
        <span className="daily-banner-text">
          <strong>Day {daily.streak} Streak</strong>
          <span>
            {claimableDaily > 0
              ? `🎁 ${claimableDaily} reward${claimableDaily > 1 ? "s" : ""} ready to claim`
              : `Daily Missions · ${completedMissions}/${MISSIONS.length} done`}
          </span>
        </span>
        <span className="daily-banner-arrow">→</span>
      </button>

      <button
        className="achievements-banner"
        onClick={() => onNavigate("achievements")}
      >
        <span className="achievements-banner-icon">🏆</span>
        <span className="daily-banner-text">
          <strong>
            Achievements · {achievementSummary.unlocked}/
            {achievementSummary.total}
          </strong>
          <span>
            {achievementSummary.claimable > 0
              ? `🎁 ${achievementSummary.claimable} reward${
                  achievementSummary.claimable > 1 ? "s" : ""
                } ready to claim`
              : "Keep playing to unlock more milestones"}
          </span>
        </span>
        <span className="daily-banner-arrow">→</span>
      </button>

      <section className="section-heading">
        <div>
          <p className="eyebrow">CHOOSE YOUR NEXT MOVE</p>
          <h2>Your Football Hub</h2>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card quiz-card">
          <div className="feature-art">📝</div>
          <div className="feature-info">
            <span className="card-tag">TEST YOUR KNOWLEDGE</span>
            <h3>Play Quiz</h3>
            <p>Answer football questions and earn coins and rewards.</p>
            <button className="card-button" onClick={onStartQuiz}>
              Start Challenge <span>→</span>
            </button>
          </div>
        </article>

        <article className="feature-card team-card">
          <div className="feature-art">🏟️</div>
          <div className="feature-info">
            <span className="card-tag">BUILD YOUR DREAM TEAM</span>
            <h3>My Team</h3>
            <p>Collect player cards and build your 4-3-3 squad.</p>
            <button className="card-button" onClick={() => onNavigate("team")}>
              View Squad <span>→</span>
            </button>
          </div>
        </article>

        <article className="feature-card packs-card">
          <div className="feature-art">🃏</div>
          <div className="feature-info">
            <span className="card-tag">DISCOVER NEW PLAYERS</span>
            <h3>Player Cards</h3>
            <p>Open packs, discover players and improve your collection.</p>
            <button className="card-button" onClick={() => onNavigate("packs")}>
              Open Packs <span>→</span>
            </button>
          </div>
        </article>

        {/* كارت الماتش الجديد */}
        <article className="feature-card" style={{ background: "linear-gradient(120deg, #5c0a0a, #2a0505)", borderColor: "#ff3d3d" }}>
          <div className="feature-art">⚽</div>
          <div className="feature-info">
            <span className="card-tag">TEST YOUR SQUAD</span>
            <h3>Play Match</h3>
            <p>Simulate a match against a random team and earn coins.</p>
            <button className="card-button" onClick={() => onNavigate("match")}>
              Start Match <span>→</span>
            </button>
          </div>
        </article>

        <article className="feature-card settings-card">
          <div className="feature-art">⚙️</div>
          <div className="feature-info">
            <span className="card-tag">MAKE IT YOURS</span>
            <h3>Settings</h3>
            <p>Manage your game preferences and player profile.</p>
            <button
              className="card-button"
              onClick={() => onNavigate("settings")}
            >
              Go to Settings <span>→</span>
            </button>
          </div>
        </article>
      </section>
    </>
  );
}