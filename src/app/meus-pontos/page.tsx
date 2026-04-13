"use client";

import styles from "./styles.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, MapPin, Plus, Recycle, Settings } from "lucide-react";

import { PointCardAdmin } from "@/components/PointCardAdmin/PointCardAdmin";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { routes } from "@/routes/routes";
import { getPoints, deletePoint } from "@/services/points";
import { formatHours } from "@/util/formatHours";
import { SmallButtonWithIcon } from "@/components/SmallButtonWithIcon/SmallButtonWithIcon";

export default function MeusPontos() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPoints();
        console.log(data);
        setPoints(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function handleDeleteClick(id: string) {
    setDeleteConfirmId(id);
    setDeleteConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deleteConfirmId) return;
    setDeleteLoading(true);
    try {
      await deletePoint(deleteConfirmId);
      setPoints((prev) => prev.filter((p) => p._id !== deleteConfirmId));
      setDeleteConfirmOpen(false);
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmId(null);
    }
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
              icon={<Settings size={16} />}
              onClick={() => router.push("/empresa/perfil")}
            />

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
              {points.map((p) => {
                return (
                <PointCardAdmin
                  key={p._id}
                  name={p.nome}
                  address={p.endereco}
                  hours={formatHours(p.horario)}
                  materials={p.tags}
                  image={p.imagem || "/default-point.jpg"}
                  onEdit={() => router.push(`${routes.cadastraPontos}?id=${p._id}`)}
                  onDelete={() => handleDeleteClick(p._id)}
                />
                )
              }
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Deletar ponto de coleta"
        description="Tem certeza que deseja deletar este ponto? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeleteConfirmId(null);
        }}
        loading={deleteLoading}
        variant="destructive"
      />
    </ProtectedRoute>
  );
}