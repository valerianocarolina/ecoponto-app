"use client";

import { PointCard } from "@/components/PointCard/PointCard";
import styles from "./styles.module.css";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { routes } from "@/routes/routes";
import { Loader2, LogOut, MapPin, Plus, Recycle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { mockPoints } from "@/util/mockPoints";
import { USE_MOCK } from "@/util/config";
import { SmallButtonWithIcon } from "@/components/SmallButtonWithIcon/SmallButtonWithIcon";

export default function MeusPontos() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function load() {
    try {
      if (USE_MOCK) {
        setPoints(mockPoints);
        return;
      }

      const data = [];
      setPoints(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  load();
}, []);

  return (
    <ProtectedRoute requiredType="cooperative">
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoBox}>
            <Recycle className={styles.logoIcon} />
          </div>

          <div>
            <h1 className={styles.headerTitle}>Meus Pontos</h1>
            <p className={styles.headerSub}>{user?.nome || "Minha empresa"}</p>
          </div>
        </div>

        <div className={styles.headerRight}>
          <SmallButtonWithIcon
            variant="primary"
            onClick={() => router.push(routes.cadastraPontos)}
            icon={<Plus size={16} />}
          >
            Novo
          </SmallButtonWithIcon>

          <SmallButtonWithIcon
            variant="ghost"
            icon={<LogOut size={16} />}
            onClick={logout}
          />
        </div>
      </header>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <Loader2 className={styles.spinner} />
          </div>
        ) : points.length === 0 ? (
          <div className={styles.emptyState}>
            <MapPin className={styles.emptyIcon} />

            <p className="text-body">Nenhum ponto cadastrado</p>
            <p className="text-small">Adicione seu primeiro ponto de coleta</p>

          </div>
        ) : (
          <div className={styles.list}>
            {points.map((p) => (
              <PointCard 
                key={p.id}
                name={p.name}
                address={p.address}
                hours={p.hours}
                materials={p.materials}
                image={p.image}
                onEdit={() => router.push(`/editar/${p.id}`)}
                onDelete={() => console.log("delete", p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  )
}
