import { MaterialType } from "./materials";

export const mockPoints = [
  {
    id: "1",
    name: "EcoPonto Centro Timóteo",
    address: "Av. Acesita, 1200 - Centro, Timóteo - MG",
    hours: "Seg-Sex: 8h-17h",
    materials: ["plastico", "vidro", "papel", "metal"] as MaterialType[],
    image: "https://images.unsplash.com/photo-1503596476-1c12a8ba09a9",
  },
  {
    id: "2",
    name: "Reciclagem Primavera",
    address: "Rua das Flores, 85 - Primavera, Timóteo - MG",
    hours: "Seg-Sáb: 8h-18h",
    materials: ["plastico", "papel", "oleo"] as MaterialType[],
    image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807",
  },
  {
    id: "3",
    name: "Coleta Sustentável Olaria",
    address: "Av. Oito, 300 - Olaria, Timóteo - MG",
    hours: "Seg-Sex: 9h-16h",
    materials: ["metal", "eletronicos"] as MaterialType[],
    image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f",
  },
  {
    id: "4",
    name: "EcoVale Reciclagem",
    address: "Rua Quinze de Novembro, 450 - Funcionários, Timóteo - MG",
    hours: "Seg-Sex: 7h-18h",
    materials: ["plastico", "vidro", "papel", "metal", "oleo"] as MaterialType[],
    image: "https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb",
  },
  {
    id: "5",
    name: "Ponto Verde Macuco",
    address: "Rua Jequitibá, 210 - Macuco, Timóteo - MG",
    hours: "Seg-Sáb: 8h-17h",
    materials: ["plastico", "vidro"] as MaterialType[],
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
  },
];

export type Point = {
    id: string;
    nome: string;
    endereco: string;
    horario: string;
    tags: MaterialType[];
    imagem?: string;
}

export function getMockPoints(): Point[] {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem("points");
  return data ? JSON.parse(data) : [];
}

export function saveMockPoints(points: Point[]) {
  localStorage.setItem("points", JSON.stringify(points));
}

export function createMockPoint(point: Omit<Point, "id">) {
  const points = getMockPoints();

  const newPoint: Point = {
    id: crypto.randomUUID(),
    ...point,
  };

  const updated = [...points, newPoint];
  saveMockPoints(updated);

  return newPoint;
}

export function deleteMockPoint(id: string) {
  const points = getMockPoints();
  const updated = points.filter((p) => p.id !== id);
  saveMockPoints(updated);
}

export function updateMockPoint(id: string, data: Partial<Point>) {
  const points = getMockPoints();

  const updated = points.map((p) =>
    p.id === id ? { ...p, ...data } : p
  );

  saveMockPoints(updated);
}