import type { AppState } from '../../app/app-state';
import { EmptyState } from '../../components/ui';

export function AdminManagement({ appState }: { appState: AppState }) {
  const roleLabel =
    appState.currentUser?.role === 'teacher'
      ? "o'qituvchi"
      : appState.currentUser?.role === 'student'
        ? 'talaba'
        : appState.currentUser?.role === 'admin'
          ? 'admin'
          : "noma'lum";

  return (
    <section className="panel">
      <EmptyState
        title="Admin vositalari keyinga qoldirilgan"
        description={`Joriy bosqich kurslar, uy vazifalari va talabalar urinishlariga qaratilgan. Tizimga kirgan rol: ${roleLabel}.`}
      />
    </section>
  );
}
