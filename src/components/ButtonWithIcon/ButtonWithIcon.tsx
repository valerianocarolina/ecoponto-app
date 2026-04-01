import { Button as AntButton } from "antd";
import styles from "./styles.module.css";

type Props = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
};

export function Button({ title, description, icon, onClick }: Props) {
  return (
    <AntButton className={styles.button} onClick={onClick}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.text}>
        <span className={styles.textTitle}>{title}</span>
        <span className={styles.description}>{description}</span>
      </div>
    </AntButton>
  );
}