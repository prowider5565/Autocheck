import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { AppState } from '../../app/app-state';
import { canAccessCourse } from '../../app/helpers';
import { MetricCard, NotFoundState, PageHeading } from '../../components/ui';
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

  return (
    <div className="page-stack">
      <Link className="back-link" to="/dashboard/courses">
        Back to my courses
      </Link>

      <PageHeading
        title={currentCourse.title}
        description={currentCourse.description ?? 'No course description yet.'}
      />

      <div className="hero-stats hero-stats--compact">
        <MetricCard
          label="Teacher"
          value={currentCourse.teacherName}
          hint="Single owner in v1"
        />
        <MetricCard
          label="Homeworks"
          value={String(courseHomeworks.length)}
          hint="Teacher-created prompts in this course"
        />
        <MetricCard
          label="Pending review"
          value={String(reviewPendingCount)}
          hint="Teacher action needed"
        />
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
            <button className="primary-button" onClick={openCreateModal} type="button">
              Add new homework
            </button>
          ) : null}
        </div>

        <div className="assignment-list">
          {courseHomeworks.map((homework) => (
            <AssignmentRow
              appState={appState}
              homework={homework}
              key={homework.id}
              onEdit={currentUser.role === 'teacher' ? openEditModal : undefined}
            />
          ))}
          {courseHomeworks.length === 0 ? (
            <NotFoundState message="No homeworks have been created for this course yet." />
          ) : null}
        </div>
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
