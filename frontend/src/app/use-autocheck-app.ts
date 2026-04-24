import { useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchProfile,
  login,
  logout,
  register,
  updateProfile,
} from '../authApi';
import {
  demoAssignments,
  demoCourses,
  demoSubmissions,
  demoUsers,
} from '../mockData';
import type { Assignment, AuthProfile, Course, Submission, User } from '../types';
import type { AppState } from './app-state';
import { generateEvaluationDraft, mapProfileToCurrentUser } from './helpers';

export function useAutocheckApp(): AppState {
  const [users, setUsers] = useState<User[]>(demoUsers);
  const [courses, setCourses] = useState<Course[]>(demoCourses);
  const [assignments] = useState<Assignment[]>(demoAssignments);
  const [submissions, setSubmissions] = useState<Submission[]>(demoSubmissions);
  const [currentProfile, setCurrentProfile] = useState<AuthProfile | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const scheduledSubmissionsRef = useRef(new Set<string>());
  const timerIdsRef = useRef<number[]>([]);

  const currentUser = useMemo(
    () => mapProfileToCurrentUser(currentProfile, users),
    [currentProfile, users],
  );

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const profile = await fetchProfile();

        if (!active) {
          return;
        }

        setCurrentProfile(profile);
        setAuthError(null);
      } catch {
        if (!active) {
          return;
        }

        setCurrentProfile(null);
      } finally {
        if (active) {
          setAuthResolved(true);
        }
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    submissions.forEach((submission) => {
      if (submission.status !== 'processing') {
        return;
      }

      if (scheduledSubmissionsRef.current.has(submission.id)) {
        return;
      }

      const assignment = assignments.find(
        (item) => item.id === submission.assignmentId,
      );

      if (!assignment) {
        return;
      }

      scheduledSubmissionsRef.current.add(submission.id);

      const timerId = window.setTimeout(() => {
        const draft = generateEvaluationDraft(submission, assignment);

        setSubmissions((current) =>
          current.map((item) => {
            if (item.id !== submission.id) {
              return item;
            }

            if (assignment.evaluationMode === 'automatic') {
              return {
                ...item,
                status: 'graded',
                geminiScore: draft.score,
                geminiFeedback: draft.feedback,
                finalScore: draft.score,
                finalFeedback: draft.feedback,
              };
            }

            return {
              ...item,
              status: 'review_pending',
              geminiScore: draft.score,
              geminiFeedback: draft.feedback,
            };
          }),
        );

        scheduledSubmissionsRef.current.delete(submission.id);
      }, 3200);

      timerIdsRef.current.push(timerId);
    });
  }, [assignments, submissions]);

  useEffect(
    () => () => {
      timerIdsRef.current.forEach((timerId) => window.clearTimeout(timerId));
    },
    [],
  );

  return useMemo(
    () => ({
      users,
      courses,
      assignments,
      submissions,
      currentUser,
      currentProfile,
      authResolved,
      authError,
      login: async (payload) => {
        const profile = await login(payload);
        setCurrentProfile(profile);
        setAuthError(null);
      },
      logout: async () => {
        await logout();
        setCurrentProfile(null);
      },
      signup: async (draft) => {
        const profile = await register(draft);
        setCurrentProfile(profile);
        setAuthError(null);
      },
      updateCurrentProfile: async (payload) => {
        const profile = await updateProfile(payload);
        setCurrentProfile(profile);

        setUsers((current) =>
          current.map((user) =>
            currentProfile && user.email === currentProfile.email
              ? {
                  ...user,
                  fullName: profile.fullName,
                  email: profile.email,
                  role: profile.role,
                }
              : user,
          ),
        );
      },
      createAdminUser: (draft) => {
        const nextUser: User = {
          id: `user-${crypto.randomUUID()}`,
          fullName: draft.fullName.trim(),
          email: draft.email.trim().toLowerCase(),
          role: draft.role,
        };

        setUsers((current) => [...current, nextUser]);
      },
      createCourse: (draft) => {
        const nextCourse: Course = {
          id: `course-${crypto.randomUUID()}`,
          title: draft.title.trim(),
          description: draft.description.trim(),
          teacherId: draft.teacherId,
          studentIds: [],
        };

        setCourses((current) => [...current, nextCourse]);
      },
      updateCourse: (courseId, draft) => {
        setCourses((current) =>
          current.map((course) =>
            course.id === courseId ? { ...course, ...draft } : course,
          ),
        );
      },
      updateUser: (userId, draft) => {
        setUsers((current) =>
          current.map((user) =>
            user.id === userId ? { ...user, ...draft } : user,
          ),
        );
      },
      toggleEnrollment: (courseId, studentId) => {
        setCourses((current) =>
          current.map((course) => {
            if (course.id !== courseId) {
              return course;
            }

            const exists = course.studentIds.includes(studentId);

            return {
              ...course,
              studentIds: exists
                ? course.studentIds.filter((id) => id !== studentId)
                : [...course.studentIds, studentId],
            };
          }),
        );
      },
      submitAssignment: (draft) => {
        const assignmentSubmissions = submissions
          .filter(
            (submission) =>
              submission.assignmentId === draft.assignmentId &&
              submission.studentId === draft.studentId,
          )
          .sort((left, right) => left.attemptNumber - right.attemptNumber);

        const nextSubmission: Submission = {
          id: `submission-${crypto.randomUUID()}`,
          assignmentId: draft.assignmentId,
          studentId: draft.studentId,
          attemptNumber: assignmentSubmissions.length + 1,
          sourceType: draft.sourceType,
          status: 'processing',
          submittedAt: new Date().toISOString(),
          extractedText: draft.extractedText,
          fileName: draft.fileName,
          originalText: draft.originalText,
          teacherEdited: false,
        };

        setSubmissions((current) => [...current, nextSubmission]);

        return nextSubmission;
      },
      confirmTeacherReview: ({ submissionId, finalScore, finalFeedback }) => {
        setSubmissions((current) =>
          current.map((submission) => {
            if (submission.id !== submissionId) {
              return submission;
            }

            return {
              ...submission,
              status: 'graded',
              finalScore,
              finalFeedback,
              teacherEdited:
                finalScore !== submission.geminiScore ||
                finalFeedback !== submission.geminiFeedback,
            };
          }),
        );
      },
    }),
    [
      assignments,
      authError,
      authResolved,
      courses,
      currentProfile,
      currentUser,
      submissions,
      users,
    ],
  );
}
