import type {
  Assignment,
  AuthProfile,
  Course,
  DraftSignup,
  Homework,
  TeacherEvaluationMode,
} from './types';

const USERS_API_BASE = '/api/users';
const COURSES_API_BASE = '/api/courses';
const HOMEWORKS_API_BASE = '/api/homeworks';

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Request failed.';

    try {
      const body = (await response.json()) as { message?: string | string[] };

      if (Array.isArray(body.message)) {
        message = body.message.join(', ');
      } else if (body.message) {
        message = body.message;
      }
    } catch {
      message = 'Request failed.';
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function fetchProfile(): Promise<AuthProfile> {
  const response = await fetch(`${USERS_API_BASE}/me`, {
    credentials: 'include',
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
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseJson<AuthProfile>(response);
}

export async function register(payload: DraftSignup): Promise<AuthProfile> {
  const response = await fetch(`${USERS_API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseJson<AuthProfile>(response);
}

export async function logout(): Promise<void> {
  const response = await fetch(`${USERS_API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to log out right now.');
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
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseJson<AuthProfile>(response);
}

export async function fetchCourses(): Promise<Course[]> {
  const response = await fetch(COURSES_API_BASE, {
    credentials: 'include',
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
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseJson<Course>(response);
}

export async function fetchCourse(courseId: number): Promise<Course> {
  const response = await fetch(`${COURSES_API_BASE}/${courseId}`, {
    credentials: 'include',
  });

  return parseJson<Course>(response);
}

export async function fetchCourseHomeworks(courseId: number): Promise<Homework[]> {
  const response = await fetch(`${COURSES_API_BASE}/${courseId}/homeworks`, {
    credentials: 'include',
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
    },
    credentials: 'include',
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
    },
    credentials: 'include',
    body: JSON.stringify({
      description: payload.description,
    }),
  });

  return parseJson<Homework>(response);
}

export async function fetchHomeworkAssignments(
  homeworkId: number,
): Promise<Assignment[]> {
  const response = await fetch(`/api/homeworks/${homeworkId}/assignments`, {
    credentials: 'include',
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
  const response = await fetch(`/api/homeworks/${payload.homeworkId}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      sourceType: payload.sourceType,
      extractedText: payload.extractedText,
      originalText: payload.originalText,
      fileName: payload.fileName,
    }),
  });

  return parseJson<Assignment>(response);
}
