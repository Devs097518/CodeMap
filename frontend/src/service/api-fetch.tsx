const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // envia o cookie httpOnly automaticamente
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Sessão expirada');
  }

  return response;
}