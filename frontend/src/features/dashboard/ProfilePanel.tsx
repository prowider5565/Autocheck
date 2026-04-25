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
      setMessage('Profil muvaffaqiyatli yangilandi.');
    } catch (caughtError) {
      const nextMessage =
        caughtError instanceof Error
          ? caughtError.message
          : "Profilni yangilab bo'lmadi.";
      setMessage(nextMessage);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel profile-panel">
      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          To'liq ism
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
        </label>

        <label>
          Elektron pochta
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          Yangi parol
          <input
            type="password"
            placeholder="Joriy parolni saqlash uchun bo'sh qoldiring"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {profile.role === 'teacher' ? (
          <label>
            Baholash rejimi
            <select
              value={evaluationMode}
              onChange={(event) =>
                setEvaluationMode(event.target.value as TeacherEvaluationMode)
              }
            >
              <option value="ai_automated">AI avtomatik</option>
              <option value="partial_assisted">Qisman yordamchi</option>
              <option value="manual">Qo'lda</option>
            </select>
          </label>
        ) : null}

        {message ? <p className="inline-message">{message}</p> : null}

        <button className="primary-button" disabled={busy} type="submit">
          {busy ? 'Profil saqlanmoqda...' : 'Profilni saqlash'}
        </button>
      </form>
    </section>
  );
}
