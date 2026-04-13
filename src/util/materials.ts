export type MaterialType =
    | "plastico"
    | "vidro"
    | "papel"
    | "metal"
    | "eletronico"
    | "oleo";

export const MATERIAL_LABELS: Record<MaterialType, string> = {
    plastico: "Plástico",
    vidro: "Vidro",
    papel: "Papel",
    metal: "Metal",
    eletronico: "Eletrônico",
    oleo: "Óleo",
};

export const MATERIAL_COLORS: Record<MaterialType, string> = {
    plastico: "plastico",
    vidro: "vidro",
    papel: "papel",
    metal: "metal",
    eletronico: "eletronico",
    oleo: "oleo",
};