import { useEffect, useMemo, useState } from 'react';
import {
  archiveCourse as archiveCourseRequest,
  confirmAssignmentReview as confirmAssignmentReviewRequest,
  createCourse as createCourseRequest,
  createHomework as createHomeworkRequest,
  fetchCourseHomeworks,
  fetchHomeworkAssignments,
  fetchCourses,
  fetchProfile,
  login,
  logout,
  register,
  submitAssignment as submitAssignmentRequest,
  updateHomework as updateHomeworkRequest,
  updateProfile,
} from '../authApi';
import { demoUsers } from '../mockData';
import type { Assignment, Homework, User } from '../types';
import type { AppState } from './app-state';
import { mapProfileToCurrentUser } from './helpers';

export function useAutocheckApp(): AppState {
  const [users, setUsers] = useState<User[]>(demoUsers);
  const [courses, setCourses] = useState<AppState['courses']>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [currentProfile, setCurrentProfile] = useState<AppState['currentProfile']>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [dataResolved, setDataResolved] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
    let active = true;

    async function loadCourseData() {
      if (!currentUser) {
        setCourses([]);
        setHomeworks([]);
        setDataResolved(true);
        return;
      }

      setDataResolved(false);

      try {
        const nextCourses = await fetchCourses();

        if (!active) {
          return;
        }

        setCourses(nextCourses);

        const homeworkLists = await Promise.all(
          nextCourses.map((course) => fetchCourseHomeworks(course.id)),
        );

        if (!active) {
          return;
        }

        const nextHomeworks = homeworkLists.flat();

        setHomeworks(nextHomeworks);

        const assignmentLists = await Promise.all(
          nextHomeworks.map((homework) => fetchHomeworkAssignments(homework.id)),
        );

        if (!active) {
          return;
        }

        setAssignments(assignmentLists.flat());
      } catch (caughtError) {
        if (!active) {
          return;
        }

        setAuthError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load courses right now.',
        );
      } finally {
        if (active) {
          setDataResolved(true);
        }
      }
    }

    void loadCourseData();

    return () => {
      active = false;
    };
  }, [currentUser]);

  async function refreshCourseData() {
    if (!currentUser) {
      setCourses([]);
      setHomeworks([]);
      return;
    }

    const nextCourses = await fetchCourses();
    setCourses(nextCourses);

    const homeworkLists = await Promise.all(
      nextCourses.map((course) => fetchCourseHomeworks(course.id)),
    );

    const nextHomeworks = homeworkLists.flat();

    setHomeworks(nextHomeworks);

    const assignmentLists = await Promise.all(
      nextHomeworks.map((homework) => fetchHomeworkAssignments(homework.id)),
    );

    setAssignments(assignmentLists.flat());
  }

  return useMemo(
    () => ({
      users,
      courses,
      homeworks,
      assignments,
      currentUser,
      currentProfile,
      authResolved,
      authError,
      dataResolved,
      login: async (payload) => {
        const profile = await login(payload);
        setCurrentProfile(profile);
        setAuthError(null);
      },
      logout: async () => {
        await logout();
        setCurrentProfile(null);
        setCourses([]);
        setHomeworks([]);
        setAssignments([]);
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
                  id: profile.id,
                  fullName: profile.fullName,
                  email: profile.email,
                  role: profile.role,
                }
              : user,
          ),
        );
      },
      submitAssignment: async (draft) => {
        const nextAssignment = await submitAssignmentRequest({
          homeworkId: draft.homeworkId,
          sourceType: draft.sourceType,
          extractedText: draft.extractedText,
          originalText: draft.originalText,
          fileName: draft.fileName,
        });

        setAssignments((current) => [nextAssignment, ...current]);

        return nextAssignment;
      },
      confirmTeacherReview: async ({ assignmentId, finalScore, finalFeedback }) => {
        const confirmedAssignment = await confirmAssignmentReviewRequest({
          assignmentId,
          finalScore,
          finalFeedback,
        });

        setAssignments((current) =>
          current.map((assignment) =>
            assignment.id === assignmentId ? confirmedAssignment : assignment,
          ),
        );

        return confirmedAssignment;
      },
      createHomework: async ({ courseId, description }) => {
        const homework = await createHomeworkRequest({
          courseId,
          description,
        });

        setHomeworks((current) => [homework, ...current]);

        return homework;
      },
      createCourse: async ({ title, description }) => {
        const course = await createCourseRequest({
          title,
          description,
        });

        setCourses((current) => [course, ...current]);

        return course;
      },
      archiveCourse: async ({ courseId, isArchived }) => {
        const course = await archiveCourseRequest({
          courseId,
          isArchived,
        });

        setCourses((current) =>
          current.map((item) => (item.id === courseId ? course : item)),
        );

        return course;
      },
      updateHomework: async (homeworkId, { description }) => {
        const homework = await updateHomeworkRequest({
          homeworkId,
          description,
        });

        setHomeworks((current) =>
          current.map((item) => (item.id === homeworkId ? homework : item)),
        );

        return homework;
      },
      refreshCourseData,
    }),
    [
      assignments,
      authError,
      authResolved,
      courses,
      currentProfile,
      currentUser,
      dataResolved,
      homeworks,
      users,
    ],
  );
}
