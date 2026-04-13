"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Recycle } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { PointCard } from "@/components/PointCard/PointCard";
import { useAuth } from "@/context/AuthContext";
import { CollectionPoint } from "@/data/collectionPoints";
import { routes } from "@/routes/routes";
import { getFavorites, toggleFavoritePoint } from "@/services/favorites";
import { toast } from "sonner";
import styles from "./styles.module.css";

export default function FavoritosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<CollectionPoint[]>([]);

  const userFavoritesKey = useMemo(() => user?.email || "anonymous", [user?.email]);

  useEffect(() => {
    setFavorites(getFavorites(userFavoritesKey));
  }, [userFavoritesKey]);

  const handleToggleFavorite = (point: CollectionPoint) => {
    toggleFavoritePoint(userFavoritesKey, point);
    setFavorites(getFavorites(userFavoritesKey));
    toast.success("Ponto removido dos favoritos");
  };

  return (
    <ProtectedRoute requiredType="user">
      <div className={styles.layout}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.push(routes.mapa)}
            title="Voltar"
          >
            <ArrowLeft className={styles.backIcon} />
          </button>

          <div className={styles.headerInfo}>
            <Recycle className={styles.headerIcon} />
            <h1 className={styles.headerTitle}>Meus Favoritos</h1>
          </div>

          <div className={styles.headerSpacer} />
        </header>

        <main className={styles.content}>
          {favorites.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Nenhum favorito salvo ainda</p>
              <p className={styles.emptyText}>
                Toque no coracao nos cards do mapa para salvar pontos e acessar depois.
              </p>
            </div>
          ) : (
            <div className={styles.list}>
              {favorites.map((point) => (
                <PointCard
                  key={point._id || point.id}
                  point={point}
                  hasUserLocation={false}
                  isFavorited={true}
                  onToggleFavorite={handleToggleFavorite}
                  onSelect={() => router.push(routes.mapa)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
