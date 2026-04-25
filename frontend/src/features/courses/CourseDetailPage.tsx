import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { AppState } from '../../app/app-state';
import { canAccessCourse } from '../../app/helpers';
import { MetricCard, NotFoundState } from '../../components/ui';
import { AssignmentRow } from '../shared/AssignmentRow';
import type { Homework } from '../../types';

export function CourseDetailPage({ appState }: { appState: AppState }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser, assignments, homeworks } = appState;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [archiveBusy, setArchiveBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!currentUser || !courseId) {
    return null;
  }

  const parsedCourseId = Number(courseId);
  const course = appState.courses.find((item) => item.id === parsedCourseId);

  if (!course || !canAccessCourse(currentUser, course)) {
    return <NotFoundState message="This course is not available for your account." />;
  }

  const currentCourse = course;

  const courseHomeworks = homeworks.filter(
    (homework) => homework.courseId === currentCourse.id,
  );
  const reviewPendingCount = assignments.filter((assignment) => {
    const homework = homeworks.find((item) => item.id === assignment.homeworkId);

    return homework?.courseId === currentCourse.id && assignment.status === 'review_pending';
  }).length;
  const teacherOwnedCourses = useMemo(
    () =>
      appState.courses.filter(
        (item) => currentUser.role === 'teacher' && item.teacherId === currentUser.id,
      ),
    [appState.courses, currentUser],
  );

  function openCreateModal() {
    setEditingHomework(null);
    setSelectedCourseId(currentCourse.id);
    setDescription('');
    setMessage(null);
    setModalOpen(true);
  }

  function openEditModal(homework: Homework) {
    setEditingHomework(homework);
    setSelectedCourseId(homework.courseId);
    setDescription(homework.description);
    setMessage(null);
    setModalOpen(true);
  }

  async function handleHomeworkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCourseId || !description.trim()) {
      setMessage('Please choose a course and enter a homework description.');
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      if (editingHomework) {
        await appState.updateHomework(editingHomework.id, {
          description: description.trim(),
        });
      } else {
        await appState.createHomework({
          courseId: selectedCourseId,
          description: description.trim(),
        });
      }

      setModalOpen(false);
      setDescription('');
      setEditingHomework(null);

      if (!editingHomework && selectedCourseId !== currentCourse.id) {
        navigate(`/dashboard/courses/${selectedCourseId}`);
      }
    } catch (caughtError) {
      setMessage(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to save the homework right now.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleArchiveToggle() {
    setArchiveBusy(true);
    setMessage(null);

    try {
      await appState.archiveCourse({
        courseId: currentCourse.id,
        isArchived: !currentCourse.isArchived,
      });
    } catch (caughtError) {
      setMessage(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to update the course archive state right now.',
      );
    } finally {
      setArchiveBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <Link className="back-link" to="/dashboard/courses">
        Back to my courses
      </Link>

      <div className="panel__header panel__header--split">
        <div className="page-heading page-heading--compact">
          <h2>{currentCourse.title}</h2>
          <p>{currentCourse.description ?? 'No course description yet.'}</p>
        </div>
        {currentUser.role === 'teacher' ? (
          <button
            className="ghost-button button-with-icon"
            disabled={archiveBusy}
            onClick={handleArchiveToggle}
            type="button"
          >
            <ArchiveIcon />
            {archiveBusy
              ? currentCourse.isArchived
                ? 'Restoring...'
                : 'Archiving...'
              : currentCourse.isArchived
                ? 'Unarchive course'
                : 'Archive course'}
          </button>
        ) : null}
      </div>

      {currentCourse.isArchived ? (
        <div className="inline-message inline-message--warning">
          This course is archived. You can still view its homeworks and submissions.
        </div>
      ) : null}

      {message ? <div className="inline-message inline-message--warning">{message}</div> : null}

      <div className="hero-stats hero-stats--compact">
        <MetricCard
          label="Teacher"
          value={currentCourse.teacherName}
          hint="Single owner in v1"
        />
        <MetricCard
          label="Visibility"
          value={currentCourse.isArchived ? 'Archived' : 'Active'}
          hint={currentCourse.isArchived ? 'Read history anytime' : 'Open for current work'}
        />
        <MetricCard
          label="Homeworks"
          value={String(courseHomeworks.length)}
          hint="Teacher-created prompts in this course"
        />
        <MetricCard label="Pending review" value={String(reviewPendingCount)} hint="Teacher action needed" />
      </div>

      <div className="panel">
        <div className="panel__header panel__header--split">
          <div>
            <h2>Homeworks</h2>
            <p>
              {currentUser.role === 'student'
                ? 'Open a homework to submit your response and review your assignment attempt history.'
                : 'Create new homeworks, edit descriptions, and inspect student assignment attempts.'}
            </p>
          </div>
          {currentUser.role === 'teacher' ? (
            <button className="primary-button button-with-icon" onClick={openCreateModal} type="button">
              <AddIcon />
              Add new homework
            </button>
          ) : null}
        </div>

        {courseHomeworks.length === 0 ? (
          <NotFoundState message="No homeworks have been created for this course yet." />
        ) : (
          <div className="table-shell">
            <table className="homework-table">
              <thead>
                <tr>
                  <th>Homework</th>
                  <th>Description</th>
                  <th>{currentUser.role === 'teacher' ? 'Attempts' : 'Usage'}</th>
                  <th>{currentUser.role === 'teacher' ? 'Pending review' : 'Status'}</th>
                  {currentUser.role === 'teacher' ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {courseHomeworks.map((homework) => (
                  <AssignmentRow
                    appState={appState}
                    homework={homework}
                    key={homework.id}
                    onEdit={currentUser.role === 'teacher' ? openEditModal : undefined}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div
            aria-modal="true"
            className="modal-card"
            role="dialog"
          >
            <div className="panel__header panel__header--split">
              <div>
                <h2>{editingHomework ? 'Edit homework' : 'Add new homework'}</h2>
                <p>
                  {editingHomework
                    ? 'Update the homework description.'
                    : 'Select a course, write the homework text, and create it.'}
                </p>
              </div>
              <button
                className="ghost-button"
                onClick={() => {
                  setModalOpen(false);
                  setEditingHomework(null);
                  setMessage(null);
                }}
                type="button"
              >
                Close
              </button>
            </div>

            <form className="stack-form" onSubmit={handleHomeworkSubmit}>
              <label>
                Course
                <select
                  disabled={Boolean(editingHomework)}
                  onChange={(event) => setSelectedCourseId(Number(event.target.value))}
                  value={selectedCourseId ?? ''}
                >
                  {teacherOwnedCourses.map((teacherCourse) => (
                    <option key={teacherCourse.id} value={teacherCourse.id}>
                      {teacherCourse.title}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Homework description
                <textarea
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Write the homework text here..."
                  rows={8}
                  value={description}
                />
              </label>

              {message ? <p className="inline-message inline-message--warning">{message}</p> : null}

              <button className="primary-button" disabled={busy} type="submit">
                {busy
                  ? editingHomework
                    ? 'Saving...'
                    : 'Creating...'
                  : editingHomework
                    ? 'Save homework'
                    : 'Create homework'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ArchiveIcon() {
  return (
    <span aria-hidden="true" className="button__icon">
      <svg viewBox="0 0 24 24">
        <path d="M4 7.5h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-11Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M3 7.5 5 4h14l2 3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M9 12h6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    </span>
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
