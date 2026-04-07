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
import { registerEmpresa } from "@/services/auth";
import { isValidCNPJ } from "@/util/validateCnpj";
import { validateEmail } from "@/util/validateEmail";
import { validatePhone } from "@/util/validatePhone";
import { useTranslations } from "next-intl";

export default function Cadastro() {
  const router = useRouter();
  const { login } = useAuth();
  const t = useTranslations("CadastroEmpresa");

  const [form, setForm] = useState({
    name: "",
    cnpj: "",
    phone: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidCNPJ(form.cnpj)) {
      setCnpjError(t("cnpjError"));
      return;
    }

    if (!validateEmail(form.email)) {
      setEmailError(t("emailError"));
      return;
    }

    if (form.phone && !validatePhone(form.phone)) {
      setPhoneError(t("phoneError"));
      return;
    }

    if (!form.name || !form.cnpj || !form.email || !form.password) {
      alert(t("missingData"));
      return;
    }

    if (form.password.length < 6) {
      setPasswordError(t("passwordError"));
      return;
    }

    setLoading(true);

    try {
      const data = await registerEmpresa({
        nome: form.name,
        email: form.email,
        telefone: form.phone,
        documento: form.cnpj,
        senha: form.password,
      });

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
      <div className={styles.container}>
        <div
          className={styles.backButton}
          onClick={() => router.push(routes.login)}
        >
          <ArrowLeft size={16} />
          {t("goBack")}
        </div>

        <div className={styles.header}>
          <AppIcon size={56} />

          <h1 className="text-title">{t("title")}</h1>

          <p className="text-small">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            label={t("name")}
            placeholder={t("namePlaceholder")}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />

          <TextField
            label={t("cnpj")}
            placeholder={t("cnpjPlaceholder")}
            value={form.cnpj}
            onChange={(e) => {
              set("cnpj", e.target.value);
              setCnpjError("");
            }}
            error={cnpjError}
          />

          <TextField
            label={t("phone")}
            placeholder={t("phonePlaceholder")}
            value={form.phone}
            onChange={(e) => {
              set("phone", e.target.value);
              setPhoneError("");
            }}
            error={phoneError}
          />

          <TextField
            label={t("email")}
            type="email"
            placeholder={t("emailPlaceholder")}
            value={form.email}
            onChange={(e) => {
              set("email", e.target.value);
              setEmailError("");
            }}
            error={emailError}
          />

          <TextField
            label={t("password")}
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={form.password}
            onChange={(e) => {
              set("password", e.target.value);
              setPasswordError("");
            }}
            error={passwordError}
          />

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? t("creating") : t("create")}
          </PrimaryButton>
        </form>

        <div className={styles.footer}>
          <p className="text-small">
            {t("haveAccount")}
            <span
              className={styles.link}
              onClick={() => router.push(routes.login)}
            >
              {t("login")}
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
