type HeaderProps = {
  coins: number | null;
  displayName: string;
  email: string;
  onGoHome: () => void;
  onSignOut: () => void;
};

export default function Header({ coins, displayName, email, onGoHome, onSignOut }: HeaderProps) {
  return (
    <header className="topbar">
      <button className="brand" onClick={onGoHome} aria-label="Quiz to Glory home">
        <span className="brand-ball">⚽</span>
        <span>Quiz <span className="brand-accent">to</span> Glory</span>
      </button>

      <div className="header-actions">
        <div className="coin-balance">
          <span>🪙</span>
          <strong>{(coins || 0).toLocaleString()}</strong>
        </div>
        <div className="profile" title={email}>
          <span className="avatar">{displayName.trim().charAt(0).toUpperCase() || "👤"}</span>
          <span className="header-player-name">{displayName}</span>
        </div>
        <button className="signout-button" onClick={onSignOut}>Log Out</button>
      </div>
    </header>
  );
}
