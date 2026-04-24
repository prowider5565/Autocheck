import { Link, useParams } from 'react-router-dom';
import type { AppState } from '../../app/app-state';
import { canAccessCourse } from '../../app/helpers';
import { MetricCard, NotFoundState, PageHeading } from '../../components/ui';
import { AssignmentRow } from '../shared/AssignmentRow';

export function CourseDetailPage({ appState }: { appState: AppState }) {
  const { courseId } = useParams();
  const { currentUser, assignments, submissions } = appState;

  if (!currentUser || !courseId) {
    return null;
  }

  const course = appState.courses.find((item) => item.id === courseId);

  if (!course || !canAccessCourse(currentUser, course)) {
    return <NotFoundState message="This course is not available for your account." />;
  }

  const teacher = appState.users.find((user) => user.id === course.teacherId);
  const courseAssignments = assignments.filter(
    (assignment) => assignment.courseId === course.id,
  );
  const reviewPendingCount = submissions.filter((submission) => {
    const assignment = assignments.find((item) => item.id === submission.assignmentId);

    return assignment?.courseId === course.id && submission.status === 'review_pending';
  }).length;

  return (
    <div className="page-stack">
      <Link className="back-link" to="/dashboard/courses">
        Back to my courses
      </Link>

      <PageHeading
        eyebrow="Course detail"
        title={course.title}
        description={course.description}
      />

      <div className="hero-stats hero-stats--compact">
        <MetricCard label="Teacher" value={teacher?.fullName ?? 'Unknown'} hint="Single owner in v1" />
        <MetricCard
          label="Assignments"
          value={String(courseAssignments.length)}
          hint="Homework attached to this course"
        />
        <MetricCard
          label="Pending review"
          value={String(reviewPendingCount)}
          hint="Teacher action needed"
        />
      </div>

      <div className="panel">
        <div className="panel__header">
          <h2>Assignments</h2>
          <p>
            {currentUser.role === 'student'
              ? 'Submit work, track attempt limits, and watch statuses change as Gemini finishes.'
              : 'Open each assignment to inspect submissions and complete teacher review when needed.'}
          </p>
        </div>

        <div className="assignment-list">
          {courseAssignments.map((assignment) => (
            <AssignmentRow
              appState={appState}
              assignment={assignment}
              key={assignment.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
