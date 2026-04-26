import type {
  Assignment,
  AuthProfile,
  AuthSession,
  Course,
  DraftSignup,
  Homework,
  TeacherEvaluationMode,
} from './types';
import { clearAccessToken, getAccessToken, setAccessToken } from './authSession';
import { buildBackendUrl } from './config';

const USERS_API_BASE = buildBackendUrl('/api/users');
const COURSES_API_BASE = buildBackendUrl('/api/courses');
const HOMEWORKS_API_BASE = buildBackendUrl('/api/homeworks');

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "So'rov bajarilmadi.";

    try {
      const body = (await response.json()) as { message?: string | string[] };

      if (Array.isArray(body.message)) {
        message = body.message.join(', ');
      } else if (body.message) {
        message = body.message;
      }
    } catch {
      message = "So'rov bajarilmadi.";
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

function buildAuthHeaders(): HeadersInit {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function fetchProfile(): Promise<AuthProfile> {
  const response = await fetch(`${USERS_API_BASE}/me`, {
    headers: buildAuthHeaders(),
  });

  return parseJson<AuthProfile>(response);
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthProfile> {
  const response = await fetch(`${USERS_API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const session = await parseJson<AuthSession>(response);
  setAccessToken(session.accessToken);

  return session.profile;
}

export async function register(payload: DraftSignup): Promise<AuthProfile> {
  const response = await fetch(`${USERS_API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const session = await parseJson<AuthSession>(response);
  setAccessToken(session.accessToken);

  return session.profile;
}

export async function logout(): Promise<void> {
  const response = await fetch(`${USERS_API_BASE}/auth/logout`, {
    method: 'POST',
    headers: buildAuthHeaders(),
  });

  clearAccessToken();

  if (!response.ok) {
    throw new Error("Hozir tizimdan chiqib bo'lmadi.");
  }
}

export function startGoogleAuth() {
  window.location.href = `${USERS_API_BASE}/auth/google`;
}

export async function updateProfile(payload: {
  fullName?: string;
  email?: string;
  password?: string;
  evaluationMode?: TeacherEvaluationMode;
}): Promise<AuthProfile> {
  const response = await fetch(`${USERS_API_BASE}/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return parseJson<AuthProfile>(response);
}

export async function fetchCourses(): Promise<Course[]> {
  const response = await fetch(COURSES_API_BASE, {
    headers: buildAuthHeaders(),
  });

  return parseJson<Course[]>(response);
}

export async function createCourse(payload: {
  title: string;
  description: string;
}): Promise<Course> {
  const response = await fetch(COURSES_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return parseJson<Course>(response);
}

export async function fetchCourse(courseId: number): Promise<Course> {
  const response = await fetch(`${COURSES_API_BASE}/${courseId}`, {
    headers: buildAuthHeaders(),
  });

  return parseJson<Course>(response);
}

export async function archiveCourse(payload: {
  courseId: number;
  isArchived: boolean;
}): Promise<Course> {
  const response = await fetch(`${COURSES_API_BASE}/${payload.courseId}/archive`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({
      isArchived: payload.isArchived,
    }),
  });

  return parseJson<Course>(response);
}

export async function fetchCourseHomeworks(courseId: number): Promise<Homework[]> {
  const response = await fetch(`${COURSES_API_BASE}/${courseId}/homeworks`, {
    headers: buildAuthHeaders(),
  });

  return parseJson<Homework[]>(response);
}

export async function createHomework(payload: {
  courseId: number;
  description: string;
}): Promise<Homework> {
  const response = await fetch(`${COURSES_API_BASE}/${payload.courseId}/homeworks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({
      description: payload.description,
    }),
  });

  return parseJson<Homework>(response);
}

export async function updateHomework(payload: {
  homeworkId: number;
  description: string;
}): Promise<Homework> {
  const response = await fetch(`${HOMEWORKS_API_BASE}/${payload.homeworkId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({
      description: payload.description,
    }),
  });

  return parseJson<Homework>(response);
}

export async function fetchHomeworkAssignments(
  homeworkId: number,
): Promise<Assignment[]> {
  const response = await fetch(buildBackendUrl(`/api/homeworks/${homeworkId}/assignments`), {
    headers: buildAuthHeaders(),
  });

  return parseJson<Assignment[]>(response);
}

export async function submitAssignment(payload: {
  homeworkId: number;
  sourceType: Assignment['sourceType'];
  extractedText: string;
  originalText?: string;
  fileName?: string;
}): Promise<Assignment> {
  const response = await fetch(buildBackendUrl(`/api/homeworks/${payload.homeworkId}/assignments`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({
      sourceType: payload.sourceType,
      extractedText: payload.extractedText,
      originalText: payload.originalText,
      fileName: payload.fileName,
    }),
  });

  return parseJson<Assignment>(response);
}

export async function confirmAssignmentReview(payload: {
  assignmentId: number;
  finalScore: number;
  finalFeedback: string;
}): Promise<Assignment> {
  const response = await fetch(buildBackendUrl(`/api/assignments/${payload.assignmentId}/confirm`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({
      finalScore: payload.finalScore,
      finalFeedback: payload.finalFeedback,
    }),
  });

  return parseJson<Assignment>(response);
}
