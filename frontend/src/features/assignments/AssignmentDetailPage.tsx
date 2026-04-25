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
    return <NotFoundState message="Bu uy vazifasi akkauntingiz uchun mavjud emas." />;
  }

  const homeworkAssignments = appState.assignments.filter(
    (assignment) => assignment.homeworkId === homework.id,
  );

  return (
    <div className="page-stack">
      <Link className="back-link" to={`/dashboard/courses/${course.id}`}>
        {course.title} sahifasiga qaytish
      </Link>

      <PageHeading
        title={`Uy vazifasi #${homework.id}`}
        description={homework.description}
      />

      <div className="hero-stats hero-stats--compact">
        <MetricCard
          label="Urinish limiti"
          value={String(MAX_HOMEWORK_ATTEMPTS)}
          hint="Har bir talaba uchun"
        />
        <MetricCard
          label="Urinishlar"
          value={String(homeworkAssignments.length)}
          hint="Kuzatilgan talabalar topshiriqlari"
        />
        <MetricCard label="Yangilanish" value="4s" hint="v1 uchun frontend yangilanish oralig'i" />
      </div>

      {currentUser.role === 'student' ? (
        <StudentAssignmentView appState={appState} course={course} homework={homework} />
      ) : (
        <TeacherAssignmentView appState={appState} homework={homework} />
      )}
    </div>
  );
}
