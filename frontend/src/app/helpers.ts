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

export function getActiveCourses(courses: Course[]) {
  return courses.filter((course) => !course.isArchived);
}

export function getArchivedCourses(courses: Course[]) {
  return courses.filter((course) => course.isArchived);
}

export function canAccessCourse(user: User, course: Course) {
  if (user.role === 'teacher') {
    return course.teacherId === user.id;
  }

  return true;
}

export function getCoursesTitle(role: Role) {
  if (role === 'student') {
    return 'Barcha mavjud kurslar';
  }

  if (role === 'teacher') {
    return 'Siz yuritadigan va boshqaradigan kurslar';
  }

  return 'Kurslar maydoni';
}

export function getCoursesDescription(role: Role) {
  if (role === 'student') {
    return "Topshiriq tavsiflarini ko'rish, javob yuborish va baholash yangilanishlarini kuzatish uchun kursni oching.";
  }

  if (role === 'teacher') {
    return "Kurslaringiz ichida vazifalar yarating, tavsiflarni tahrirlang va talabalar urinishlarini ko'rib chiqing.";
  }

  return "Joriy bosqich kurslar va uy vazifalari oqimiga qaratilgan.";
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
  const feedbackSource = `Vazifaga yaxshi javob berilgansiz. Izohni yanada aniqroq qiling va fikr yuritishni tekshirishni osonlashtiring. Vazifa mazmuni: ${homework.description}`;

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
  return new Intl.DateTimeFormat('uz-UZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function getScoreColor(score: number) {
  const clampedScore = Math.max(0, Math.min(10, score));
  const hue = (clampedScore / 10) * 120;

  return `hsl(${hue} 68% 42%)`;
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
