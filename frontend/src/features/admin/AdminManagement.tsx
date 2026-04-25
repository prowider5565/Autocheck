import type { AppState } from '../../app/app-state';
import { EmptyState } from '../../components/ui';

export function AdminManagement({ appState }: { appState: AppState }) {
  return (
    <section className="panel">
      <EmptyState
        title="Admin tools postponed"
        description={`The current implementation phase is focused on courses, homeworks, and student assignment attempts. Signed-in role: ${appState.currentUser?.role ?? 'unknown'}.`}
      />
    </section>
  );
}
