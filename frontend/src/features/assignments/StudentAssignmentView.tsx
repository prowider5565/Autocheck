import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppState } from '../../app/app-state';
import { getStudentAssignmentSubmissions } from '../../app/helpers';
import { EmptyState } from '../../components/ui';
import type { Assignment, Course, SubmissionSourceType } from '../../types';
import { SubmissionCard } from '../shared/SubmissionCard';

export function StudentAssignmentView({
  appState,
  assignment,
  course,
}: {
  appState: AppState;
  assignment: Assignment;
  course: Course;
}) {
  const navigate = useNavigate();
  const student = appState.currentUser;
  const [sourceType, setSourceType] = useState<SubmissionSourceType>('text');
  const [textValue, setTextValue] = useState('');
  const [fileName, setFileName] = useState('');
  const [extractedText, setExtractedText] = useState('');
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

  const studentId = student.id;
  const submissions = getStudentAssignmentSubmissions(
    appState.submissions,
    assignment.id,
    studentId,
  );
  const latestSubmission = submissions[submissions.length - 1];
  const canSubmit =
    submissions.length < assignment.maxAttempts &&
    (!latestSubmission || latestSubmission.status === 'graded');

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    appState.submitAssignment({
      assignmentId: assignment.id,
      studentId,
      sourceType,
      extractedText: normalizedText,
      originalText: sourceType === 'text' ? textValue.trim() : undefined,
      fileName: sourceType === 'text' ? undefined : fileName,
    });

    setTextValue('');
    setFileName('');
    setExtractedText('');
    setStatusMessage(
      'Attempt submitted. You are being returned to the course assignment list while Gemini processes the result.',
    );

    window.setTimeout(() => {
      navigate(`/dashboard/courses/${course.id}`);
    }, 500);
  }

  return (
    <div className="content-grid">
      <section className="panel">
        <div className="panel__header">
          <h2>Submit a new attempt</h2>
          <p>
            Students can only send the next attempt after the previous one is fully
            graded. Latest graded result becomes the final visible score.
          </p>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            Submission type
            <select
              value={sourceType}
              onChange={(event) => {
                setSourceType(event.target.value as SubmissionSourceType);
                setFileName('');
                setExtractedText('');
              }}
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
                placeholder="Write your homework response here..."
                rows={8}
                value={textValue}
                onChange={(event) => setTextValue(event.target.value)}
              />
            </label>
          ) : (
            <label>
              Upload file
              <input
                accept={sourceType === 'image' ? 'image/*' : '.txt,text/plain'}
                onChange={handleFileChange}
                type="file"
              />
            </label>
          )}

          {sourceType !== 'text' && extractedText ? (
            <label>
              Extracted text preview
              <textarea rows={6} value={extractedText} readOnly />
            </label>
          ) : null}

          <p className="inline-message">{statusMessage}</p>

          <button className="primary-button" disabled={!canSubmit} type="submit">
            Submit attempt
          </button>

          {!canSubmit && latestSubmission ? (
            <p className="inline-message inline-message--warning">
              Attempt {latestSubmission.attemptNumber} is still {latestSubmission.status}.
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
          {submissions.length === 0 ? (
            <EmptyState
              title="No attempts yet"
              description="Your first upload will appear here with a processing status."
            />
          ) : (
            submissions.map((submission) => (
              <SubmissionCard
                key={submission.id}
                student={student}
                submission={submission}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
