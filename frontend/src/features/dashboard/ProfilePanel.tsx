import { useEffect, useState, type FormEvent } from 'react';
import type { AppState } from '../../app/app-state';
import type { TeacherEvaluationMode } from '../../types';

export function ProfilePanel({ appState }: { appState: AppState }) {
  const { currentProfile } = appState;
  const [fullName, setFullName] = useState(currentProfile?.fullName ?? '');
  const [email, setEmail] = useState(currentProfile?.email ?? '');
  const [password, setPassword] = useState('');
  const [evaluationMode, setEvaluationMode] = useState<TeacherEvaluationMode>(
    currentProfile?.role === 'teacher'
      ? currentProfile.evaluationMode
      : 'ai_automated',
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!currentProfile) {
      return;
    }

    setFullName(currentProfile.fullName);
    setEmail(currentProfile.email);
    setPassword('');

    if (currentProfile.role === 'teacher') {
      setEvaluationMode(currentProfile.evaluationMode);
    }
  }, [currentProfile]);

  if (!currentProfile) {
    return null;
  }

  const profile = currentProfile;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      await appState.updateCurrentProfile({
        fullName,
        email,
        password: password || undefined,
        evaluationMode: profile.role === 'teacher' ? evaluationMode : undefined,
      });
      setPassword('');
      setMessage('Profile updated successfully.');
    } catch (caughtError) {
      const nextMessage =
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to update profile.';
      setMessage(nextMessage);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <h2>My profile</h2>
        <p>
          This form is connected to the new backend profile APIs. Teachers can also
          edit their default evaluation mode here.
        </p>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          Full name
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          New password
          <input
            type="password"
            placeholder="Leave blank to keep the current password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {profile.role === 'teacher' ? (
          <label>
            Evaluation mode
            <select
              value={evaluationMode}
              onChange={(event) =>
                setEvaluationMode(event.target.value as TeacherEvaluationMode)
              }
            >
              <option value="ai_automated">AI automated</option>
              <option value="partial_assisted">Partial assisted</option>
              <option value="manual">Manual</option>
            </select>
          </label>
        ) : null}

        {message ? <p className="inline-message">{message}</p> : null}

        <button className="primary-button" disabled={busy} type="submit">
          {busy ? 'Saving profile...' : 'Save profile'}
        </button>
      </form>
    </section>
  );
}
