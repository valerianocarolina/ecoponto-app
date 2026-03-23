import { apiFetch } from "./api";

export async function login(email: string, senha: string) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

export async function register(data: {
  nome: string;
  email: string;
  telefone?: string;
  documento: string;
  senha: string;
}) {
  return apiFetch("/auth/registro", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
