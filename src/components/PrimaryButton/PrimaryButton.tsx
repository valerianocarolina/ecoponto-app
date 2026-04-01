import { Button, ButtonProps } from "antd";
import styles from "./styles.module.css";

type PrimaryButtonProps = Omit<ButtonProps, "type"> & {
  type?: "button" | "submit" | "reset";
};

export function PrimaryButton({ children, type, ...props }: PrimaryButtonProps) {
  return (
    <Button
      className={styles.primaryButton}
      {...props}
      type="primary"
      htmlType={type}
    >
      {children}
    </Button>
  );
}