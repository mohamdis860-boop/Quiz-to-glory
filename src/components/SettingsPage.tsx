type SettingsPageProps = {
  onBack: () => void;
  onReset: () => void;
};

export default function SettingsPage({ onBack, onReset }: SettingsPageProps) {
  function handleReset() {
    const ok = window.confirm(
      "Reset all progress? This will clear your coins, players and opened packs."
    );
    if (ok) onReset();
  }

  return (
    <section className="subpage">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>
      <p className="eyebrow">YOUR GAME, YOUR WAY</p>
      <h1>Settings ⚙️</h1>

      <div className="settings-panel">
        <h2>Player Profile</h2>
        <div className="profile-row">
          <span className="avatar large-avatar">👤</span>
          <div>
            <strong>Player</strong>
            <p>Football enthusiast</p>
          </div>
        </div>
        <p className="small-note">
          Your progress is saved automatically on this device.
        </p>
      </div>

      <div className="settings-panel danger-zone">
        <h2>Danger Zone</h2>
        <p className="small-note">
          This clears saved data on this browser and starts you fresh.
        </p>
        <button className="danger-button" onClick={handleReset}>
          Reset All Progress
        </button>
      </div>
    </section>
  );
}