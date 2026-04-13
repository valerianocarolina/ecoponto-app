"use client";

import styles from "./styles.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Fingerprint } from "lucide-react";
import { AppIcon } from "@/components/AppIcon/AppIcon";
import { TextField } from "@/components/TextField/TextField";
import { PrimaryButton } from "@/components/PrimaryButton/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { routes } from "@/routes/routes";
import { loginEmpresa as loginRequest } from "@/services/auth";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";

export default function Login() {
  const router = useRouter();
  const { login, restoreAuth } = useAuth();
  const { supported: bioSupported, enrolled: bioEnrolled, authenticate, getAuthCache } = useBiometricAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);
      const data = await loginRequest(email, password);

      login(data, "cooperative");

      router.push(routes.meusPontos);
    } catch (err: any) {
      alert(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!bioSupported || !bioEnrolled) {
      alert("Biometria nao ativada neste dispositivo.");
      return;
    }

    setBioLoading(true);

    try {
      const authenticated = await authenticate();
      if (!authenticated) {
        alert("Falha na autenticacao biometrica.");
        return;
      }

      const cache = getAuthCache();
      if (!cache || cache.tipo !== "cooperative") {
        alert("Faca login com email e senha ao menos uma vez para habilitar biometria.");
        return;
      }

      if (Date.now() > cache.expiresAt) {
        alert("Sessao biometrica expirada. Faca login novamente com email e senha.");
        return;
      }

      restoreAuth(cache);
      router.push(routes.meusPontos);
    } finally {
      setBioLoading(false);
    }
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
          <p className="text-small">Acesse a area de gerenciamento</p>
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

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </PrimaryButton>

          {bioSupported && bioEnrolled && (
            <PrimaryButton type="button" onClick={handleBiometricLogin} disabled={bioLoading}>
              <Fingerprint size={16} />
              {bioLoading ? "Validando biometria..." : "Entrar com biometria"}
            </PrimaryButton>
          )}
        </form>

        <div className={styles.footer}>
          <p className="text-small">
            Nao tem conta? 
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
