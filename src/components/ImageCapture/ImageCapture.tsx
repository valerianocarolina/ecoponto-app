"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import styles from "./styles.module.css";
import { Button } from "../ButtonWithIcon/ButtonWithIcon";

type Props = {
  onImageUrl: (url: string) => void;
  initialUrl?: string;
};

export function ImageCapture({ onImageUrl, initialUrl }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl || null);

  useEffect(() => {
    setPreview(initialUrl || null);
  }, [initialUrl]);

  function handleFile(file: File) {
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onImageUrl(base64);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className={styles.container}>
      {preview ? (
        <div className={styles.previewWrap}>
          <img src={preview} className={styles.previewImg} />

          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => {
              setPreview(null);
              onImageUrl("");
            }}
          >
            <X className={styles.removeIcon} />
          </button>
        </div>
      ) : (
        <div className={styles.buttons}>
            <Button type="secondary" title="Camera" icon={<Camera size={16} />} onClick={() => fileRef.current?.click()} />
            <Button type="secondary" title="Galeria" icon={<ImagePlus size={16} />} onClick={() => fileRef.current?.click()} />
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) =>
          e.target.files && handleFile(e.target.files[0])
        }
      />
    </div>
  );
}