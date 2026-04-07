import { apiFetch } from "./api";

export async function getEmpresa() {
  const data = await apiFetch("/cooperativas/perfil");
  return data.cooperativa || data;
}

export async function updateEmpresa(data: any) {
  return apiFetch("/cooperativas/perfil", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEmpresa() {
  return apiFetch("/cooperativas/perfil", {
    method: "DELETE",
  });
}
