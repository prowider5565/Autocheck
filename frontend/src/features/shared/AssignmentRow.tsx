import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const homeworkLink = `/dashboard/courses/${homework.courseId}/homeworks/${homework.id}`;
  const showActions = role === 'teacher' && Boolean(onEdit);

  function openHomework() {
    navigate(homeworkLink);
  }

  let statusCell = (
    <td className="homework-table__cell">
      <span className="homework-table__muted">{MAX_HOMEWORK_ATTEMPTS} attempts max</span>
    </td>
  );
  let metricsCell = (
    <td className="homework-table__cell">
      <span className="homework-table__muted">Description-based homework</span>
    </td>
  );

  if (role === 'student' && currentUser) {
    const studentAssignments = getStudentHomeworkAssignments(
      appState.assignments,
      homework.id,
      currentUser.id,
    );
    const latest = studentAssignments[studentAssignments.length - 1];

    metricsCell = (
      <td className="homework-table__cell">
        <span className="homework-table__muted">
          {studentAssignments.length}/{MAX_HOMEWORK_ATTEMPTS} attempts used
        </span>
      </td>
    );
    statusCell = (
      <td className="homework-table__cell">
        {latest ? <StatusPill status={latest.status} /> : <span className="homework-table__muted">No attempts yet</span>}
      </td>
    );
  }

  if (role === 'teacher') {
    const homeworkAssignments = appState.assignments.filter(
      (assignment) => assignment.homeworkId === homework.id,
    );
    const reviewPending = homeworkAssignments.filter(
      (assignment) => assignment.status === 'review_pending',
    ).length;

    metricsCell = (
      <td className="homework-table__cell">
        <span className="homework-table__muted">{homeworkAssignments.length} attempts submitted</span>
      </td>
    );
    statusCell = (
      <td className="homework-table__cell">
        <span className="homework-table__muted">{reviewPending} pending review</span>
      </td>
    );
  }

  return (
    <tr
      className="homework-table__row homework-table__row--interactive"
      onClick={openHomework}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openHomework();
        }
      }}
      role="link"
      tabIndex={0}
    >
      <td className="homework-table__cell">
        <strong>Homework #{homework.id}</strong>
      </td>
      <td className="homework-table__cell homework-table__cell--description">
        {homework.description}
      </td>
      {metricsCell}
      {statusCell}
      {showActions ? (
        <td className="homework-table__cell homework-table__actions">
          <button
            className="ghost-button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit?.(homework);
            }}
            type="button"
          >
            Edit
          </button>
        </td>
      ) : null}
    </tr>
  );
}
