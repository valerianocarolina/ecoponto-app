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
import { useTranslations } from "next-intl";


export default function CadastroCliente() {
    const router = useRouter();
    const t = useTranslations("CadastroCliente");

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
            alert(err.message || t("error"));
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
                    <h1 className="text-title">{t("title")}</h1>
                    <p className="text-small">{t("subtitle")}</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <TextField label={t("name")} value={form.nome} placeholder={t("namePlaceholder")} onChange={(e) => handleChange("nome", e.target.value)}/>
                    <TextField label={t("email")} value={form.email} placeholder={t("emailPlaceholder")} onChange={(e) => handleChange("email", e.target.value)}/>
                    <TextField label={t("password")} type="password" value={form.senha} placeholder={t("passwordPlaceholder")} onChange={(e) => handleChange("senha", e.target.value)}/>

                    <PrimaryButton type="submit" disabled={loading}>
                        {loading ? t("creating") : t("create")}
                    </PrimaryButton>
                </form>
            </div>
        </main>
    );
}