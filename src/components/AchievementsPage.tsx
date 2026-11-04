import { useState } from "react";
import type { AchievementId } from "../types";
import type { Achievement } from "../data/achievements";

type AchievementItem = {
  achievement: Achievement;
  progress: number;
  isComplete: boolean;
  isClaimed: boolean;
  canClaim: boolean;
};

type AchievementsPageProps = {
  achievements: AchievementItem[];
  claimableCount: number;
  unlockedCount: number;
  onClaimAchievement: (id: AchievementId) => void;
  onClaimAll: () => number;
  onBack: () => void;
};

type Filter = "all" | "claimable" | "completed";

export default function AchievementsPage({
  achievements,
  claimableCount,
  unlockedCount,
  onClaimAchievement,
  onClaimAll,
  onBack,
}: AchievementsPageProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [claimFeedback, setClaimFeedback] = useState("");

  const sorted = [...achievements].sort((a, b) => {
    if (a.canClaim && !b.canClaim) return -1;
    if (!a.canClaim && b.canClaim) return 1;
    if (a.isComplete && !b.isComplete) return 1;
    if (!a.isComplete && b.isComplete) return -1;
    if (a.isClaimed && !b.isClaimed) return 1;
    if (!a.isClaimed && b.isClaimed) return -1;
    return 0;
  });

  const filtered = sorted.filter((x) => {
    if (filter === "claimable") return x.canClaim;
    if (filter === "completed") return x.isComplete;
    return true;
  });

  function handleClaimAll() {
    const total = onClaimAll();
    if (total > 0) {
      setClaimFeedback(`Claimed all! +🪙 ${total} coins.`);
      setTimeout(() => setClaimFeedback(""), 3000);
    }
  }

  return (
    <section className="subpage">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>
      <p className="eyebrow">MILESTONES ON YOUR JOURNEY</p>
      <h1>Achievements 🏆</h1>

      <div className="achievements-summary">
        <div className="achievements-summary-item">
          <strong>{unlockedCount}</strong>
          <span>Unlocked</span>
        </div>
        <div className="achievements-summary-item">
          <strong>{claimableCount}</strong>
          <span>Ready to claim</span>
        </div>
        <div className="achievements-summary-item">
          <strong>{achievements.length}</strong>
          <span>Total</span>
        </div>
      </div>

      {claimableCount > 0 && (
        <button
          className="primary-button claim-all-button"
          onClick={handleClaimAll}
        >
          🎁 Claim All ({claimableCount})
        </button>
      )}

      {claimFeedback && <p className="sell-feedback">{claimFeedback}</p>}

      <div className="achievements-filters">
        {(["all", "claimable", "completed"] as const).map((f) => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all"
              ? "All"
              : f === "claimable"
              ? "Claimable"
              : "Completed"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="bench-empty">No achievements in this category yet.</p>
      ) : (
        <div className="achievements-grid">
          {filtered.map((item) => {
            const {
              achievement: a,
              progress,
              isComplete,
              isClaimed,
              canClaim,
            } = item;
            const pct = (progress / a.goal) * 100;

            return (
              <article
                key={a.id}
                className={`achievement-card ${
                  canClaim
                    ? "achievement-claimable"
                    : isClaimed
                    ? "achievement-claimed"
                    : ""
                }`}
              >
                <div className="achievement-icon">
                  {isClaimed ? "✓" : a.icon}
                </div>
                <div className="achievement-body">
                  <div className="achievement-head">
                    <strong>{a.title}</strong>
                    <span className="achievement-reward">🪙 {a.reward}</span>
                  </div>
                  <p className="achievement-desc">{a.description}</p>
                  <div className="achievement-progress">
                    <div className="achievement-bar">
                      <div
                        className="achievement-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="achievement-count">
                      {progress}/{a.goal}
                    </span>
                  </div>
                </div>
                <div className="achievement-action">
                  {isClaimed ? (
                    <span className="mission-claimed-label">✓ Claimed</span>
                  ) : canClaim ? (
                    <button
                      className="primary-button mission-claim"
                      onClick={() => onClaimAchievement(a.id)}
                    >
                      Claim
                    </button>
                  ) : isComplete ? (
                    <span className="mission-claimed-label">Claimable</span>
                  ) : (
                    <span className="mission-locked">Locked</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}