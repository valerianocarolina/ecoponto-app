import styles from "./styles.module.css";

type Props = {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function TextField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: Props) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        className={styles.fieldInput}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
