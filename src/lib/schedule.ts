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

export function parseScheduleInput(value: any): Schedule {
  if (!value) return emptySchedule();

  let parsedValue = value;

  if (typeof parsedValue === "string") {
    try {
      parsedValue = JSON.parse(parsedValue);
    } catch {
      return emptySchedule();
    }
  }

  if (typeof parsedValue !== "object") return emptySchedule();

  const schedule = emptySchedule();

  Object.entries(parsedValue as Record<string, any>).forEach(([day, item]) => {
    if (!item || typeof item !== "object") return;
    const key = day as DayKey;
    if (!DAYS.some((d) => d.key === key)) return;

    if (item.open !== undefined && item.close !== undefined) {
      schedule[key] = {
        open: String(item.open).padStart(2, "0"),
        close: String(item.close).padStart(2, "0"),
      };
      return;
    }

    if (item.inicio !== undefined && item.fim !== undefined) {
      const openStr = String(item.inicio).split(":")[0];
      const closeStr = String(item.fim).split(":")[0];
      schedule[key] = {
        open: openStr.padStart(2, "0"),
        close: closeStr.padStart(2, "0"),
      };
      return;
    }

    if (item.aberto === false) {
      schedule[key] = null;
    }
  });

  return schedule;
}

export function scheduleToApiHorario(schedule: Schedule) {
  const result: Record<DayKey, { aberto: boolean; inicio?: string; fim?: string }> = {} as any;

  DAYS.forEach(({ key }) => {
    const entry = schedule[key];
    if (!entry) {
      result[key] = { aberto: false };
      return;
    }

    result[key] = {
      aberto: true,
      inicio: `${entry.open.padStart(2, "0")}:00`,
      fim: `${entry.close.padStart(2, "0")}:00`,
    };
  });

  return result;
}

export { DAYS };
