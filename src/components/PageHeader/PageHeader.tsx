"use client";

import styles from "./styles.module.css";
import { ArrowLeft } from "lucide-react";

type Props = {
  title: string;
  onBackClick: () => void;
  actionButton?: React.ReactNode;
};

export function PageHeader({ title, onBackClick, actionButton }: Props) {
  return (
    <header className={styles.header}>
      <button className={styles.backBtn} onClick={onBackClick}>
        <ArrowLeft size={20} />
      </button>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.spacer}>
        {actionButton}
      </div>
    </header>
  );
}
