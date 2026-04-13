"use client";

import styles from "./styles.module.css";
import { useRouter } from "next/navigation";
import { User, Building2 } from "lucide-react";
import { Button } from "@/components/ButtonWithIcon/ButtonWithIcon";
import { AppIcon } from "@/components/AppIcon/AppIcon";
import { routes } from "@/routes/routes";

export default function Home() {
  const router = useRouter();

  return (
    <main className={styles.screen}>
      <div className={styles.container}>
        <AppIcon />

        <h1>EcoPonto</h1>
        <p className="text-small">
          Encontre pontos de coleta ou gerencie seus pontos
        </p>

        <Button
          title="Sou cliente"
          description="Encontre pontos de coleta proximos a voce"
          icon={<User />}
          onClick={() => router.push(routes.loginCliente)}
        />

        <Button
          title="Sou empresa"
          description="Gerencie seus pontos de reciclagem"
          icon={<Building2 />}
          onClick={() => router.push(routes.login)}
        />
      </div>
    </main>
  );
}
