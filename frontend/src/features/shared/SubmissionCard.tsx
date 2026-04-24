import { formatTimestamp } from '../../app/helpers';
import { StatusPill } from '../../components/ui';
import type { Submission, User } from '../../types';

export function SubmissionCard({
  submission,
  student,
}: {
  submission: Submission;
  student: User;
}) {
  const displayScore =
    submission.finalScore ?? submission.geminiScore ?? 'Pending';
  const displayFeedback =
    submission.finalFeedback ??
    submission.geminiFeedback ??
    'Gemini is still processing this attempt.';

  return (
    <article className="submission-card">
      <header className="submission-card__header">
        <div>
          <strong>Attempt {submission.attemptNumber}</strong>
          <p>{student.fullName}</p>
        </div>
        <StatusPill status={submission.status} />
      </header>

      <dl className="submission-card__meta">
        <div>
          <dt>Source</dt>
          <dd>{submission.sourceType}</dd>
        </div>
        <div>
          <dt>Submitted</dt>
          <dd>{formatTimestamp(submission.submittedAt)}</dd>
        </div>
        <div>
          <dt>Score</dt>
          <dd>{displayScore}</dd>
        </div>
      </dl>

      <p className="submission-card__text">{submission.extractedText}</p>
      <p className="submission-card__feedback">{displayFeedback}</p>
      {submission.fileName ? (
        <small className="submission-card__file">File: {submission.fileName}</small>
      ) : null}
    </article>
  );
}
