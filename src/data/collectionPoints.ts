import { MaterialType, MATERIAL_LABELS } from "@/util/materials";

export interface CollectionPoint {
  _id?: string;
  id?: string;
  nome?: string;
  name?: string;
  endereco?: string;
  address?: string;
  lat: number;
  lng: number;
  tags?: MaterialType[];
  materials?: MaterialType[];
  horario?: string;
  hours?: string;
  imagem?: string;
  imageUrl?: string;
  cooperativa?: {
    nome?: string;
    email?: string;
    telefone?: string;
  };
}

export const MATERIAL_LABELS_DATA = MATERIAL_LABELS;

export function transformApiPoint(apiPoint: any): CollectionPoint {
  return {
    ...apiPoint,
    id: apiPoint._id,
    name: apiPoint.nome,
    address: apiPoint.endereco,
    materials: apiPoint.tags || [],
    hours: apiPoint.horario || "",
    imageUrl: apiPoint.imagem,
  };
}
