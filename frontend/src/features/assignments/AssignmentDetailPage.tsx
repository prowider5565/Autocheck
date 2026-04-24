import { Link, useParams } from 'react-router-dom';
import type { AppState } from '../../app/app-state';
import { canAccessCourse } from '../../app/helpers';
import { MetricCard, NotFoundState, PageHeading } from '../../components/ui';
import { StudentAssignmentView } from './StudentAssignmentView';
import { TeacherAssignmentView } from './TeacherAssignmentView';

export function AssignmentDetailPage({ appState }: { appState: AppState }) {
  const { assignmentId, courseId } = useParams();
  const { currentUser } = appState;

  if (!currentUser || !assignmentId || !courseId) {
    return null;
  }

  const assignment = appState.assignments.find((item) => item.id === assignmentId);
  const course = appState.courses.find((item) => item.id === courseId);

  if (!assignment || !course || !canAccessCourse(currentUser, course)) {
    return <NotFoundState message="This assignment is not available for your account." />;
  }

  return (
    <div className="page-stack">
      <Link className="back-link" to={`/dashboard/courses/${course.id}`}>
        Back to {course.title}
      </Link>

      <PageHeading
        eyebrow="Assignment"
        title={assignment.title}
        description={assignment.instructions}
      />

      <div className="hero-stats hero-stats--compact">
        <MetricCard
          label="Evaluation mode"
          value={assignment.evaluationMode}
          hint="Automatic or teacher review"
        />
        <MetricCard
          label="Attempt cap"
          value={String(assignment.maxAttempts)}
          hint="Per student"
        />
        <MetricCard
          label="Polling"
          value="4s"
          hint="Frontend refresh rhythm for v1"
        />
      </div>

      {currentUser.role === 'student' ? (
        <StudentAssignmentView
          appState={appState}
          assignment={assignment}
          course={course}
        />
      ) : (
        <TeacherAssignmentView appState={appState} assignment={assignment} />
      )}
    </div>
  );
}
