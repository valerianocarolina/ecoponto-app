"use client";

import { useRouter } from "next/navigation";
import styles from "../styles.module.css";
import React, { useState } from "react";
import { loginCliente as loginRequest } from "@/services/auth";
import { routes } from "@/routes/routes";
import { ArrowLeft, Fingerprint } from "lucide-react";
import { AppIcon } from "@/components/AppIcon/AppIcon";
import { TextField } from "@/components/TextField/TextField";
import { PrimaryButton } from "@/components/PrimaryButton/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";

export default function LoginCliente() {
    const router = useRouter();
    const { login, restoreAuth } = useAuth();
    const { supported: bioSupported, enrolled: bioEnrolled, authenticate, getAuthCache } = useBiometricAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [bioLoading, setBioLoading] = useState(false);

    const requestLocationPermission = async (): Promise<boolean> => {
        if (!("geolocation" in navigator)) {
            alert("Geolocalizacao nao suportada neste dispositivo.");
            return false;
        }

        const wantsToEnableLocation = window.confirm(
            "Para continuar, precisamos da sua localizacao. Deseja ativar agora?"
        );

        if (!wantsToEnableLocation) {
            return false;
        }

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                () => resolve(true),
                (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        const retry = window.confirm(
                            "Permissao negada. No iPhone, verifique Safari > Ajustes do Site > Localizacao e tente novamente. Deseja tentar de novo?"
                        );

                        if (retry) {
                            requestLocationPermission().then(resolve);
                            return;
                        }
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        alert("Localizacao indisponivel no momento. Verifique se o GPS esta ativo e tente novamente.");
                    } else if (error.code === error.TIMEOUT) {
                        alert("Tempo esgotado ao buscar localizacao. Tente novamente em area com melhor sinal.");
                    } else {
                        alert("Nao foi possivel obter sua localizacao. Tente novamente.");
                    }
                    resolve(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 12000,
                    maximumAge: 0,
                }
            );
        });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Preencha todos os campos");
            return;
        }

        const locationGranted = await requestLocationPermission();
        if (!locationGranted) return;

        try {
            setLoading(true);

            const data = await loginRequest(email, password);
            
            // Usar o AuthContext para fazer login corretamente
            login(data, "user");

            router.push(routes.mapa);
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

        const locationGranted = await requestLocationPermission();
        if (!locationGranted) return;

        setBioLoading(true);

        try {
            const authenticated = await authenticate();
            if (!authenticated) {
                alert("Falha na autenticacao biometrica.");
                return;
            }

            const cache = getAuthCache();
            if (!cache || cache.tipo !== "user") {
                alert("Faca login com email e senha ao menos uma vez para habilitar biometria.");
                return;
            }

            if (Date.now() > cache.expiresAt) {
                alert("Sessao biometrica expirada. Faca login novamente com email e senha.");
                return;
            }

            restoreAuth(cache);
            router.push(routes.mapa);
        } finally {
            setBioLoading(false);
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
                        <span style={{color: "hsl(var(--primary))", fontWeight: 500, cursor: "pointer",}} onClick={() => router.push(routes.cadastroCliente)}>
                            Cadastre-se
                        </span>
                    </p>
                </div>
            </div>
        </main>
    );
}