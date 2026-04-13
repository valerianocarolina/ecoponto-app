"use client";

import styles from "./styles.module.css";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppIcon } from "@/components/AppIcon/AppIcon";
import { TextField } from "@/components/TextField/TextField";
import { PrimaryButton } from "@/components/PrimaryButton/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { routes } from "@/routes/routes";
import { loginEmpresa as loginRequest } from "@/services/auth";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, restoreAuth } = useAuth();
  const { supported: bioSupported, enrolled: bioEnrolled, authenticate, getAuthCache } = useBiometricAuth();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);

  useEffect(() => {
    if (!bioSupported || !bioEnrolled) return;

    const tryBiometric = async () => {
      const cache = getAuthCache();
      if (!cache || cache.tipo !== "cooperative" || Date.now() > cache.expiresAt) return;

      setBioLoading(true);
      try {
        const authenticated = await authenticate();
        if (authenticated) {
          restoreAuth(cache);
          router.push(routes.meusPontos);
        }
      } finally {
        setBioLoading(false);
      }
    };

    tryBiometric();
  }, [bioSupported, bioEnrolled]);

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



  return (
    <main className="screen">
      <div className="container">
        <div
          className={styles.backButton}
          onClick={() => router.push(routes.home)}
        >
          <ArrowLeft size={16} /> 
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
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <PrimaryButton type="submit" disabled={loading || bioLoading}>
            {bioLoading ? "Verificando biometria..." : loading ? "Entrando..." : "Entrar"}
          </PrimaryButton>

          {bioLoading && (
            <p style={{ textAlign: "center", fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
              Tentando login biométrico...
            </p>
          )}
        </form>

        <div className={styles.footer}>
          <p className="text-small">
            Nao tem conta?{" "}
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

export default function Login() {
  return (
    <Suspense fallback={<main className="screen" />}>
      <LoginContent />
    </Suspense>
  );
}
