import type { SubmissionStatus } from '../types';

export function StatusPill({ status }: { status: SubmissionStatus }) {
  return <span className={`status-pill status-pill--${status}`}>{status}</span>;
}

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-heading">
      <span className="section-tag">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

export function NotFoundState({ message }: { message: string }) {
  return (
    <div className="page-stack">
      <div className="panel">
        <EmptyState title="Unavailable" description={message} />
      </div>
    </div>
  );
}

export function SplashScreen() {
  return (
    <div className="auth-shell">
      <section className="auth-hero auth-hero--compact">
        <span className="section-tag">Checking session</span>
        <h1>Loading your workspace...</h1>
        <p>The frontend is asking the backend for the current profile using the auth cookie.</p>
      </section>
    </div>
  );
}
