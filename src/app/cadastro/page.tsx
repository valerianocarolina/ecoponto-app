"use client";

import styles from "./styles.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppIcon } from "@/components/AppIcon/AppIcon";
import { TextField } from "@/components/TextField/TextField";
import { PrimaryButton } from "@/components/PrimaryButton/PrimaryButton";
import { routes } from "@/routes/routes";
import { registerEmpresa } from "@/services/auth";
import { isValidCNPJ } from "@/util/validateCnpj";
import { validateEmail } from "@/util/validateEmail";
import { validatePhone } from "@/util/validatePhone";

function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)})${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)})${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function Cadastro() {
  const router = useRouter();

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
      setCnpjError("CNPJ invalido");
      return;
    }

    if (!validateEmail(form.email)) {
      setEmailError("Email invalido");
      return;
    }

    if (form.phone && !validatePhone(form.phone)) {
      setPhoneError("Telefone invalido");
      return;
    }

    if (!form.name || !form.cnpj || !form.email || !form.password) {
      alert("Preencha os campos obrigatorios");
      return;
    }

    if (form.password.length < 6) {
      setPasswordError("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const data = await registerEmpresa({
        nome: form.name,
        email: form.email,
        telefone: form.phone,
        documento: form.cnpj.replace(/\D/g, ""),
        senha: form.password,
      });

      router.push(`${routes.login}?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      alert(err.message || "Erro ao cadastrar");
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
          Voltar ao login
        </div>

        <div className={styles.header}>
          <AppIcon size={56} />

          <h1 className="text-title">Cadastro de Empresa</h1>

          <p className="text-small">Crie sua conta para gerenciar pontos</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            label="Nome da empresa"
            placeholder="EcoRecicla LTDA"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />

          <TextField
            label="CNPJ"
            placeholder="00.000.000/0000-00"
            value={form.cnpj}
            onChange={(e) => {
              set("cnpj", formatCnpj(e.target.value));
              setCnpjError("");
            }}
            error={cnpjError}
          />

          <TextField
            label="Telefone"
            placeholder="(00) 00000-0000"
            value={form.phone}
            onChange={(e) => {
              set("phone", formatPhone(e.target.value));
              setPhoneError("");
            }}
            error={phoneError}
          />

          <TextField
            label="Email"
            type="email"
            placeholder="empresa@email.com"
            value={form.email}
            onChange={(e) => {
              set("email", e.target.value);
              setEmailError("");
            }}
            error={emailError}
          />

          <TextField
            label="Senha"
            type="password"
            placeholder="Minimo 6 caracteres"
            value={form.password}
            onChange={(e) => {
              set("password", e.target.value);
              setPasswordError("");
            }}
            error={passwordError}
          />

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar Empresa"}
          </PrimaryButton>
        </form>

        <div className={styles.footer}>
          <p className="text-small">
            Ja tem conta? 
            <span
              className={styles.link}
              onClick={() => router.push(routes.login)}
            >
              Faca login
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
