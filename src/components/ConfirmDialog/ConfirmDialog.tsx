"use client";

import styles from "./styles.module.css";
import { Loader2 } from "lucide-react";
import { SmallButtonWithIcon } from "../SmallButtonWithIcon/SmallButtonWithIcon";

type Props = {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  variant?: "default" | "destructive";
};

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  loading = false,
  variant = "default",
}: Props) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </div>

        <p className={styles.description}>{description}</p>

        <div className={styles.footer}>
          <SmallButtonWithIcon variant="ghost" onClick={onCancel}>
            Cancelar
          </SmallButtonWithIcon>
          <SmallButtonWithIcon
            variant={variant === "destructive" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Confirmar"}
          </SmallButtonWithIcon>
        </div>
      </div>
    </div>
  );
}
