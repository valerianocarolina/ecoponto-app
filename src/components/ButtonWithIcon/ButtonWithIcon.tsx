import { Button as AntButton } from "antd";
import styles from "./styles.module.css";

type Props = {
  type: "primary" | "secondary";
  title: string;
  description?: string;
  icon: React.ReactNode;
  onClick: () => void;
};

export function Button({ type = "primary", title, description, icon, onClick }: Props) {
  return (
    type === "primary" ? (
    <AntButton className={styles.button} onClick={onClick}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.text}>
        <span className={styles.textTitle}>{title}</span>
        <span>{description}</span>
      </div>
    </AntButton>
    ) : (
      <button type="button" className={styles.secondaryButton} onClick={onClick}>
        {icon}
        <span className={styles.secondaryTextTitle}>{title}</span>
      </button>
    )
  )
}