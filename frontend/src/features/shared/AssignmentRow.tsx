import { Link } from 'react-router-dom';
import type { AppState } from '../../app/app-state';
import { getStudentAssignmentSubmissions } from '../../app/helpers';
import type { Assignment } from '../../types';
import { StatusPill } from '../../components/ui';

export function AssignmentRow({
  appState,
  assignment,
}: {
  appState: AppState;
  assignment: Assignment;
}) {
  const { currentUser } = appState;
  const course = appState.courses.find((item) => item.id === assignment.courseId)!;
  const role = currentUser?.role;

  let rightColumn = (
    <div className="assignment-row__metrics">
      <span>{assignment.evaluationMode}</span>
      <span>{assignment.maxAttempts} attempts max</span>
    </div>
  );

  if (role === 'student' && currentUser) {
    const studentSubmissions = getStudentAssignmentSubmissions(
      appState.submissions,
      assignment.id,
      currentUser.id,
    );
    const latest = studentSubmissions[studentSubmissions.length - 1];

    rightColumn = (
      <div className="assignment-row__metrics">
        <span>{studentSubmissions.length}/{assignment.maxAttempts} attempts used</span>
        {latest ? <StatusPill status={latest.status} /> : <span>No attempts yet</span>}
      </div>
    );
  }

  if (role === 'teacher') {
    const teacherSubmissions = appState.submissions.filter(
      (submission) => submission.assignmentId === assignment.id,
    );
    const reviewPending = teacherSubmissions.filter(
      (submission) => submission.status === 'review_pending',
    ).length;

    rightColumn = (
      <div className="assignment-row__metrics">
        <span>{teacherSubmissions.length} attempts submitted</span>
        <span>{reviewPending} pending review</span>
      </div>
    );
  }

  return (
    <Link
      className="assignment-row"
      to={`/dashboard/courses/${course.id}/assignments/${assignment.id}`}
    >
      <div>
        <strong>{assignment.title}</strong>
        <p>{assignment.instructions}</p>
      </div>
      {rightColumn}
    </Link>
  );
}
