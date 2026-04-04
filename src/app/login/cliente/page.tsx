"use client";

import { useRouter } from "next/navigation";
import styles from "../styles.module.css";
import React, { useState } from "react";
import { loginCliente as loginRequest } from "@/services/auth";
import { routes } from "@/routes/routes";
import { ArrowLeft } from "lucide-react";
import { AppIcon } from "@/components/AppIcon/AppIcon";
import { TextField } from "@/components/TextField/TextField";
import { PrimaryButton } from "@/components/PrimaryButton/PrimaryButton";

export default function LoginCliente() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Preencha todos os campos");
            return;
        }

        try {
            setLoading(true);

            const data = await loginRequest(email, password);
            localStorage.setItem("token", data.token);

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

                    <PrimaryButton type="submit" disabled={loading}>
                        {loading ? "Entrando..." : "Entrar"}
                    </PrimaryButton>
                </form>

                <div className={styles.footer}>
                    <p className="text-small">
                        Não tem conta?{" "}
                        <span style={{color: "hsl(var(--primary))", fontWeight: 500, cursor: "pointer",}} onClick={() => router.push(routes.cadastroCliente)}>
                            Cadastre-se
                        </span>
                    </p>
                </div>
            </div>
        </main>
    );
}