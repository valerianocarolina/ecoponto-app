import { apiFetch } from "./api";

// Cliente
export async function loginCliente(email: string, senha: string) {
  return apiFetch("/auth/login/usuario", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

export async function registerCliente(data: {
  nome: string;
  email: string;
  senha: string;
}) {
  return apiFetch("/auth/registro/usuario", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Empresa
export async function loginEmpresa(email: string, senha: string) {
  return apiFetch("/auth/login/cooperativa", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

export async function registerEmpresa(data: {
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  senha: string;
}) {
  return apiFetch("/auth/registro/cooperativa", {
    method: "POST",
    body: JSON.stringify(data),
  });
}