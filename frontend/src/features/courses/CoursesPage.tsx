import type { AppState } from '../../app/app-state';
import {
  getCoursesDescription,
  getCoursesTitle,
  getVisibleCourses,
} from '../../app/helpers';
import { EmptyState, MetricCard, PageHeading, StatusPill } from '../../components/ui';
import type { Course, SubmissionStatus } from '../../types';
import { getLatestCourseSubmissionForStudent } from '../../app/helpers';
import { Link } from 'react-router-dom';
import { AdminManagement } from '../admin/AdminManagement';
import { ProfilePanel } from '../dashboard/ProfilePanel';

export function CoursesPage({ appState }: { appState: AppState }) {
  const { currentUser } = appState;

  if (!currentUser) {
    return null;
  }

  const visibleCourses = getVisibleCourses(currentUser, appState.courses);

  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="My courses"
        title={getCoursesTitle(currentUser.role)}
        description={getCoursesDescription(currentUser.role)}
      />

      <ProfilePanel appState={appState} />

      <div className="hero-stats hero-stats--compact">
        <MetricCard
          label="Courses"
          value={String(visibleCourses.length)}
          hint="Role-aware visibility"
        />
        <MetricCard
          label="Assignments"
          value={String(
            appState.assignments.filter((assignment) =>
              visibleCourses.some((course) => course.id === assignment.courseId),
            ).length,
          )}
          hint="Across visible courses"
        />
        <MetricCard
          label="Processing now"
          value={String(
            appState.submissions.filter((submission) => submission.status === 'processing')
              .length,
          )}
          hint="Async Gemini queue"
        />
      </div>

      {currentUser.role === 'admin' ? (
        <AdminManagement appState={appState} />
      ) : (
        <div className="course-grid">
          {visibleCourses.length === 0 ? (
            <div className="panel">
              <EmptyState
                title="No courses yet"
                description="Your authentication is now real. The course area is still backed by mock course data, so newly registered accounts will stay empty until enrollment and course APIs are added."
              />
            </div>
          ) : (
            visibleCourses.map((course) => (
              <CourseCard appState={appState} course={course} key={course.id} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function CourseCard({
  appState,
  course,
}: {
  appState: AppState;
  course: Course;
}) {
  const teacher = appState.users.find((user) => user.id === course.teacherId);
  const courseAssignments = appState.assignments.filter(
    (assignment) => assignment.courseId === course.id,
  );

  let scoreCopy = 'Course overview ready';
  let statusLabel: SubmissionStatus | null = null;

  if (appState.currentUser?.role === 'student') {
    const latestStudentSubmission = getLatestCourseSubmissionForStudent(
      course.id,
      appState.currentUser.id,
      appState.assignments,
      appState.submissions,
    );

    if (latestStudentSubmission) {
      statusLabel = latestStudentSubmission.status;
      scoreCopy =
        latestStudentSubmission.status === 'graded'
          ? `Latest score ${latestStudentSubmission.finalScore ?? latestStudentSubmission.geminiScore}/10`
          : 'Newest homework is still being processed';
    }
  }

  return (
    <Link className="course-card" to={`/dashboard/courses/${course.id}`}>
      <div className="course-card__header">
        <span className="section-tag">{teacher?.fullName ?? 'Teacher missing'}</span>
        {statusLabel ? <StatusPill status={statusLabel} /> : null}
      </div>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <div className="course-card__meta">
        <span>{courseAssignments.length} assignments</span>
        <span>{course.studentIds.length} students</span>
      </div>
      <strong className="course-card__score">{scoreCopy}</strong>
    </Link>
  );
}
