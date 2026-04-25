import type {
  Assignment,
  AuthProfile,
  Course,
  Homework,
  Role,
  User,
} from '../types';

export const MAX_HOMEWORK_ATTEMPTS = 3;

export function getVisibleCourses(currentUser: User, courses: Course[]) {
  if (currentUser.role === 'teacher') {
    return courses.filter((course) => course.teacherId === currentUser.id);
  }

  return courses;
}

export function canAccessCourse(user: User, course: Course) {
  if (user.role === 'teacher') {
    return course.teacherId === user.id;
  }

  return true;
}

export function getCoursesTitle(role: Role) {
  if (role === 'student') {
    return 'All available courses';
  }

  if (role === 'teacher') {
    return 'Courses you own and manage';
  }

  return 'Course workspace';
}

export function getCoursesDescription(role: Role) {
  if (role === 'student') {
    return 'Open a course to review homework descriptions, submit your work, and track evaluation updates.';
  }

  if (role === 'teacher') {
    return 'Create homeworks, edit descriptions, and inspect student assignment attempts inside your courses.';
  }

  return 'The current phase is focused on course and homework flows.';
}

export function getStudentHomeworkAssignments(
  assignments: Assignment[],
  homeworkId: number,
  studentId: number,
) {
  return assignments
    .filter(
      (assignment) =>
        assignment.homeworkId === homeworkId && assignment.studentId === studentId,
    )
    .sort((left, right) => left.attemptNumber - right.attemptNumber);
}

export function getLatestCourseAssignmentForStudent(
  courseId: number,
  studentId: number,
  homeworks: Homework[],
  assignments: Assignment[],
) {
  const homeworkIds = homeworks
    .filter((homework) => homework.courseId === courseId)
    .map((homework) => homework.id);

  return assignments
    .filter(
      (assignment) =>
        homeworkIds.includes(assignment.homeworkId) &&
        assignment.studentId === studentId,
    )
    .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))[0];
}

export function generateEvaluationDraft(assignment: Assignment, homework: Homework) {
  const baseScore =
    6.5 +
    (assignment.attemptNumber % 3) +
    (assignment.extractedText.length % 12) / 10;
  const score = Math.min(10, Number(baseScore.toFixed(1)));
  const feedbackSource = `Solid response to the homework. Tighten the explanation and make the reasoning easier to verify. Homework context: ${homework.description}`;

  return {
    score,
    feedback: trimToSixtyWords(feedbackSource),
  };
}

export function trimToSixtyWords(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);

  return words.slice(0, 60).join(' ');
}

export function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function mapProfileToCurrentUser(
  profile: AuthProfile | null,
  users: User[],
): User | null {
  if (!profile) {
    return null;
  }

  const matchedDemoUser = users.find(
    (user) => user.email.toLowerCase() === profile.email.toLowerCase(),
  );

  if (matchedDemoUser) {
    return {
      ...matchedDemoUser,
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      role: profile.role,
    };
  }

  return {
    id: profile.id,
    fullName: profile.fullName,
    email: profile.email,
    role: profile.role,
  };
}
