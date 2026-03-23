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

export default function Cadastro() {
  const router = useRouter();
  const { loginEmpresa } = useAuth();

  const [form, setForm] = useState({
    name: "",
    cnpj: "",
    phone: "",
    email: "",
    password: "",
  });

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.cnpj || !form.email || !form.password) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    if (form.password.length < 6) {
      alert("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    loginEmpresa();
    router.push(routes.meusPontos);
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
            onChange={(e) => set("cnpj", e.target.value)}
          />

          <TextField
            label="Telefone"
            placeholder="(11) 99999-0000"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />

          <TextField
            label="Email *"
            type="email"
            placeholder="empresa@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />

          <TextField
            label="Senha *"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
          />

          <PrimaryButton type="submit">Cadastrar Empresa</PrimaryButton>
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
