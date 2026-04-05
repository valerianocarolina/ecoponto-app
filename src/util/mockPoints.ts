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