import { apiFetch } from "./api";

function toFormData(data: any) {
  const formData = new FormData();
  const hasImageFile = data?.imagemFile instanceof File;

  Object.entries(data || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || key === "imagemFile") return;

    if ((key === "tags" || key === "horario") && typeof value !== "string") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    if (key === "imagem" && hasImageFile) return;

    formData.append(key, String(value));
  });

  if (hasImageFile) {
    formData.append("imagem", data.imagemFile);
  }

  return formData;
}

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
  const formData = toFormData(data);
  const response = await apiFetch("/pontos-coleta", {
    method: "POST",
    body: formData,
  });
  return response;
}

export async function updatePoint(id: string, data: any) {
    const formData = toFormData(data);
    const response = await apiFetch(`/pontos-coleta/${id}`, {
      method: "PUT",
      body: formData,
    });
    return response;
  }

export async function deletePoint(id: string) {
  return apiFetch(`/pontos-coleta/${id}`, {
    method: "DELETE",
  })
}