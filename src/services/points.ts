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
  console.log("[DEBUG] getPoints - resposta completa:", JSON.stringify(data, null, 2));
  if (data.pontos) {
    console.log("[DEBUG] getPoints - campo 'horario' do primeiro ponto:", data.pontos[0]?.horario);
    console.log("[DEBUG] getPoints - todos os campos do primeiro ponto:", data.pontos[0]);
  }
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
  console.log(`[DEBUG] getPoint(${id}) - resposta completa:`, JSON.stringify(data, null, 2));
  console.log(`[DEBUG] getPoint(${id}) - campo 'horario':`, data.ponto?.horario || data?.horario);
  return data.ponto || data;
}

export async function createPoint(data: any) {
  const formData = toFormData(data);
  console.log("[DEBUG] createPoint - FormData preparado:");
  for (let [key, value] of (formData as any).entries()) {
    if (key === "imagem") {
      console.log(`  ${key}: [File]`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }
  const response = await apiFetch("/pontos-coleta", {
    method: "POST",
    body: formData,
  });
  console.log("[DEBUG] createPoint - resposta do backend:", JSON.stringify(response, null, 2));
  console.log("[DEBUG] createPoint - campo 'horario' na resposta:", response?.horario || response?.ponto?.horario);
  return response;
}

export async function updatePoint(id: string, data: any) {
    const formData = toFormData(data);
    console.log(`[DEBUG] updatePoint(${id}) - FormData preparado:`);
    for (let [key, value] of (formData as any).entries()) {
      if (key === "imagem") {
        console.log(`  ${key}: [File]`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    const response = await apiFetch(`/pontos-coleta/${id}`, {
      method: "PUT",
      body: formData,
    });
    console.log(`[DEBUG] updatePoint(${id}) - resposta do backend:`, JSON.stringify(response, null, 2));
    console.log(`[DEBUG] updatePoint(${id}) - campo 'horario' na resposta:`, response?.horario || response?.ponto?.horario);
    return response;
  }

export async function deletePoint(id: string) {
  return apiFetch(`/pontos-coleta/${id}`, {
    method: "DELETE",
  })
}