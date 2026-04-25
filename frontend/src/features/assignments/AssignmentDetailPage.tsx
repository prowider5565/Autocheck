import { Link, useParams } from 'react-router-dom';
import type { AppState } from '../../app/app-state';
import { MAX_HOMEWORK_ATTEMPTS, canAccessCourse } from '../../app/helpers';
import { MetricCard, NotFoundState, PageHeading } from '../../components/ui';
import { StudentAssignmentView } from './StudentAssignmentView';
import { TeacherAssignmentView } from './TeacherAssignmentView';

export function AssignmentDetailPage({ appState }: { appState: AppState }) {
  const { homeworkId, courseId } = useParams();
  const { currentUser } = appState;

  if (!currentUser || !homeworkId || !courseId) {
    return null;
  }

  const parsedHomeworkId = Number(homeworkId);
  const parsedCourseId = Number(courseId);
  const homework = appState.homeworks.find((item) => item.id === parsedHomeworkId);
  const course = appState.courses.find((item) => item.id === parsedCourseId);

  if (!homework || !course || !canAccessCourse(currentUser, course)) {
    return <NotFoundState message="This homework is not available for your account." />;
  }

  const homeworkAssignments = appState.assignments.filter(
    (assignment) => assignment.homeworkId === homework.id,
  );

  return (
    <div className="page-stack">
      <Link className="back-link" to={`/dashboard/courses/${course.id}`}>
        Back to {course.title}
      </Link>

      <PageHeading
        eyebrow="Homework"
        title={`Homework #${homework.id}`}
        description={homework.description}
      />

      <div className="hero-stats hero-stats--compact">
        <MetricCard
          label="Attempt cap"
          value={String(MAX_HOMEWORK_ATTEMPTS)}
          hint="Per student"
        />
        <MetricCard
          label="Attempts"
          value={String(homeworkAssignments.length)}
          hint="Tracked student submissions"
        />
        <MetricCard label="Polling" value="4s" hint="Frontend refresh rhythm for v1" />
      </div>

      {currentUser.role === 'student' ? (
        <StudentAssignmentView appState={appState} course={course} homework={homework} />
      ) : (
        <TeacherAssignmentView appState={appState} homework={homework} />
      )}
    </div>
  );
}
