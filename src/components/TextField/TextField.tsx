import styles from "./styles.module.css";

type Props = {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
};

export function TextField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}: Props & { error?: string }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>

      <input
        className={`${styles.fieldInput} ${error ? styles.error : ""}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
