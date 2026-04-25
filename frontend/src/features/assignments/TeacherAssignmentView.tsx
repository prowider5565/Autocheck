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
        <h2>Student attempts</h2>
        <p>
          Teachers can inspect all assignment attempts for this homework, review Gemini drafts,
          and confirm the final score when needed.
        </p>
      </div>

      <div className="teacher-review-list">
        {relevantAssignments.length === 0 ? (
          <EmptyState
            title="No submissions yet"
            description="Student work for this homework will appear here."
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
    'Gemini is still producing the draft evaluation.';

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
      setMessage('Final evaluation confirmed.');
    } catch (caughtError) {
      setMessage(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to confirm the evaluation.',
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
            Attempt {assignment.attemptNumber} for homework #{homework.id}
          </p>
        </div>
        <StatusPill status={assignment.status} />
      </header>

      <dl className="submission-card__meta">
        <div>
          <dt>Gemini score</dt>
          <dd>{assignment.geminiScore ?? 'Pending'}</dd>
        </div>
        <div>
          <dt>Homework</dt>
          <dd>#{homework.id}</dd>
        </div>
        <div>
          <dt>Teacher edited</dt>
          <dd>{assignment.teacherEdited ? 'Yes' : 'No'}</dd>
        </div>
      </dl>

      <div className="submission-card__body">
        <pre className="submission-card__code">
          <code>{assignment.extractedText}</code>
        </pre>

        <section className="submission-card__result">
          <p className="submission-card__score-label">
            {assignment.status === 'graded' ? 'Final score' : 'Current score'}
          </p>
          <p
            className="submission-card__score"
            style={typeof visibleScore === 'number' ? { color: getScoreColor(visibleScore) } : undefined}
          >
            {typeof visibleScore === 'number' ? `${visibleScore}/10` : 'Pending'}
          </p>
          <p className="submission-card__feedback">{visibleFeedback}</p>
        </section>
      </div>

      {assignment.status === 'review_pending' ? (
        <div className="review-form">
          <label>
            Final score
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
            Final feedback
            <textarea
              onChange={(event) => setFeedback(event.target.value)}
              rows={4}
              value={feedback}
            />
          </label>
          <button className="primary-button" onClick={handleConfirm} type="button">
            {busy ? 'Confirming...' : 'Confirm final evaluation'}
          </button>
          {message ? <p className="inline-message">{message}</p> : null}
        </div>
      ) : null}
    </article>
  );
}
