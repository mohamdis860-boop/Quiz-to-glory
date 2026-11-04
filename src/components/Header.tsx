type HeaderProps = {
  coins: number | null;
  onGoHome: () => void;
};

export default function Header({ coins, onGoHome }: HeaderProps) {
  return (
    <header className="topbar">
      <button className="brand" onClick={onGoHome}>
        <span className="brand-ball">⚽</span>
        <span>
          Quiz <span className="brand-accent">to</span> Glory
        </span>
      </button>

      <div className="header-actions">
        <div className="coin-balance">
          <span>🪙</span>
          {/* هنا حطينا (coins || 0) عشان لو بقت null يقراها صفر */}
          <strong>{(coins || 0).toLocaleString()}</strong>
        </div>
        <div className="profile">
          <span className="avatar">👤</span>
          <span>Player</span>
        </div>
      </div>
    </header>
  );
}