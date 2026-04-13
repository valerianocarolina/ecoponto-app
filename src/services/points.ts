import { apiFetch } from "./api";

export async function getPoints() {
  const data = await apiFetch("/pontos-coleta/meus/lista");
  return data.pontos;
}

export async function getAllCollectionPoints(filters?: {
  tag?: string;
  nome?: string;
  cidade?: string;
  uf?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.tag) params.append("tag", filters.tag);
  if (filters?.nome) params.append("nome", filters.nome);
  if (filters?.cidade) params.append("cidade", filters.cidade);
  if (filters?.uf) params.append("uf", filters.uf);

  const query = params.toString();
  const data = await apiFetch(`/pontos-coleta${query ? `?${query}` : ""}`);
  return data.pontos || [];
}

export async function getPoint(id: string) {
  const data = await apiFetch(`/pontos-coleta/${id}`);
  return data.ponto || data;
}

export async function createPoint(data: any) {
  return apiFetch("/pontos-coleta", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePoint(id: string, data: any) {
    return apiFetch(`/pontos-coleta/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

export async function deletePoint(id: string) {
  return apiFetch(`/pontos-coleta/${id}`, {
    method: "DELETE",
  })
}