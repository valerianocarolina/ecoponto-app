export function formatHours(horario: any) {
    return Object.entries(horario)
        .filter(([_, v]: any) => v.aberto)
        .map(
            ([day, v]: any) =>
                `${day}: ${v.inicio} - ${v.fim}`
        )
        .join(" | ");
}