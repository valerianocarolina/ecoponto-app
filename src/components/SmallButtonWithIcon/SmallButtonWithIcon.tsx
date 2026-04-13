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
  disabled?: boolean;
};

export function SmallButtonWithIcon({
  children,
  icon,
  onClick,
  variant = "primary",
  fullWidth = false,
  style,
  disabled = false,
}: Props) {
  return (
    <button
      onClick={onClick}
      style={style}
      disabled={disabled}
      className={`
        ${styles.button}
        ${styles[variant]}
        ${fullWidth ? styles.fullWidth : ""}
        ${!children ? styles.iconOnly : ""}
        ${disabled ? styles.disabled : ""}
      `}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
}