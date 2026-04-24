import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import type { AppState } from '../../app/app-state';
import { initialSignupDraft } from '../../app/app-state';
import type { DraftSignup } from '../../types';

export function SignupPage({ appState }: { appState: AppState }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [draft, setDraft] = useState<DraftSignup>({
    ...initialSignupDraft,
    email: searchParams.get('email') ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const comingFromGoogle = searchParams.get('google') === '1';

  if (appState.currentUser) {
    return <Navigate to="/dashboard/courses" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await appState.signup(draft);
      navigate('/dashboard/courses');
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to create the account.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-hero auth-hero--compact">
        <span className="section-tag">Public onboarding</span>
        <h1>Create a student or teacher account.</h1>
        <p>
          Google sign-in hands unknown emails back here with the address prefilled,
          so the user only needs to choose a role, full name, and password.
        </p>
      </section>

      <section className="auth-card">
        <div className="auth-card__header">
          <span className="section-tag">
            {comingFromGoogle ? 'Google handoff' : 'Get started'}
          </span>
          <h2>Set up your account</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              placeholder="Lola Abdurakhimova"
              value={draft.fullName}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fullName: event.target.value,
                }))
              }
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={draft.email}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              required
            />
          </label>

          <label>
            Role
            <select
              value={draft.role}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  role: event.target.value as DraftSignup['role'],
                }))
              }
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Choose a secure password"
              value={draft.password}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              required
            />
          </label>

          {error ? <p className="inline-message inline-message--warning">{error}</p> : null}

          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-footnote">
          Already have access? <Link to="/login">Back to login</Link>
        </p>
      </section>
    </div>
  );
}
