"use client";

import styles from "./styles.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppIcon } from "@/components/AppIcon/AppIcon";
import { TextField } from "@/components/TextField/TextField";
import { PrimaryButton } from "@/components/PrimaryButton/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { routes } from "@/routes/routes";
import { loginEmpresa as loginRequest } from "@/services/auth";
import { useTranslations } from "next-intl";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const t = useTranslations("LoginEmpresa");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert(t("missingData"));
      return;
    }

    try {
      setLoading(true);
      const data = await loginRequest(email, password);

      login(data, "cooperative");

      router.push(routes.meusPontos);
    } catch (err: any) {
      alert(err.message || t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="screen">
      <div className="container">
        <div
          className={styles.backButton}
          onClick={() => router.push(routes.home)}
        >
          <ArrowLeft size={16} /> {t("goBack")}
        </div>

        <div className={styles.header}>
          <AppIcon size={56} />
          <h1 className="text-title">{t("title")}</h1>
          <p className="text-small">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <TextField
            label={t("email")}
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label={t("password")}
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? t("entering") : t("enter")}
          </PrimaryButton>
        </form>

        <div className={styles.footer}>
          <p className="text-small">
            {t("noAccount")}
            <span
              style={{
                color: "hsl(var(--primary))",
                fontWeight: 500,
                cursor: "pointer",
              }}
              onClick={() => router.push(routes.cadastro)}
            >
              {t("register")}
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
