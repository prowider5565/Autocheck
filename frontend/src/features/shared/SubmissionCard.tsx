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
  const isFinalized = assignment.status === 'graded';
  const displayScore = isFinalized ? assignment.finalScore ?? 'Pending' : 'Hidden until finalized';
  const displayFeedback = isFinalized
    ? assignment.finalFeedback ?? 'Final feedback is not available yet.'
    : assignment.status === 'review_pending'
      ? 'Your teacher is reviewing this attempt. Feedback will appear after final confirmation.'
      : 'Your submission is being processed.';

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

      <pre className="submission-card__code">
        <code>{assignment.extractedText}</code>
      </pre>
      <p className="submission-card__feedback">{displayFeedback}</p>
      {assignment.fileName ? (
        <small className="submission-card__file">File: {assignment.fileName}</small>
      ) : null}
    </article>
  );
}
