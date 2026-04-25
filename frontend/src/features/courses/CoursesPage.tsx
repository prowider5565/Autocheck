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
      setMessage('Iltimos, kurs nomini kiriting.');
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
          : "Hozir kurs yaratib bo'lmadi.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <div className="panel__header panel__header--split">
        <PageHeading
          eyebrow="Mening kurslarim"
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
            Kurs yaratish
          </button>
        ) : null}
      </div>
      <div className="hero-stats hero-stats--compact">
        <MetricCard
          label="Kurslar"
          value={String(activeCourses.length)}
          hint="Panelingizdagi faol kurslar"
        />
        <MetricCard
          label="Arxiv"
          value={String(archivedCourses.length)}
          hint="Yuborilgan ishlar bilan ko'rish mumkin"
        />
        <MetricCard
          label="Uy vazifalari"
          value={String(
            appState.homeworks.filter((homework) =>
              visibleCourses.some((course) => course.id === homework.courseId),
            ).length,
          )}
          hint="Ko'rinadigan barcha kurslar bo'yicha"
        />
        <MetricCard
          label="Hozir jarayonda"
          value={String(
            appState.assignments.filter((assignment) => assignment.status === 'processing')
              .length,
          )}
          hint="Baholashni kutayotgan urinishlar"
        />
      </div>

      {!appState.dataResolved ? (
        <div className="panel">
          <EmptyState
            title="Kurslar yuklanmoqda"
            description="Panel joriy kurslar va uy vazifalari ma'lumotlarini yuklamoqda."
          />
        </div>
      ) : (
        <>
          <div className="segmented-control" role="tablist" aria-label="Kurs ko'rinishi">
            <button
              aria-pressed={courseView === 'active'}
              className={courseView === 'active' ? 'segmented-control__button segmented-control__button--active' : 'segmented-control__button'}
              onClick={() => setCourseView('active')}
              type="button"
            >
              Faol kurslar
            </button>
            <button
              aria-pressed={courseView === 'archived'}
              className={courseView === 'archived' ? 'segmented-control__button segmented-control__button--active' : 'segmented-control__button'}
              onClick={() => setCourseView('archived')}
              type="button"
            >
              Arxiv kurslar
            </button>
          </div>

          <div className="course-grid">
            {listedCourses.length === 0 ? (
              <div className="panel">
                <EmptyState
                  title={courseView === 'active' ? 'Hali faol kurslar yo\'q' : 'Hali arxiv kurslar yo\'q'}
                  description={
                    courseView === 'active'
                      ? "Backendda kurslar paydo bo'lgach, ular shu yerda va yon panel ro'yxatida ko'rinadi."
                      : "Arxiv kurslar shu yerda saqlanadi, shuning uchun ularning vazifa va yuborilgan ishlarini istalgan payt ko'rishingiz mumkin."
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
                <h2>Kurs yaratish</h2>
                <p>Avval kurs yarating, keyin uning ichiga uy vazifalarini qo'shasiz.</p>
              </div>
              <button
                className="ghost-button"
                onClick={() => {
                  setModalOpen(false);
                  setMessage(null);
                }}
                type="button"
              >
                Yopish
              </button>
            </div>

            <form className="stack-form" onSubmit={handleCreateCourse}>
              <label>
                Kurs nomi
                <input
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Algebra asoslari"
                  value={title}
                />
              </label>

              <label>
                Tavsif
                <textarea
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Kurs haqida qisqa tavsif yozing..."
                  rows={6}
                  value={description}
                />
              </label>

              {message ? <p className="inline-message inline-message--warning">{message}</p> : null}

              <button className="primary-button" disabled={busy} type="submit">
                {busy ? 'Yaratilmoqda...' : 'Kurs yaratish'}
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

  let scoreCopy = "Kurs bo'yicha umumiy ma'lumot tayyor";
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
          ? `So'nggi ball ${latestAssignment.finalScore ?? latestAssignment.geminiScore}/10`
          : "So'nggi yuborilgan javob hali qayta ishlanmoqda";
    }
  }

  return (
    <Link className="course-card" to={`/dashboard/courses/${course.id}`}>
      <div className="course-card__header">
        <span className="section-tag">{course.teacherName}</span>
        {course.isArchived ? (
          <span className="pill pill--archived">Arxiv</span>
        ) : statusLabel ? (
          <StatusPill status={statusLabel} />
        ) : null}
      </div>
      <h2>{course.title}</h2>
      <p>{course.description ?? "Hali kurs tavsifi yo'q."}</p>
      <div className="course-card__meta">
        <span>{courseHomeworks.length} ta uy vazifasi</span>
        <span>{appState.currentUser?.role === 'teacher' ? 'Sizga tegishli' : 'Talabalar uchun ochiq'}</span>
      </div>
      <strong className="course-card__score">{scoreCopy}</strong>
    </Link>
  );
}
