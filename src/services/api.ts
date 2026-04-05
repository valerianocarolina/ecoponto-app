const BASE_URL = "https://ecoponto-api-08ow.onrender.com";

export async function apiFetch(path: string, options?: RequestInit) {
  let token: string | null = null;

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("auth");

    if (stored) {
      const parsed = JSON.parse(stored);
      token = parsed.token;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.mensagem || "Erro na requisição");
  }

  return data;
}