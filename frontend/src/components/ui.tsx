import type { AssignmentStatus } from '../types';

export function StatusPill({ status }: { status: AssignmentStatus }) {
  const statusLabel: Record<AssignmentStatus, string> = {
    processing: 'Jarayonda',
    review_pending: "Ko'rib chiqish kutilmoqda",
    graded: 'Baholangan',
  };

  return <span className={`status-pill status-pill--${status}`}>{statusLabel[status]}</span>;
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
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-heading">
      {eyebrow ? <span className="section-tag">{eyebrow}</span> : null}
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
        <EmptyState title="Mavjud emas" description={message} />
      </div>
    </div>
  );
}

export function SplashScreen() {
  return (
    <div className="auth-shell">
      <section className="auth-hero auth-hero--compact">
        <span className="section-tag">Sessiya tekshirilmoqda</span>
        <h1>Ish maydoni yuklanmoqda...</h1>
        <p>Frontend bearer token orqali backenddan joriy profil ma'lumotlarini so'ramoqda.</p>
      </section>
    </div>
  );
}
