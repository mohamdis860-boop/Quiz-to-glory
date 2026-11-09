import { useState, type FormEvent } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");
    setErrorMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!isSupabaseConfigured) {
      setErrorMessage("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (mode === "signup" && displayName.trim().length < 2) {
      setErrorMessage("Please enter a name with at least 2 characters.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Your password must contain at least 6 characters.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { display_name: displayName.trim() } },
        });
        if (error) throw error;

        if (data.session) {
          setMessage("Your account has been created. Welcome to Quiz to Glory!");
        } else {
          setMessage("Account created. Check your email for the confirmation link, then log in.");
          setMode("login");
          setPassword("");
          setConfirmPassword("");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setErrorMessage(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-brand-mark">⚽</div>
        <p className="auth-eyebrow">BUILD YOUR LEGACY</p>
        <h1>Quiz <span>to</span> Glory</h1>
        <p className="auth-subtitle">Sign in, build your ultimate squad, and prove your football knowledge.</p>

        <div className="auth-tabs" role="tablist" aria-label="Authentication">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>Log In</button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")}>Create Account</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label>
              Display name
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your player name" autoComplete="name" required minLength={2} />
            </label>
          )}
          <label>
            Email address
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required />
          </label>
          {mode === "signup" && (
            <label>
              Confirm password
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter your password again" autoComplete="new-password" minLength={6} required />
            </label>
          )}

          {errorMessage && <p className="auth-alert error" role="alert">{errorMessage}</p>}
          {message && <p className="auth-alert success" role="status">{message}</p>}

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Please wait..." : mode === "login" ? "Log In to Your Account" : "Create My Account"}
            {!busy && <span>→</span>}
          </button>
        </form>
        <p className="auth-footnote">Your game progress is kept separate for each account.</p>
      </section>
    </main>
  );
}
