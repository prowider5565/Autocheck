import { Link } from 'react-router-dom';
import type { AppState } from '../../app/app-state';
import { MAX_HOMEWORK_ATTEMPTS, getStudentHomeworkAssignments } from '../../app/helpers';
import type { Homework } from '../../types';
import { StatusPill } from '../../components/ui';

export function AssignmentRow({
  appState,
  homework,
  onEdit,
}: {
  appState: AppState;
  homework: Homework;
  onEdit?: (homework: Homework) => void;
}) {
  const { currentUser } = appState;
  const role = currentUser?.role;

  let rightColumn = (
    <div className="assignment-row__metrics">
      <span>Description-based homework</span>
      <span>{MAX_HOMEWORK_ATTEMPTS} attempts max</span>
    </div>
  );

  if (role === 'student' && currentUser) {
    const studentAssignments = getStudentHomeworkAssignments(
      appState.assignments,
      homework.id,
      currentUser.id,
    );
    const latest = studentAssignments[studentAssignments.length - 1];

    rightColumn = (
      <div className="assignment-row__metrics">
        <span>{studentAssignments.length}/{MAX_HOMEWORK_ATTEMPTS} attempts used</span>
        {latest ? <StatusPill status={latest.status} /> : <span>No attempts yet</span>}
      </div>
    );
  }

  if (role === 'teacher') {
    const homeworkAssignments = appState.assignments.filter(
      (assignment) => assignment.homeworkId === homework.id,
    );
    const reviewPending = homeworkAssignments.filter(
      (assignment) => assignment.status === 'review_pending',
    ).length;

    rightColumn = (
      <div className="assignment-row__metrics">
        <span>{homeworkAssignments.length} attempts submitted</span>
        <span>{reviewPending} pending review</span>
      </div>
    );
  }

  return (
    <article className="assignment-row assignment-row--card">
      <Link
        className="assignment-row__content"
        to={`/dashboard/courses/${homework.courseId}/homeworks/${homework.id}`}
      >
        <div>
          <strong>Homework #{homework.id}</strong>
          <p>{homework.description}</p>
        </div>
        {rightColumn}
      </Link>
      {role === 'teacher' && onEdit ? (
        <button
          className="ghost-button assignment-row__action"
          onClick={() => onEdit(homework)}
          type="button"
        >
          Edit
        </button>
      ) : null}
    </article>
  );
}
