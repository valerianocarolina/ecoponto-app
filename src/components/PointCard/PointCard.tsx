"use client";

import styles from "./styles.module.css";
import { MapPin, Clock, Pencil, Trash2 } from "lucide-react";
import { MATERIAL_COLORS, MATERIAL_LABELS, MaterialType } from "@/util/materials";
import { SmallButtonWithIcon } from "../SmallButtonWithIcon/SmallButtonWithIcon";

type Props = {
  name: string;
  address: string;
  hours: string;
  materials: MaterialType[];
  image?: string;
  onEdit: () => void;
  onDelete: () => void;
};

export function PointCard({
  name,
  address,
  hours,
  materials,
  image,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className={styles.card}>
      <img
        src={image || "/assets/default-image.jpg"}
        alt={name}
        className={styles.cardImage}
      />

      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <div className={styles.cardInfo}>
            <h3 className={styles.cardName}>{name}</h3>

            <p className={styles.cardDetail}>
              <MapPin className={styles.cardDetailIcon} />
              {address}
            </p>

            <p className={styles.cardDetail}>
              <Clock className={styles.cardDetailIcon} />
              {hours}
            </p>
          </div>

          <div className={styles.cardActions}>
            <SmallButtonWithIcon
                variant="ghost"
                icon={<Pencil size={16} />}
                onClick={onEdit}
            />

            <SmallButtonWithIcon
                variant="danger"
                icon={<Trash2 size={16} />}
                onClick={onDelete}
            />
          </div>
        </div>

        <div className={styles.materials}>
          {materials.map((m) => (
            <span
              key={m}
              className={`${styles.materialBadge} ${styles[MATERIAL_COLORS[m]]}`}
            >
              {MATERIAL_LABELS[m]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}