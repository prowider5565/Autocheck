import { useState, type FormEvent } from 'react';
import type { AppState } from '../../app/app-state';
import {
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

  if (!currentUser) {
    return null;
  }

  const visibleCourses = getVisibleCourses(currentUser, appState.courses);

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
            className="primary-button"
            onClick={() => {
              setModalOpen(true);
              setMessage(null);
            }}
            type="button"
          >
            Create course
          </button>
        ) : null}
      </div>
      <div className="hero-stats hero-stats--compact">
        <MetricCard
          label="Courses"
          value={String(visibleCourses.length)}
          hint="Visible in your dashboard"
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
        <div className="course-grid">
          {visibleCourses.length === 0 ? (
            <div className="panel">
              <EmptyState
                title="No courses yet"
                description="Once courses exist in the backend, they will appear here and inside the sidebar dropdown."
              />
            </div>
          ) : (
            visibleCourses.map((course) => (
              <CourseCard appState={appState} course={course} key={course.id} />
            ))
          )}
        </div>
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
        {statusLabel ? <StatusPill status={statusLabel} /> : null}
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
