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
    return <NotFoundState message="Bu kurs akkauntingiz uchun mavjud emas." />;
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
      setMessage('Iltimos, kursni tanlang va uy vazifasi tavsifini kiriting.');
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
          : "Hozir uy vazifasini saqlab bo'lmadi.",
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
          : "Hozir kurs arxiv holatini yangilab bo'lmadi.",
      );
    } finally {
      setArchiveBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <Link className="back-link" to="/dashboard/courses">
        Kurslarimga qaytish
      </Link>

      <div className="panel__header panel__header--split">
        <div className="page-heading page-heading--compact">
          <h2>{currentCourse.title}</h2>
          <p>{currentCourse.description ?? "Hali kurs tavsifi yo'q."}</p>
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
                ? 'Tiklanmoqda...'
                : 'Arxivlanmoqda...'
              : currentCourse.isArchived
                ? 'Kursni arxivdan chiqarish'
                : 'Kursni arxivlash'}
          </button>
        ) : null}
      </div>

      {currentCourse.isArchived ? (
        <div className="inline-message inline-message--warning">
          Bu kurs arxivlangan. Siz hali ham uning uy vazifalari va yuborilgan ishlarini ko'rishingiz mumkin.
        </div>
      ) : null}

      {message ? <div className="inline-message inline-message--warning">{message}</div> : null}

      <div className="hero-stats hero-stats--compact">
        <MetricCard
          label="O'qituvchi"
          value={currentCourse.teacherName}
          hint="v1 da bitta mas'ul o'qituvchi"
        />
        <MetricCard
          label="Holat"
          value={currentCourse.isArchived ? 'Arxiv' : 'Faol'}
          hint={currentCourse.isArchived ? "Tarixni istalgan payt ko'rish mumkin" : 'Joriy ish uchun ochiq'}
        />
        <MetricCard
          label="Uy vazifalari"
          value={String(courseHomeworks.length)}
          hint="Bu kursdagi o'qituvchi yaratgan topshiriqlar"
        />
        <MetricCard label="Kutilayotgan tekshiruv" value={String(reviewPendingCount)} hint="O'qituvchi harakati kerak" />
      </div>

      <div className="panel">
        <div className="panel__header panel__header--split">
          <div>
            <h2>Uy vazifalari</h2>
            <p>
              {currentUser.role === 'student'
                ? "Javob yuborish va urinishlar tarixini ko'rish uchun uy vazifasini oching."
                : "Yangi uy vazifalari yarating, tavsiflarni tahrirlang va talabalar urinishlarini ko'rib chiqing."}
            </p>
          </div>
          {currentUser.role === 'teacher' ? (
            <button className="primary-button button-with-icon" onClick={openCreateModal} type="button">
              <AddIcon />
              Yangi uy vazifasi qo'shish
            </button>
          ) : null}
        </div>

        {courseHomeworks.length === 0 ? (
          <NotFoundState message="Bu kurs uchun hali uy vazifalari yaratilmagan." />
        ) : (
          <div className="table-shell">
            <table className="homework-table">
              <thead>
                <tr>
                  <th>Uy vazifasi</th>
                  <th>Tavsif</th>
                  <th>{currentUser.role === 'teacher' ? 'Urinishlar' : 'Foydalanish'}</th>
                  <th>{currentUser.role === 'teacher' ? 'Kutilayotgan tekshiruv' : 'Holat'}</th>
                  {currentUser.role === 'teacher' ? <th>Amallar</th> : null}
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
                <h2>{editingHomework ? 'Uy vazifasini tahrirlash' : "Yangi uy vazifasi qo'shish"}</h2>
                <p>
                  {editingHomework
                    ? 'Uy vazifasi tavsifini yangilang.'
                    : "Kursni tanlang, vazifa matnini yozing va yarating."}
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
                Yopish
              </button>
            </div>

            <form className="stack-form" onSubmit={handleHomeworkSubmit}>
              <label>
                Kurs
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
                Uy vazifasi tavsifi
                <textarea
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Uy vazifasi matnini shu yerga yozing..."
                  rows={8}
                  value={description}
                />
              </label>

              {message ? <p className="inline-message inline-message--warning">{message}</p> : null}

              <button className="primary-button" disabled={busy} type="submit">
                {busy
                  ? editingHomework
                    ? 'Saqlanmoqda...'
                    : 'Yaratilmoqda...'
                  : editingHomework
                    ? 'Uy vazifasini saqlash'
                    : 'Uy vazifasini yaratish'}
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
