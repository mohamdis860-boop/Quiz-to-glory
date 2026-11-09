import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

type SettingsPageProps = {
  user: User;
  onBack: () => void;
  onReset: () => void;
  onUpdateProfile: (displayName: string) => Promise<void>;
};

export default function SettingsPage({ user, onBack, onReset, onUpdateProfile }: SettingsPageProps) {
  const savedName = String(user.user_metadata?.display_name || "");
  const [displayName, setDisplayName] = useState(savedName);
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => setDisplayName(savedName), [savedName]);

  async function handleSaveProfile() {
    setProfileMessage("");
    setProfileError("");
    if (displayName.trim().length < 2) {
      setProfileError("Your display name must contain at least 2 characters.");
      return;
    }
    setSaving(true);
    try {
      await onUpdateProfile(displayName.trim());
      setProfileMessage("Your profile has been updated.");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    const ok = window.confirm("Reset all progress? This will clear your coins, players and opened packs for this account on this device.");
    if (ok) onReset();
  }

  return (
    <section className="subpage">
      <button className="back-button" onClick={onBack}>← Back to Home</button>
      <p className="eyebrow">YOUR GAME, YOUR WAY</p>
      <h1>Settings ⚙️</h1>

      <div className="settings-panel">
        <h2>Player Profile</h2>
        <div className="profile-row">
          <span className="avatar large-avatar">{displayName.trim().charAt(0).toUpperCase() || "👤"}</span>
          <div className="profile-details">
            <strong>{displayName || "Player"}</strong>
            <p>{user.email}</p>
          </div>
        </div>
        <label className="settings-label" htmlFor="display-name">Display name</label>
        <input id="display-name" className="settings-input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={32} placeholder="Enter your player name" />
        {profileError && <p className="settings-feedback error">{profileError}</p>}
        {profileMessage && <p className="settings-feedback success">{profileMessage}</p>}
        <button className="primary-button profile-save-button" onClick={handleSaveProfile} disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
        <p className="small-note">Your profile is saved securely with your account.</p>
      </div>

      <div className="settings-panel danger-zone">
        <h2>Danger Zone</h2>
        <p className="small-note">This clears this account's saved game data on this browser and starts you fresh.</p>
        <button className="danger-button" onClick={handleReset}>Reset All Progress</button>
      </div>
    </section>
  );
}
