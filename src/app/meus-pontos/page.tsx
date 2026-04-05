"use client";

import styles from "./styles.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, MapPin, Plus, Recycle } from "lucide-react";

import { PointCard } from "@/components/PointCard/PointCard";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { routes } from "@/routes/routes";
import { getPoints, deletePoint } from "@/services/points";
import { SmallButtonWithIcon } from "@/components/SmallButtonWithIcon/SmallButtonWithIcon";

export default function MeusPontos() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPoints();
        setPoints(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleDelete(id: string) {
    await deletePoint(id);
    setPoints((prev) => prev.filter((p) => p.id !== id));
  }

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
              <p className={styles.headerSub}>
                {user?.nome || "Minha empresa"}
              </p>
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
              <Loader2 />
            </div>
          ) : points.length === 0 ? (
            <div className={styles.emptyState}>
              <MapPin className={styles.emptyIcon} />

              <p className="text-body">Nenhum ponto cadastrado</p>
              <p className="text-small">
                Adicione seu primeiro ponto de coleta
              </p>
            </div>
          ) : (
            <div className={styles.list}>
              {points.map((p) => (
                <PointCard
                  key={p.id}
                  name={p.nome}
                  address={p.endereco}
                  hours={p.horario}
                  materials={p.tags}
                  image={p.imagem}
                  onEdit={() => {}}
                  onDelete={() => handleDelete(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}