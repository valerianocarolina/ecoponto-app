"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "../styles.module.css";
import React, { useState, useEffect, Suspense } from "react";
import { loginCliente as loginRequest } from "@/services/auth";
import { routes } from "@/routes/routes";
import { ArrowLeft } from "lucide-react";
import { AppIcon } from "@/components/AppIcon/AppIcon";
import { TextField } from "@/components/TextField/TextField";
import { PrimaryButton } from "@/components/PrimaryButton/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";

function LoginClienteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, restoreAuth } = useAuth();
    const { supported: bioSupported, enrolled: bioEnrolled, authenticate, getAuthCache } = useBiometricAuth();

    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [bioLoading, setBioLoading] = useState(false);

    const requestLocationIfNeeded = async (): Promise<boolean> => {
        if (!("geolocation" in navigator)) return true; // skip silently

        if ("permissions" in navigator) {
            try {
                const status = await navigator.permissions.query({ name: "geolocation" });
                if (status.state === "granted") return true;
                if (status.state === "denied") return true; // don't block login, just proceed
            } catch {}
        }

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                () => resolve(true),
                () => resolve(true), // don't block login on error
                { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
            );
        });
    };

    useEffect(() => {
        if (!bioSupported || !bioEnrolled) return;

        const tryBiometric = async () => {
            const cache = getAuthCache();
            if (!cache || cache.tipo !== "user" || Date.now() > cache.expiresAt) return;

            setBioLoading(true);
            try {
                const authenticated = await authenticate();
                if (authenticated) {
                    restoreAuth(cache);
                    router.push(routes.mapa);
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
            login(data, "user");
            await requestLocationIfNeeded();
            router.push(routes.mapa);
        } catch (err: any) {
            alert(err.message || "Erro ao fazer login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="screen">
            <div className="container">
                <div className={styles.backButton} onClick={() => router.push(routes.home)}>
                    <ArrowLeft size={16} />
                </div>

                <div className={styles.header}>
                    <AppIcon size={56} />
                    <h1 className="text-title">Login Cliente</h1>
                    <p className="text-small">Acesse para encontrar pontos</p>
                </div>

                <form onSubmit={handleLogin} className={styles.form}>
                    <TextField label="Email" type="email" placeholder="cliente@email.com" value={email} onChange={(e) => setEmail(e.target.value)}/>

                    <TextField label="Senha" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}/>

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
                        <span style={{color: "hsl(var(--primary))", fontWeight: 500, cursor: "pointer",}} onClick={() => router.push(routes.cadastroCliente)}>
                            Cadastre-se
                        </span>
                    </p>
                </div>
            </div>
        </main>
    );
}

export default function LoginCliente() {
    return (
        <Suspense fallback={<main className="screen" />}>
            <LoginClienteContent />
        </Suspense>
    );
}