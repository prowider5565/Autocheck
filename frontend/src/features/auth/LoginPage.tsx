import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { startGoogleAuth } from '../../authApi';
import type { AppState } from '../../app/app-state';
import { MetricCard } from '../../components/ui';

export function LoginPage({ appState }: { appState: AppState }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (appState.currentUser) {
    return <Navigate to="/dashboard/courses" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await appState.login({
        email: email.trim().toLowerCase(),
        password,
      });

      navigate('/dashboard/courses');
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to log in right now.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <span className="section-tag">Minimal SaaS dashboard</span>
        <h1>Homework uploads, Gemini scoring, and teacher review in one place.</h1>
        <p>
          The auth flow is now backed by Nest APIs with HTTP-only cookies, Google
          redirect support, and profile retrieval from the backend.
        </p>
        <div className="hero-stats">
          <MetricCard label="Cookie auth" value="HTTP-only" hint="Session restored via /me" />
          <MetricCard label="Google flow" value="Redirect" hint="Unknown users land on signup" />
          <MetricCard label="Profile update" value="Live" hint="Teacher mode included" />
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card__header">
          <span className="section-tag">Welcome back</span>
          <h2>Log in to your workspace</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              placeholder="you@school.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? <p className="inline-message inline-message--warning">{error}</p> : null}
          {appState.authError ? (
            <p className="inline-message inline-message--warning">{appState.authError}</p>
          ) : null}

          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? 'Logging in...' : 'Continue'}
          </button>
        </form>

        <button className="google-button" onClick={startGoogleAuth} type="button">
          Continue with Google
        </button>

        <p className="auth-footnote">
          No matching account yet? <Link to="/signup">Create one</Link>
        </p>
      </section>
    </div>
  );
}
