import styles from "./styles.module.css";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ children, ...props }: Props) {
  return (
    <button className={styles.primaryButton} {...props}>
      {children}
    </button>
  );
}
