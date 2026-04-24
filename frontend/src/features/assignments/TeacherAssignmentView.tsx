import { useState } from 'react';
import type { AppState } from '../../app/app-state';
import { trimToSixtyWords } from '../../app/helpers';
import { EmptyState, StatusPill } from '../../components/ui';
import type { Assignment, Submission, User } from '../../types';

export function TeacherAssignmentView({
  appState,
  assignment,
}: {
  appState: AppState;
  assignment: Assignment;
}) {
  const relevantSubmissions = appState.submissions
    .filter((submission) => submission.assignmentId === assignment.id)
    .sort((left, right) =>
      right.submittedAt.localeCompare(left.submittedAt),
    );

  return (
    <div className="panel">
      <div className="panel__header">
        <h2>Student attempts</h2>
        <p>
          Teachers can inspect all attempts in their course, review Gemini drafts,
          and confirm the final score when the assignment uses partial evaluation.
        </p>
      </div>

      <div className="teacher-review-list">
        {relevantSubmissions.length === 0 ? (
          <EmptyState
            title="No submissions yet"
            description="Student work for this assignment will appear here."
          />
        ) : (
          relevantSubmissions.map((submission) => {
            const student = appState.users.find(
              (user) => user.id === submission.studentId,
            );

            if (!student) {
              return null;
            }

            return (
              <TeacherReviewCard
                appState={appState}
                assignment={assignment}
                key={submission.id}
                submission={submission}
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
  submission,
  student,
}: {
  appState: AppState;
  assignment: Assignment;
  submission: Submission;
  student: User;
}) {
  const [score, setScore] = useState(
    String(submission.finalScore ?? submission.geminiScore ?? 0),
  );
  const [feedback, setFeedback] = useState(
    submission.finalFeedback ?? submission.geminiFeedback ?? '',
  );

  function handleConfirm() {
    const parsedScore = Number(score);

    if (Number.isNaN(parsedScore)) {
      return;
    }

    appState.confirmTeacherReview({
      submissionId: submission.id,
      finalScore: Math.min(10, Math.max(0, parsedScore)),
      finalFeedback: trimToSixtyWords(feedback),
    });
  }

  return (
    <article className="teacher-card">
      <header className="submission-card__header">
        <div>
          <strong>{student.fullName}</strong>
          <p>
            Attempt {submission.attemptNumber} for {assignment.title}
          </p>
        </div>
        <StatusPill status={submission.status} />
      </header>

      <p className="submission-card__text">{submission.extractedText}</p>

      <dl className="submission-card__meta">
        <div>
          <dt>Gemini score</dt>
          <dd>{submission.geminiScore ?? 'Pending'}</dd>
        </div>
        <div>
          <dt>Mode</dt>
          <dd>{assignment.evaluationMode}</dd>
        </div>
        <div>
          <dt>Teacher edited</dt>
          <dd>{submission.teacherEdited ? 'Yes' : 'No'}</dd>
        </div>
      </dl>

      <p className="submission-card__feedback">
        {submission.geminiFeedback ?? 'Gemini is still producing the draft evaluation.'}
      </p>

      {submission.status === 'review_pending' ? (
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
            Confirm final evaluation
          </button>
        </div>
      ) : (
        <div className="final-review">
          <strong>
            Final result: {submission.finalScore ?? submission.geminiScore}/10
          </strong>
          <p>{submission.finalFeedback ?? submission.geminiFeedback}</p>
        </div>
      )}
    </article>
  );
}
