import type { AuthProfile, DraftSignup, TeacherEvaluationMode } from './types';

const API_BASE = '/api/users';

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
  const response = await fetch(`${API_BASE}/me`, {
    credentials: 'include',
  });

  return parseJson<AuthProfile>(response);
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthProfile> {
  const response = await fetch(`${API_BASE}/auth/login`, {
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
  const response = await fetch(`${API_BASE}/auth/register`, {
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
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to log out right now.');
  }
}

export function startGoogleAuth() {
  window.location.href = `${API_BASE}/auth/google`;
}

export async function updateProfile(payload: {
  fullName?: string;
  email?: string;
  password?: string;
  evaluationMode?: TeacherEvaluationMode;
}): Promise<AuthProfile> {
  const response = await fetch(`${API_BASE}/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseJson<AuthProfile>(response);
}
