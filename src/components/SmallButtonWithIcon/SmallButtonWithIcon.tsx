"use client";

import styles from "./styles.module.css";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
  fullWidth?: boolean;
  style?: React.CSSProperties;
};

export function SmallButtonWithIcon({
  children,
  icon,
  onClick,
  variant = "primary",
  fullWidth = false,
  style,
}: Props) {
  return (
    <button
      onClick={onClick}
      style={style}
      className={`
        ${styles.button}
        ${styles[variant]}
        ${fullWidth ? styles.fullWidth : ""}
        ${!children ? styles.iconOnly : ""}
      `}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
}