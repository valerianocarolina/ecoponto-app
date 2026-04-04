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

export default function Cadastro() {
  const router = useRouter();
  const { login } = useAuth();

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
      setCnpjError("CNPJ inválido");
      return;
    }

    if (!validateEmail(form.email)) {
      setEmailError("Email inválido");
      return;
    }

    if (form.phone && !validatePhone(form.phone)) {
      setPhoneError("Telefone inválido");
      return;
    }

    if (!form.name || !form.cnpj || !form.email || !form.password) {
      alert("Preencha os campos obrigatórios");
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
        documento: form.cnpj,
        senha: form.password,
      });

      login(data, "cooperative");
      router.push(routes.meusPontos);
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
            label="Nome da Empresa *"
            placeholder="EcoRecicla Ltda"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />

          <TextField
            label="CNPJ *"
            placeholder="00.000.000/0000-00"
            value={form.cnpj}
            onChange={(e) => {
              set("cnpj", e.target.value);
              setCnpjError("");
            }}
            error={cnpjError}
          />

          <TextField
            label="Telefone"
            placeholder="(11) 99999-0000"
            value={form.phone}
            onChange={(e) => {
              set("phone", e.target.value);
              setPhoneError("");
            }}
            error={phoneError}
          />

          <TextField
            label="Email *"
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
            label="Senha *"
            type="password"
            placeholder="Mínimo 6 caracteres"
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
            Já tem conta?{" "}
            <span
              className={styles.link}
              onClick={() => router.push(routes.login)}
            >
              Faça login
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
