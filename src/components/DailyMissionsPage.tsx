import type { DailyState, MissionId } from "../types";
import { MISSIONS, getLoginReward } from "../data/missions";

type DailyMissionsPageProps = {
  daily: DailyState;
  onClaimMission: (id: MissionId) => void;
  onClaimLogin: () => void;
  onBack: () => void;
};

export default function DailyMissionsPage({
  daily,
  onClaimMission,
  onClaimLogin,
  onBack,
}: DailyMissionsPageProps) {
  const todayReward = getLoginReward(daily.streak);
  const tomorrowReward = getLoginReward(daily.streak + 1);
  const completedCount = MISSIONS.filter(
    (m) => daily.progress[m.id] >= m.goal
  ).length;
  const claimableCount = MISSIONS.filter(
    (m) => daily.progress[m.id] >= m.goal && !daily.claimed[m.id]
  ).length;

  return (
    <section className="subpage">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>
      <p className="eyebrow">REWARDS RESET EVERY DAY AT MIDNIGHT</p>
      <h1>Daily Rewards 🎁</h1>

      {/* Streak card */}
      <div className="streak-card">
        <div className="streak-flame">🔥</div>
        <div className="streak-info">
          <p className="streak-label">Login Streak</p>
          <strong className="streak-day">Day {daily.streak}</strong>
        </div>
        <div className="streak-reward">
          <span className="streak-amount">🪙 {todayReward}</span>
          {daily.loginClaimed ? (
            <span className="streak-claimed">✓ Claimed</span>
          ) : (
            <button className="primary-button streak-claim" onClick={onClaimLogin}>
              Claim Today
            </button>
          )}
        </div>
      </div>
      {daily.loginClaimed && (
        <p className="small-note streak-note">
          Come back tomorrow for 🪙 {tomorrowReward}
          {daily.streak >= 7 ? " (max tier)" : ""}.
        </p>
      )}

      {/* Missions summary */}
      <div className="missions-summary">
        <span>
          {completedCount}/{MISSIONS.length} missions completed
        </span>
        {claimableCount > 0 && (
          <span className="missions-summary-badge">
            🎁 {claimableCount} ready
          </span>
        )}
      </div>

      {/* Mission rows */}
      <div className="missions-list">
        {MISSIONS.map((mission) => {
          const progress = daily.progress[mission.id];
          const isComplete = progress >= mission.goal;
          const isClaimed = daily.claimed[mission.id];
          const canClaim = isComplete && !isClaimed;
          const pct = Math.min(100, (progress / mission.goal) * 100);

          return (
            <article
              key={mission.id}
              className={`mission-row ${
                isClaimed
                  ? "mission-claimed"
                  : canClaim
                  ? "mission-claimable"
                  : ""
              }`}
            >
              <div className="mission-icon">{mission.icon}</div>
              <div className="mission-body">
                <div className="mission-head">
                  <strong>{mission.title}</strong>
                  <span className="mission-reward">🪙 {mission.reward}</span>
                </div>
                <p className="mission-desc">{mission.description}</p>
                <div className="mission-progress">
                  <div className="mission-bar">
                    <div
                      className="mission-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="mission-count">
                    {Math.min(progress, mission.goal)}/{mission.goal}
                  </span>
                </div>
              </div>
              <div className="mission-action">
                {isClaimed ? (
                  <span className="mission-claimed-label">✓ Claimed</span>
                ) : canClaim ? (
                  <button
                    className="primary-button mission-claim"
                    onClick={() => onClaimMission(mission.id)}
                  >
                    Claim
                  </button>
                ) : (
                  <span className="mission-locked">Locked</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}