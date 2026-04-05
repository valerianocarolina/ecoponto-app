"use client";

import { DAYS, type Schedule, type DayKey } from "@/lib/schedule";
import styles from "./styles.module.css";

type Props = {
  schedule: Schedule;
  onChange: (s: Schedule) => void;
};

export function HoursSchedule({ schedule, onChange }: Props) {
  function toggleDay(key: DayKey) {
    onChange({
      ...schedule,
      [key]: schedule[key]
        ? null
        : { open: "08", close: "18" },
    });
  }

  function setTime(
    key: DayKey,
    field: "open" | "close",
    value: string
  ) {
    const clean = value.replace(/\D/g, "").slice(0, 2);

    onChange({
      ...schedule,
      [key]: {
        ...schedule[key]!,
        [field]: clean,
      },
    });
  }

  return (
    <div className={styles.scheduleGrid}>
      {DAYS.map((day) => {
        const active = schedule[day.key];

        return (
          <div key={day.key} className={styles.dayRow}>
            <div className={styles.dayCheck}>
              <input
                type="checkbox"
                checked={!!active}
                onChange={() => toggleDay(day.key)}
                className={styles.dayCheckbox}
              />
              <span className={styles.dayLabel}>
                {day.label}
              </span>
            </div>

            <div className={styles.timeInputs}>
              <input
                type="text"
                value={active?.open || ""}
                disabled={!active}
                onChange={(e) =>
                  setTime(day.key, "open", e.target.value)
                }
                className={styles.timeInput}
                placeholder="08"
              />

              <span>h às</span>

              <input
                type="text"
                value={active?.close || ""}
                disabled={!active}
                onChange={(e) =>
                  setTime(day.key, "close", e.target.value)
                }
                className={styles.timeInput}
                placeholder="18"
              />

              <span>h</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}