import { formatTimestamp } from '../../app/helpers';
import { StatusPill } from '../../components/ui';
import type { Assignment, User } from '../../types';

export function SubmissionCard({
  assignment,
  student,
}: {
  assignment: Assignment;
  student: User;
}) {
  const displayScore = assignment.finalScore ?? assignment.geminiScore ?? 'Pending';
  const displayFeedback =
    assignment.finalFeedback ??
    assignment.geminiFeedback ??
    'Gemini is still processing this attempt.';

  return (
    <article className="submission-card">
      <header className="submission-card__header">
        <div>
          <strong>Attempt {assignment.attemptNumber}</strong>
          <p>{student.fullName}</p>
        </div>
        <StatusPill status={assignment.status} />
      </header>

      <dl className="submission-card__meta">
        <div>
          <dt>Source</dt>
          <dd>{assignment.sourceType}</dd>
        </div>
        <div>
          <dt>Submitted</dt>
          <dd>{formatTimestamp(assignment.submittedAt)}</dd>
        </div>
        <div>
          <dt>Score</dt>
          <dd>{displayScore}</dd>
        </div>
      </dl>

      <p className="submission-card__text">{assignment.extractedText}</p>
      <p className="submission-card__feedback">{displayFeedback}</p>
      {assignment.fileName ? (
        <small className="submission-card__file">File: {assignment.fileName}</small>
      ) : null}
    </article>
  );
}
