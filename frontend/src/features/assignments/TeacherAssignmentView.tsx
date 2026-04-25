import { useState } from 'react';
import type { AppState } from '../../app/app-state';
import { getScoreColor, trimToSixtyWords } from '../../app/helpers';
import { EmptyState, StatusPill } from '../../components/ui';
import type { Assignment, Homework, User } from '../../types';

export function TeacherAssignmentView({
  appState,
  homework,
}: {
  appState: AppState;
  homework: Homework;
}) {
  const relevantAssignments = appState.assignments
    .filter((assignment) => assignment.homeworkId === homework.id)
    .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt));

  return (
    <div className="panel">
      <div className="panel__header">
        <h2>Talabalar urinishlari</h2>
        <p>
          O'qituvchilar bu uy vazifasi bo'yicha barcha urinishlarni ko'rib chiqishi, Gemini tayyorlagan qoralamalarni tekshirishi va kerak bo'lganda yakuniy ballni tasdiqlashi mumkin.
        </p>
      </div>

      <div className="teacher-review-list">
        {relevantAssignments.length === 0 ? (
          <EmptyState
            title="Hali topshiriqlar yo'q"
            description="Talabalar ishlari shu yerda ko'rinadi."
          />
        ) : (
          relevantAssignments.map((assignment) => {
            const student = appState.users.find(
              (user) => user.id === assignment.studentId,
            );

            if (!student) {
              return null;
            }

            return (
              <TeacherReviewCard
                appState={appState}
                assignment={assignment}
                homework={homework}
                key={assignment.id}
                student={student}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function TeacherReviewCard({
  appState,
  assignment,
  homework,
  student,
}: {
  appState: AppState;
  assignment: Assignment;
  homework: Homework;
  student: User;
}) {
  const [score, setScore] = useState(
    String(assignment.finalScore ?? assignment.geminiScore ?? 0),
  );
  const [feedback, setFeedback] = useState(
    assignment.finalFeedback ?? assignment.geminiFeedback ?? '',
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const visibleScore = assignment.finalScore ?? assignment.geminiScore;
  const visibleFeedback =
    assignment.finalFeedback ??
    assignment.geminiFeedback ??
    'Gemini hali baholash qoralamasini tayyorlamoqda.';

  async function handleConfirm() {
    const parsedScore = Number(score);

    if (Number.isNaN(parsedScore)) {
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      await appState.confirmTeacherReview({
        assignmentId: assignment.id,
        finalScore: Math.min(10, Math.max(1, parsedScore)),
        finalFeedback: trimToSixtyWords(feedback),
      });
      setMessage('Yakuniy baholash tasdiqlandi.');
    } catch (caughtError) {
      setMessage(
        caughtError instanceof Error
          ? caughtError.message
          : "Baholashni tasdiqlab bo'lmadi.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="teacher-card">
      <header className="submission-card__header">
        <div>
          <strong>{student.fullName}</strong>
          <p>
            Uy vazifasi #{homework.id} uchun {assignment.attemptNumber}-urinish
          </p>
        </div>
        <StatusPill status={assignment.status} />
      </header>

      <dl className="submission-card__meta">
        <div>
          <dt>Gemini balli</dt>
          <dd>{assignment.geminiScore ?? 'Kutilmoqda'}</dd>
        </div>
        <div>
          <dt>Uy vazifasi</dt>
          <dd>#{homework.id}</dd>
        </div>
        <div>
          <dt>O'qituvchi tahrirlagan</dt>
          <dd>{assignment.teacherEdited ? 'Ha' : "Yo'q"}</dd>
        </div>
      </dl>

      <div className="submission-card__body">
        <pre className="submission-card__code">
          <code>{assignment.extractedText}</code>
        </pre>

        <section className="submission-card__result">
          <p className="submission-card__score-label">
            {assignment.status === 'graded' ? 'Yakuniy ball' : 'Joriy ball'}
          </p>
          <p
            className="submission-card__score"
            style={typeof visibleScore === 'number' ? { color: getScoreColor(visibleScore) } : undefined}
          >
            {typeof visibleScore === 'number' ? `${visibleScore}/10` : 'Kutilmoqda'}
          </p>
          <p className="submission-card__feedback">{visibleFeedback}</p>
        </section>
      </div>

      {assignment.status === 'review_pending' ? (
        <div className="review-form">
          <label>
            Yakuniy ball
            <input
              max="10"
              min="0"
              onChange={(event) => setScore(event.target.value)}
              step="0.1"
              type="number"
              value={score}
            />
          </label>
          <label>
            Yakuniy izoh
            <textarea
              onChange={(event) => setFeedback(event.target.value)}
              rows={4}
              value={feedback}
            />
          </label>
          <button className="primary-button" onClick={handleConfirm} type="button">
            {busy ? 'Tasdiqlanmoqda...' : 'Yakuniy baholashni tasdiqlash'}
          </button>
          {message ? <p className="inline-message">{message}</p> : null}
        </div>
      ) : null}
    </article>
  );
}
