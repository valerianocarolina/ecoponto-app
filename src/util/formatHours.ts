import { DAYS, type DayKey } from "@/lib/schedule";

export function formatHours(horario: any) {
  if (!horario) {
    console.log("[DEBUG] formatHours - horario vazio/null");
    return "";
  }

  let parsedHorario = horario;

  if (typeof parsedHorario === "string") {
    try {
      parsedHorario = JSON.parse(parsedHorario);
    } catch {
      console.log("[DEBUG] formatHours - string não é JSON válido, retornando como-está:", parsedHorario);
      return parsedHorario;
    }
  }

  if (typeof parsedHorario !== "object") {
    console.log("[DEBUG] formatHours - não é object após parse:", typeof parsedHorario);
    return String(parsedHorario);
  }

  console.log("[DEBUG] formatHours - objeto parseado:", JSON.stringify(parsedHorario, null, 2));

  const groups: Array<{
    days: Array<{ key: DayKey; label: string }>;
    inicio: string;
    fim: string;
  }> = [];

  DAYS.forEach((day, index) => {
    const dayData = parsedHorario[day.key];
    if (!dayData || dayData.aberto === false) return;

    const inicio = dayData.inicio || "";
    const fim = dayData.fim || "";

    const lastGroup = groups[groups.length - 1];
    const prevDay = lastGroup?.days[lastGroup.days.length - 1];

    const isSequential =
      prevDay &&
      DAYS.findIndex((d) => d.key === prevDay.key) + 1 === index;

    if (
      lastGroup &&
      lastGroup.inicio === inicio &&
      lastGroup.fim === fim &&
      isSequential
    ) {
      lastGroup.days.push(day);
    } else {
      groups.push({
        days: [day],
        inicio,
        fim,
      });
    }
  });

  return groups
    .map((g) => {
      const dayStr =
        g.days.length === 1
          ? g.days[0].label
          : `${g.days[0].label} - ${
              g.days[g.days.length - 1].label
            }`;

      return `${dayStr}: ${g.inicio} - ${g.fim}`;
    })
    .join(" | ");
}