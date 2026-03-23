import { Recycle } from "lucide-react";
import styles from "./styles.module.css";

export function AppIcon({ size = 56 }: { size?: number }) {
  return (
    <div className={styles.appIcon} style={{ width: size, height: size }}>
      <Recycle
        style={{ width: size * 0.5, height: size * 0.5 }}
        color="white"
      />
    </div>
  );
}
