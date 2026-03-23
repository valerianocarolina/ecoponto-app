import styles from "./styles.module.css";

type Props = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
};

export function Button({ title, description, icon, onClick }: Props) {
  return (
    <button className={styles.button} onClick={onClick}>
      <div className={styles.icon}>{icon}</div>

      <div className={styles.text}>
        <p className={`${styles.textTitle} text-body`}>{title}</p>
        <p className="text-small">{description}</p>
      </div>
    </button>
  );
}
