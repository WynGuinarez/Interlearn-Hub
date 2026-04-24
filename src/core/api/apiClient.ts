export interface ApiErrorShape {
  message: string;
  status: number;
  code?: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.name = 'ApiError';
    this.status = shape.status;
    this.code = shape.code;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

async function parseJsonSafely(response: Response): Promise<JsonValue | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as JsonValue;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('interlearnhub.accessToken');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const payload = await parseJsonSafely(response);
  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      message:
        (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string'
          ? payload.message
          : 'Request failed'),
      code:
        payload && typeof payload === 'object' && 'code' in payload && typeof payload.code === 'string'
          ? payload.code
          : undefined,
    });
  }

  return (payload as T) ?? ({} as T);
}
