import { Input } from "antd";
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
}: Props) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>

      <Input
        className={`${styles.fieldInput} ${error ? styles.error : ""}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
        variant="borderless"
      />

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}