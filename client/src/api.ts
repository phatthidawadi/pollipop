const API_BASE = import.meta.env.VITE_API_URL || '';

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: { field: string; message: string }[];
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: ApiErrorShape & { status?: number } = data?.error || {
      code: 'UNKNOWN_ERROR',
      message: 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ',
    };
    err.status = res.status;
    throw err;
  }

  return data as T;
}

