const BASE_URL = "https://ecoponto-api-08ow.onrender.com";

export async function apiFetch(path: string, options?: RequestInit) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.mensagem || "Erro na requisição");
  }

  return data;
}
