import { formatTimestamp, getScoreColor } from '../../app/helpers';
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
  const displayScore = isFinalized ? assignment.finalScore ?? 'Kutilmoqda' : 'Yakunlangunga qadar yashirin';
  const displayFeedback = isFinalized
    ? assignment.finalFeedback ?? "Yakuniy izoh hali mavjud emas."
    : assignment.status === 'review_pending'
      ? "O'qituvchingiz bu urinishni ko'rib chiqmoqda. Yakuniy tasdiqdan so'ng izoh ko'rinadi."
      : 'Yuborgan javobingiz qayta ishlanmoqda.';

  return (
    <article className="submission-card">
      <header className="submission-card__header">
        <div>
          <strong>Urinish {assignment.attemptNumber}</strong>
          <p>{student.fullName}</p>
        </div>
        <StatusPill status={assignment.status} />
      </header>

      <dl className="submission-card__meta">
        <div>
          <dt>Manba</dt>
          <dd>{assignment.sourceType === 'text' ? 'Matn' : assignment.sourceType === 'image' ? 'Rasm' : 'TXT fayl'}</dd>
        </div>
        <div>
          <dt>Yuborilgan vaqt</dt>
          <dd>{formatTimestamp(assignment.submittedAt)}</dd>
        </div>
      </dl>

      <div className="submission-card__body">
        <pre className="submission-card__code">
          <code>{assignment.extractedText}</code>
        </pre>

        <section className="submission-card__result">
          <p className="submission-card__score-label">Ball</p>
          <p
            className="submission-card__score"
            style={
              typeof displayScore === 'number'
                ? { color: getScoreColor(displayScore) }
                : undefined
            }
          >
            {typeof displayScore === 'number' ? `${displayScore}/10` : displayScore}
          </p>
          <p className="submission-card__feedback">{displayFeedback}</p>
        </section>
      </div>

      {assignment.fileName ? (
        <small className="submission-card__file">Fayl: {assignment.fileName}</small>
      ) : null}
    </article>
  );
}
