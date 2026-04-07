"use client";

import styles from "./styles.module.css";
import { useRouter } from "next/navigation";
import { User, Building2 } from "lucide-react";
import { Button } from "@/components/ButtonWithIcon/ButtonWithIcon";
import { AppIcon } from "@/components/AppIcon/AppIcon";
import { routes } from "@/routes/routes";
import { useTranslations } from "next-intl";

export default function Home() {
  const router = useRouter();
  const t = useTranslations("Home");

  return (
    <main className={styles.screen}>
      <div className={styles.container}>
        <AppIcon />

        <h1>{t("title")}</h1>
        <p className="text-small">
          {t("description")}
        </p>

        <Button
          title={t("clienteTitle")}
          description={t("clienteDescription")}
          icon={<User />}
          onClick={() => router.push(routes.loginCliente)}
        />

        <Button
          title={t("empresaTitle")}
          description={t("empresaDescription")}
          icon={<Building2 />}
          onClick={() => router.push(routes.login)}
        />
      </div>
    </main>
  );
}
