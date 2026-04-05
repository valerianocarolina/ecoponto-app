const DAYS = [
  { key: "seg", label: "Seg" },
  { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" },
  { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" },
  { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" },
] as const;

export type DayKey = typeof DAYS[number]["key"];

export interface DaySchedule {
  open: string;
  close: string;
}

export type Schedule = Record<DayKey, DaySchedule | null>;

export function emptySchedule(): Schedule {
  return { seg: null, ter: null, qua: null, qui: null, sex: null, sab: null, dom: null };
}

export function scheduleToString(schedule: Schedule): string {
  const activeDays = DAYS.filter((d) => schedule[d.key] !== null);
  if (activeDays.length === 0) return "Consultar";

  const groups: { days: typeof DAYS[number][]; open: string; close: string }[] = [];

  for (const day of activeDays) {
    const s = schedule[day.key]!;
    const last = groups[groups.length - 1];
    if (last && last.open === s.open && last.close === s.close) {
      last.days.push(day);
    } else {
      groups.push({ days: [day], open: s.open, close: s.close });
    }
  }

  return groups
    .map((g) => {
      const dayStr = g.days.length === 1
        ? g.days[0].label
        : `${g.days[0].label}-${g.days[g.days.length - 1].label}`;
      return `${dayStr}: ${parseInt(g.open)}h-${parseInt(g.close)}h`;
    })
    .join(" | ");
}

export function parseHoursToSchedule(hours: string): Schedule {
  const schedule = emptySchedule();
  if (!hours || hours === "Consultar") return schedule;

  const dayMap: Record<string, DayKey> = {
    seg: "seg", ter: "ter", qua: "qua", qui: "qui", sex: "sex", "sáb": "sab", sab: "sab", dom: "dom",
  };

  const parts = hours.split("|").map((s) => s.trim());
  for (const part of parts) {
    const match = part.match(/^(.+?):\s*(\d+)h\s*-\s*(\d+)h$/i);
    if (!match) continue;
    const [, dayRange, open, close] = match;
    const rangeParts = dayRange.trim().split("-").map((s) => s.trim().toLowerCase());

    if (rangeParts.length === 2) {
      const startIdx = DAYS.findIndex((d) => dayMap[rangeParts[0]] === d.key);
      const endIdx = DAYS.findIndex((d) => dayMap[rangeParts[1]] === d.key);
      if (startIdx >= 0 && endIdx >= 0) {
        for (let i = startIdx; i <= endIdx; i++) {
          schedule[DAYS[i].key] = { open: open.padStart(2, "0"), close: close.padStart(2, "0") };
        }
      }
    } else {
      const key = dayMap[rangeParts[0]];
      if (key) schedule[key] = { open: open.padStart(2, "0"), close: close.padStart(2, "0") };
    }
  }

  return schedule;
}

export { DAYS };
