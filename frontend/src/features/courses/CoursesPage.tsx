import { useState, type FormEvent } from 'react';
import type { AppState } from '../../app/app-state';
import {
  getActiveCourses,
  getArchivedCourses,
  getCoursesDescription,
  getCoursesTitle,
  getLatestCourseAssignmentForStudent,
  getVisibleCourses,
} from '../../app/helpers';
import {
  EmptyState,
  MetricCard,
  PageHeading,
  StatusPill,
} from '../../components/ui';
import type { AssignmentStatus, Course } from '../../types';
import { Link, useNavigate } from 'react-router-dom';

export function CoursesPage({ appState }: { appState: AppState }) {
  const { currentUser } = appState;
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [courseView, setCourseView] = useState<'active' | 'archived'>('active');

  if (!currentUser) {
    return null;
  }

  const visibleCourses = getVisibleCourses(currentUser, appState.courses);
  const activeCourses = getActiveCourses(visibleCourses);
  const archivedCourses = getArchivedCourses(visibleCourses);
  const listedCourses = courseView === 'active' ? activeCourses : archivedCourses;

  async function handleCreateCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setMessage('Please enter a course title.');
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const course = await appState.createCourse({
        title: title.trim(),
        description: description.trim(),
      });

      setModalOpen(false);
      setTitle('');
      setDescription('');
      navigate(`/dashboard/courses/${course.id}`);
    } catch (caughtError) {
      setMessage(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to create the course right now.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <div className="panel__header panel__header--split">
        <PageHeading
          eyebrow="My courses"
          title={getCoursesTitle(currentUser.role)}
          description={getCoursesDescription(currentUser.role)}
        />
        {currentUser.role === 'teacher' ? (
          <button
            className="primary-button button-with-icon"
            onClick={() => {
              setModalOpen(true);
              setMessage(null);
            }}
            type="button"
          >
            <AddIcon />
            Create course
          </button>
        ) : null}
      </div>
      <div className="hero-stats hero-stats--compact">
        <MetricCard
          label="Courses"
          value={String(activeCourses.length)}
          hint="Active in your dashboard"
        />
        <MetricCard
          label="Archived"
          value={String(archivedCourses.length)}
          hint="Still viewable with submissions"
        />
        <MetricCard
          label="Homeworks"
          value={String(
            appState.homeworks.filter((homework) =>
              visibleCourses.some((course) => course.id === homework.courseId),
            ).length,
          )}
          hint="Across visible courses"
        />
        <MetricCard
          label="Processing now"
          value={String(
            appState.assignments.filter((assignment) => assignment.status === 'processing')
              .length,
          )}
          hint="Student attempts awaiting evaluation"
        />
      </div>

      {!appState.dataResolved ? (
        <div className="panel">
          <EmptyState
            title="Loading courses"
            description="The dashboard is fetching your current course and homework data."
          />
        </div>
      ) : (
        <>
          <div className="segmented-control" role="tablist" aria-label="Course visibility">
            <button
              aria-pressed={courseView === 'active'}
              className={courseView === 'active' ? 'segmented-control__button segmented-control__button--active' : 'segmented-control__button'}
              onClick={() => setCourseView('active')}
              type="button"
            >
              Active courses
            </button>
            <button
              aria-pressed={courseView === 'archived'}
              className={courseView === 'archived' ? 'segmented-control__button segmented-control__button--active' : 'segmented-control__button'}
              onClick={() => setCourseView('archived')}
              type="button"
            >
              Archived courses
            </button>
          </div>

          <div className="course-grid">
            {listedCourses.length === 0 ? (
              <div className="panel">
                <EmptyState
                  title={courseView === 'active' ? 'No active courses yet' : 'No archived courses yet'}
                  description={
                    courseView === 'active'
                      ? 'Once courses exist in the backend, they will appear here and inside the sidebar dropdown.'
                      : 'Archived courses will stay available here so you can review their homeworks and submissions anytime.'
                  }
                />
              </div>
            ) : (
              listedCourses.map((course) => (
                <CourseCard appState={appState} course={course} key={course.id} />
              ))
            )}
          </div>
        </>
      )}

      {modalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div aria-modal="true" className="modal-card" role="dialog">
            <div className="panel__header panel__header--split">
              <div>
                <h2>Create course</h2>
                <p>Create the course first, then you can add homework inside it.</p>
              </div>
              <button
                className="ghost-button"
                onClick={() => {
                  setModalOpen(false);
                  setMessage(null);
                }}
                type="button"
              >
                Close
              </button>
            </div>

            <form className="stack-form" onSubmit={handleCreateCourse}>
              <label>
                Course title
                <input
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Algebra Foundations"
                  value={title}
                />
              </label>

              <label>
                Description
                <textarea
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Write a short course description..."
                  rows={6}
                  value={description}
                />
              </label>

              {message ? <p className="inline-message inline-message--warning">{message}</p> : null}

              <button className="primary-button" disabled={busy} type="submit">
                {busy ? 'Creating...' : 'Create course'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AddIcon() {
  return (
    <span aria-hidden="true" className="button__icon">
      <svg viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    </span>
  );
}

function CourseCard({
  appState,
  course,
}: {
  appState: AppState;
  course: Course;
}) {
  const courseHomeworks = appState.homeworks.filter(
    (homework) => homework.courseId === course.id,
  );

  let scoreCopy = 'Course overview ready';
  let statusLabel: AssignmentStatus | null = null;

  if (appState.currentUser?.role === 'student') {
    const latestAssignment = getLatestCourseAssignmentForStudent(
      course.id,
      appState.currentUser.id,
      appState.homeworks,
      appState.assignments,
    );

    if (latestAssignment) {
      statusLabel = latestAssignment.status;
      scoreCopy =
        latestAssignment.status === 'graded'
          ? `Latest score ${latestAssignment.finalScore ?? latestAssignment.geminiScore}/10`
          : 'Newest submission is still being processed';
    }
  }

  return (
    <Link className="course-card" to={`/dashboard/courses/${course.id}`}>
      <div className="course-card__header">
        <span className="section-tag">{course.teacherName}</span>
        {course.isArchived ? (
          <span className="pill pill--archived">Archived</span>
        ) : statusLabel ? (
          <StatusPill status={statusLabel} />
        ) : null}
      </div>
      <h2>{course.title}</h2>
      <p>{course.description ?? 'No course description yet.'}</p>
      <div className="course-card__meta">
        <span>{courseHomeworks.length} homeworks</span>
        <span>{appState.currentUser?.role === 'teacher' ? 'Owned by you' : 'Open to students'}</span>
      </div>
      <strong className="course-card__score">{scoreCopy}</strong>
    </Link>
  );
}
