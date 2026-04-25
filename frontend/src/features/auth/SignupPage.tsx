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
          : "Akkaunt yaratib bo'lmadi.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-hero auth-hero--compact">
        <span className="section-tag">Ochiq ro'yxatdan o'tish</span>
        <h1>Talaba yoki o'qituvchi akkauntini yarating.</h1>
        <p>
          Google orqali kirishda noma'lum email shu yerga oldindan to'ldirilgan holda qaytadi,
          shuning uchun foydalanuvchi faqat rolni, ismni va parolni tanlaydi.
        </p>
      </section>

      <section className="auth-card">
        <div className="auth-card__header">
          <span className="section-tag">
            {comingFromGoogle ? "Google orqali o'tish" : 'Boshlash'}
          </span>
          <h2>Akkauntingizni sozlang</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            To'liq ism
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
            Elektron pochta
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
            Rol
            <select
              value={draft.role}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  role: event.target.value as DraftSignup['role'],
                }))
              }
            >
              <option value="student">Talaba</option>
              <option value="teacher">O'qituvchi</option>
            </select>
          </label>

          <label>
            Parol
            <input
              type="password"
              placeholder="Xavfsiz parol tanlang"
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
            {submitting ? 'Akkaunt yaratilmoqda...' : 'Akkaunt yaratish'}
          </button>
        </form>

        <p className="auth-footnote">
          Akkauntingiz bormi? <Link to="/login">Kirish sahifasiga qaytish</Link>
        </p>
      </section>
    </div>
  );
}
