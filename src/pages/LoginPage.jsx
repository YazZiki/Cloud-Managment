import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (email == "admin" || password == "admin") {
      setError("success");
      await new Promise((r) => setTimeout(r, 1600));
      navigate("/dashboard");
      return;
    }

    setLoading(true);
    // Simulate an API call — replace with real auth logic
    await new Promise((r) => setTimeout(r, 1600));
    setLoading(false);
    setError("Invalid credentials. Please try again.");
  };

  return (
    <div className="login-page">
      {/* ── Left panel ─────────────────────────────────────────── */}
      <aside className="lp-panel">
        <div className="lp-panel-grid" aria-hidden="true" />

        {/* Logo */}
        <div className="lp-logo">
          <div className="lp-logo-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58q0-1.95 1.17-3.48 1.18-1.53 3.08-1.95.51-2.26 2.29-3.7Q9.32 4 11.5 4q2.93 0 4.96 2.04Q18.5 8.07 18.5 11q1.73.2 2.86 1.5Q22.5 13.7 22.5 15.5q0 1.88-1.31 3.19Q19.88 20 18 20Z" />
            </svg>
          </div>
          <span className="lp-logo-name">Cloud</span>
        </div>

        {/* Hero text */}
        <div className="lp-hero">
          <h1 className="lp-tagline">
            Manage your
            <br />
            infrastructure
            <br />
            <span>with clarity.</span>
          </h1>
          <p className="lp-subtitle">
            A unified control plane for all your cloud resources — monitor,
            scale, and optimize from a single intelligent dashboard.
          </p>
        </div>

        {/* Stats */}
        <div className="lp-stats">
          <div>
            <div className="lp-stat-value">99.9%</div>
            <div className="lp-stat-label">Uptime SLA</div>
          </div>
          <div>
            <div className="lp-stat-value">140+</div>
            <div className="lp-stat-label">Regions</div>
          </div>
          <div>
            <div className="lp-stat-value">12ms</div>
            <div className="lp-stat-label">Avg Latency</div>
          </div>
        </div>
      </aside>

      {/* ── Right panel / form ──────────────────────────────────── */}
      <main className="lp-form-side">
        <div className="lp-card">
          <div className="lp-card-header">
            <h2 className="lp-welcome">Welcome back</h2>
            <p className="lp-welcome-sub">Sign in to your management console</p>
          </div>

          <form className="lp-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="lp-field">
              <label className="lp-label" htmlFor="lp-email">
                Email
              </label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 7l10 7 10-7" />
                  </svg>
                </span>
                <input
                  id="lp-email"
                  className="lp-input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  aria-label="Email address"
                />
              </div>
            </div>

            {/* Password */}
            <div className="lp-field">
              <label className="lp-label" htmlFor="lp-password">
                Password
              </label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="lp-password"
                  className="lp-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-label="Password"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  className="lp-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    /* Eye-off */
                    <svg viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    /* Eye */
                    <svg viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="lp-error" role="alert">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </p>
            )}

            {/* Remember + forgot */}
            <div className="lp-options">
              {/* <label className="lp-checkbox-label">
                <input
                  type="checkbox"
                  className="lp-checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label> */}
              <a href="#forgot" className="lp-forgot">
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`lp-btn${loading ? " loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="lp-spinner" /> Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <svg viewBox="0 0 24 24">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>

            {/* SSO */}
            {/* <div className="lp-divider">or</div>
            <button type="button" className="lp-sso-btn"> */}
            {/* Key icon */}
            {/* <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#355872"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="7.5" cy="15.5" r="5.5" />
                <path d="M21 2l-9.6 9.6" />
                <path d="M15.5 7.5l3 3" />
                <path d="M18 5l3 3" />
              </svg>
              Continue with SSO
            </button> */}
          </form>

          {/* <p className="lp-footer">
            Need access? <a href="#contact">Contact your administrator</a>
          </p> */}
        </div>
      </main>
    </div>
  );
}
