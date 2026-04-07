"use client";

import { MaterialType, MATERIAL_LABELS } from "@/util/materials";
import styles from "./MaterialBadge.module.css";

interface MaterialBadgeProps {
  material: MaterialType;
}

export function MaterialBadge({ material }: MaterialBadgeProps) {
  return (
    <span className={styles.badge} title={MATERIAL_LABELS[material]}>
      {MATERIAL_LABELS[material]}
    </span>
  );
}
