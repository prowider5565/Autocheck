import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppState } from '../../app/app-state';
import { MAX_HOMEWORK_ATTEMPTS, getStudentHomeworkAssignments } from '../../app/helpers';
import { EmptyState } from '../../components/ui';
import type { Course, Homework, SubmissionSourceType } from '../../types';
import { SubmissionCard } from '../shared/SubmissionCard';

export function StudentAssignmentView({
  appState,
  course,
  homework,
}: {
  appState: AppState;
  course: Course;
  homework: Homework;
}) {
  const navigate = useNavigate();
  const student = appState.currentUser;
  const [sourceType, setSourceType] = useState<SubmissionSourceType>('text');
  const [textValue, setTextValue] = useState('');
  const [fileName, setFileName] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Keyingi bosqichda rasm OCR'i tesseract.js bilan ulanadi. Hozircha yuklangan fayllar ajratilgan matnni taqlid qiladi.",
  );
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRefreshTick((value) => value + 1);
    }, 4000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  if (!student) {
    return null;
  }

  const currentStudent = student;

  const studentAssignments = getStudentHomeworkAssignments(
    appState.assignments,
    homework.id,
    currentStudent.id,
  );
  const latestAssignment = studentAssignments[studentAssignments.length - 1];
  const canSubmit =
    studentAssignments.length < MAX_HOMEWORK_ATTEMPTS &&
    (!latestAssignment || latestAssignment.status === 'graded');

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const content = await file.text();
      setExtractedText(content);
      setStatusMessage('TXT fayl yuklandi va topshirish matniga moslashtirildi.');
      return;
    }

    setExtractedText(`OCR preview extracted from ${file.name}.`);
    setStatusMessage(
      "Rasm biriktirildi. Hozirgi frontend demo haqiqiy tesseract.js ulanishidan oldin OCR matnini taqlid qiladi.",
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const normalizedText =
      sourceType === 'text' ? textValue.trim() : extractedText.trim();

    if (!normalizedText) {
      setStatusMessage("Iltimos, matn kiriting yoki ajratilgan matn beradigan fayl yuklang.");
      return;
    }

    try {
      setSubmitting(true);
      setStatusMessage("Uy vazifangiz baholash uchun yuborilmoqda.");

      await appState.submitAssignment({
        homeworkId: homework.id,
        sourceType,
        extractedText: normalizedText,
        originalText: sourceType === 'text' ? textValue.trim() : undefined,
        fileName: sourceType === 'text' ? undefined : fileName,
      });

      setTextValue('');
      setFileName('');
      setExtractedText('');
      setStatusMessage(
        "Urinish yuborildi va Gemini tomonidan baholandi. Siz kursdagi uy vazifalari ro'yxatiga qaytarilasiz.",
      );

      window.setTimeout(() => {
        navigate(`/dashboard/courses/${course.id}`);
      }, 500);
    } catch (caughtError) {
      setStatusMessage(
        caughtError instanceof Error
          ? caughtError.message
          : "Hozir uy vazifasini yuborib bo'lmadi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="content-grid">
      <section className="panel">
        <div className="panel__header">
          <h2>Yangi urinish yuborish</h2>
          <p>
            Talabalar keyingi urinishni faqat avvalgi urinish to'liq baholangandan keyin yubora oladi. So'nggi baholangan natija ko'rinadigan ball bo'ladi.
          </p>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            Yuborish turi
            <select
              disabled={submitting}
              onChange={(event) => {
                setSourceType(event.target.value as SubmissionSourceType);
                setFileName('');
                setExtractedText('');
              }}
              value={sourceType}
            >
              <option value="text">To'g'ridan-to'g'ri matn</option>
              <option value="image">Rasm yuklash</option>
              <option value="txt_file">TXT fayl</option>
            </select>
          </label>

          {sourceType === 'text' ? (
            <label>
              Yuboriladigan matn
              <textarea
                disabled={submitting}
                onChange={(event) => setTextValue(event.target.value)}
                placeholder="Uy vazifasi javobingizni shu yerga yozing..."
                rows={8}
                value={textValue}
              />
            </label>
          ) : (
            <label>
              Fayl yuklash
              <input
                accept={sourceType === 'image' ? 'image/*' : '.txt,text/plain'}
                disabled={submitting}
                onChange={handleFileChange}
                type="file"
              />
            </label>
          )}

          {sourceType !== 'text' && extractedText ? (
            <label>
              Ajratilgan matn ko'rinishi
              <textarea readOnly rows={6} value={extractedText} />
            </label>
          ) : null}

          <div className={submitting ? 'inline-message inline-message--processing' : 'inline-message'}>
            {submitting ? (
              <span className="processing-indicator">
                <span className="processing-indicator__dot" />
                <span className="processing-indicator__dot" />
                <span className="processing-indicator__dot" />
              </span>
            ) : null}
            <span>{statusMessage}</span>
          </div>

          <button className="primary-button" disabled={!canSubmit || submitting} type="submit">
            {submitting ? 'Yuborilmoqda...' : 'Urinishni yuborish'}
          </button>

          {!canSubmit && latestAssignment ? (
            <p className="inline-message inline-message--warning">
              {latestAssignment.attemptNumber}-urinish hali {latestAssignment.status === 'processing' ? 'jarayonda' : latestAssignment.status === 'review_pending' ? "ko'rib chiqilmoqda" : 'baholangan'}.
              Keyingi urinishni yuborishdan oldin baholash tugashini kuting.
            </p>
          ) : null}
        </form>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Urinishlar tarixi</h2>
          <p>Yangilanish hisobi: {refreshTick}</p>
        </div>

        <div className="attempt-list">
          {studentAssignments.length === 0 ? (
            <EmptyState
              title="Hali urinishlar yo'q"
              description="Birinchi yuklashingiz shu yerda jarayon holati bilan ko'rinadi."
            />
          ) : (
            studentAssignments.map((assignment) => (
              <SubmissionCard
                assignment={assignment}
                key={assignment.id}
                student={currentStudent}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
