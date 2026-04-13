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

  const headers = new Headers(options?.headers);
  const isFormData = options?.body instanceof FormData;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
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