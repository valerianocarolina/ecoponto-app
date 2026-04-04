"use client";

import { AppIcon } from "@/components/AppIcon/AppIcon";
import styles from "../styles.module.css";
import { routes } from "@/routes/routes";
import { registerCliente } from "@/services/auth";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TextField } from "@/components/TextField/TextField";
import { PrimaryButton } from "@/components/PrimaryButton/PrimaryButton";


export default function CadastroCliente() {
    const router = useRouter();

    const [form, setForm] = useState({
        nome: "",
        email: "",
        senha: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            const data = await registerCliente(form);

            localStorage.setItem("token", data.token);
            router.push(routes.mapa);
        } catch (err: any) {
            alert(err.message || "Erro ao cadastrar");
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
                    <h1 className="text-title">Cadastro Cliente</h1>
                    <p className="text-small">Crie sua conta</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <TextField label="Nome" value={form.nome} placeholder="Seu nome" onChange={(e) => handleChange("nome", e.target.value)}/>
                    <TextField label="Email" value={form.email} placeholder="Seu email" onChange={(e) => handleChange("email", e.target.value)}/>
                    <TextField label="Senha" type="password" value={form.senha} placeholder="Sua senha" onChange={(e) => handleChange("senha", e.target.value)}/>

                    <PrimaryButton type="submit" disabled={loading}>
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </PrimaryButton>
                </form>
            </div>
        </main>
    );
}