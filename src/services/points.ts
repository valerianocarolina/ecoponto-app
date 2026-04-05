import { USE_MOCK } from "@/util/config";
import {
  createMockPoint,
  getMockPoints,
  deleteMockPoint,
} from "@/util/mockPoints";
import { apiFetch } from "./api";

export async function getPoints() {
  if (USE_MOCK) {
    return getMockPoints();
  }

  return apiFetch("/pontos-coleta/meus/lista");
}

export async function createPoint(data: any) {
  if (USE_MOCK) {
    return createMockPoint(data);
  }

  return apiFetch("/pontos-coleta", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deletePoint(id: string) {
  if (USE_MOCK) {
    return deleteMockPoint(id);
  }

  return apiFetch(`/pontos-coleta/${id}`, {
    method: "DELETE",
  });
}