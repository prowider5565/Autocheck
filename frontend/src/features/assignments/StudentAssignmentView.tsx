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
    'Image OCR will be wired to tesseract.js next. For now, uploads simulate extracted text so the flow is testable.',
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
      setStatusMessage('TXT file loaded and normalized into submission text.');
      return;
    }

    setExtractedText(`OCR preview extracted from ${file.name}.`);
    setStatusMessage(
      'Image attached. The current frontend demo simulates OCR text before real tesseract.js wiring.',
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
      setStatusMessage('Please provide text or upload a file that produces extracted text.');
      return;
    }

    try {
      setSubmitting(true);
      setStatusMessage('Submitting your homework for evaluation now.');

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
        'Attempt submitted and evaluated by Gemini. You are being returned to the course homework list.',
      );

      window.setTimeout(() => {
        navigate(`/dashboard/courses/${course.id}`);
      }, 500);
    } catch (caughtError) {
      setStatusMessage(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to submit the homework right now.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="content-grid">
      <section className="panel">
        <div className="panel__header">
          <h2>Submit a new attempt</h2>
          <p>
            Students can only send the next attempt after the previous one is fully
            graded. The latest graded result becomes the visible score.
          </p>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            Submission type
            <select
              disabled={submitting}
              onChange={(event) => {
                setSourceType(event.target.value as SubmissionSourceType);
                setFileName('');
                setExtractedText('');
              }}
              value={sourceType}
            >
              <option value="text">Direct text</option>
              <option value="image">Image upload</option>
              <option value="txt_file">TXT file</option>
            </select>
          </label>

          {sourceType === 'text' ? (
            <label>
              Submission text
              <textarea
                disabled={submitting}
                onChange={(event) => setTextValue(event.target.value)}
                placeholder="Write your homework response here..."
                rows={8}
                value={textValue}
              />
            </label>
          ) : (
            <label>
              Upload file
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
              Extracted text preview
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
            {submitting ? 'Submitting...' : 'Submit attempt'}
          </button>

          {!canSubmit && latestAssignment ? (
            <p className="inline-message inline-message--warning">
              Attempt {latestAssignment.attemptNumber} is still {latestAssignment.status}.
              Wait for evaluation before sending the next one.
            </p>
          ) : null}
        </form>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Attempt history</h2>
          <p>Polling refresh tick: {refreshTick}</p>
        </div>

        <div className="attempt-list">
          {studentAssignments.length === 0 ? (
            <EmptyState
              title="No attempts yet"
              description="Your first upload will appear here with a processing status."
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
