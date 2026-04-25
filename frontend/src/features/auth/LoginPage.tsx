import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { startGoogleAuth } from '../../authApi';
import type { AppState } from '../../app/app-state';

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
    <div className="auth-shell auth-shell--login">
      <section className="auth-hero auth-hero--education">
        <div className="auth-hero__topbar">
          <span className="section-tag">Education workspace</span>
          <span className="auth-hero__eyebrow">Autocheck Campus</span>
        </div>

        <div className="auth-hero__lead">
          <h1>Teach, submit, review, and improve from one academic dashboard.</h1>
          <p>
            Built for classrooms that need clear homework flows, fast feedback, and
            teacher review without the clutter of a generic admin panel.
          </p>
        </div>

        <div className="auth-hero__timeline">
          <div className="auth-step">
            <span className="auth-step__index">01</span>
            <div>
              <strong>Assign</strong>
              <p>Publish homework prompts inside each course.</p>
            </div>
          </div>
          <div className="auth-step">
            <span className="auth-step__index">02</span>
            <div>
              <strong>Submit</strong>
              <p>Students send text, image, or TXT answers in one place.</p>
            </div>
          </div>
          <div className="auth-step">
            <span className="auth-step__index">03</span>
            <div>
              <strong>Review</strong>
              <p>Scores and feedback stay visible right next to the response.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-card auth-card--login">
        <div className="auth-card__header">
          <span className="section-tag">Welcome back</span>
          <h2>Sign in to your learning workspace</h2>
          <p>Use your school email and continue into your courses, homework queue, and review tools.</p>
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

          <button className="primary-button button-with-icon" disabled={submitting} type="submit">
            <LoginIcon />
            {submitting ? 'Logging in...' : 'Enter dashboard'}
          </button>
        </form>

        <button className="google-button button-with-icon" onClick={startGoogleAuth} type="button">
          <GoogleIcon />
          Continue with Google
        </button>



        <p className="auth-footnote">
          No matching account yet? <Link to="/signup">Create one</Link>
        </p>
      </section>
    </div>
  );
}

function LoginIcon() {
  return (
    <span aria-hidden="true" className="button__icon">
      <svg viewBox="0 0 24 24">
        <path d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M14 8.5 18 12l-4 3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M9 12h9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    </span>
  );
}

function GoogleIcon() {
  return (
    <span aria-hidden="true" className="button__icon">
      <svg viewBox="0 0 24 24">
        <path d="M21 12.25c0-.76-.07-1.32-.22-1.9H12v3.58h5.16c-.1.89-.65 2.24-1.87 3.14l-.02.12 3.05 2.31.21.02c1.93-1.75 3.47-4.41 3.47-7.27Z" fill="currentColor" />
        <path d="M12 21c2.53 0 4.65-.81 6.2-2.2l-3.24-2.45c-.87.59-2.03 1-2.96 1-2.48 0-4.58-1.6-5.33-3.82l-.12.01-3.17 2.4-.04.11C4.88 19 8.16 21 12 21Z" fill="currentColor" opacity=".82" />
        <path d="M6.67 13.53A5.3 5.3 0 0 1 6.36 12c0-.53.11-1.04.29-1.53l-.01-.13-3.22-2.44-.11.05A8.84 8.84 0 0 0 2.4 12c0 1.42.34 2.76.92 4l3.35-2.47Z" fill="currentColor" opacity=".68" />
        <path d="M12 6.65c1.18 0 2.22.5 3.04 1.28l2.22-2.13C15.72 4.4 14.18 3.6 12 3.6c-3.84 0-7.12 2-8.69 4.95l3.34 2.52C7.43 8.25 9.52 6.65 12 6.65Z" fill="currentColor" opacity=".56" />
      </svg>
    </span>
  );
}
