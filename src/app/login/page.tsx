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

export default function Login() {
  const router = useRouter();
  const { loginEmpresa } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Preencha todos os campos");
      return;
    }

    loginEmpresa();
    router.push(routes.meusPontos);
  };

  return (
    <main className="screen">
      <div className="container">
        <div
          className={styles.backButton}
          onClick={() => router.push(routes.home)}
        >
          <ArrowLeft size={16} /> Voltar
        </div>

        <div className={styles.header}>
          <AppIcon size={56} />
          <h1 className="text-title">Login Empresa</h1>
          <p className="text-small">Acesse a área de gerenciamento</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <TextField
            label="Email"
            type="email"
            placeholder="empresa@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <PrimaryButton type="submit">Entrar</PrimaryButton>
        </form>

        <div className={styles.footer}>
          <p className="text-small">
            Não tem conta?{" "}
            <span
              style={{
                color: "hsl(var(--primary))",
                fontWeight: 500,
                cursor: "pointer",
              }}
              onClick={() => router.push(routes.cadastro)}
            >
              Cadastre sua empresa
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
