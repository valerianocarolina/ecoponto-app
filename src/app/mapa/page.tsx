"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Recycle,
  Menu,
  X,
  MapPin,
  ArrowLeft,
  UserCircle,
  Bell,
  BellOff,
  Heart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import {
  CollectionPoint,
  MATERIAL_LABELS_DATA,
  transformApiPoint,
} from "@/data/collectionPoints";
import { MaterialType } from "@/util/materials";
import { routes } from "@/routes/routes";
import { useAuth } from "@/context/AuthContext";
import { PointCard } from "@/components/PointCard/PointCard";
import { EcoMap } from "@/components/EcoMap/EcoMap";
import { useGeolocation } from "@/hooks/useGeolocation";
import styles from "./styles.module.css";
import { getAllCollectionPoints } from "@/services/points";
import { ProtectedRoute } from "@/components/ProtectedRoute/ProtectedRoute";
import { getFavoriteIds, toggleFavoritePoint } from "@/services/favorites";

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const ALL: MaterialType[] = [
  "plastico",
  "vidro",
  "papel",
  "metal",
  "eletronico",
  "oleo",
];

export default function MapPage() {
  const router = useRouter();
  const geo = useGeolocation();
  const { user } = useAuth();

  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [filters, setFilters] = useState<MaterialType[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);
  const [routeDestination, setRouteDestination] = useState<CollectionPoint | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [locationToastShown, setLocationToastShown] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const knownPointIdsRef = useRef<Set<string>>(new Set());
  const userFavoritesKey = user?.email || "anonymous";

  const userLocation = geo.position;

  useEffect(() => {
    let active = true;

    const loadPoints = async (notifyNew: boolean) => {
      try {
        if (notifyNew === false) {
          setIsLoadingPoints(true);
        }

        const apiPoints = await getAllCollectionPoints();
        const transformed: CollectionPoint[] = (apiPoints || []).map(transformApiPoint);

        if (!active) return;

        setPoints(transformed);

        const currentIds = transformed
          .map((point) => String(point._id || point.id || ""))
          .filter(Boolean);

        if (knownPointIdsRef.current.size === 0) {
          knownPointIdsRef.current = new Set(currentIds);
          return;
        }

        const newPoints = transformed.filter(
          (point) => !knownPointIdsRef.current.has(String(point._id || point.id || ""))
        );

        if (
          notifyNew &&
          newPoints.length > 0 &&
          notificationPermission === "granted"
        ) {
          const firstPointName = newPoints[0].name || newPoints[0].nome || "Novo ponto";
          new Notification("Novo ponto de coleta cadastrado", {
            body:
              newPoints.length === 1
                ? `${firstPointName} acabou de ser adicionado.`
                : `${newPoints.length} novos pontos foram adicionados.`,
            icon:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
          });

          toast.success(
            newPoints.length === 1
              ? `Novo ponto cadastrado: ${firstPointName}`
              : `${newPoints.length} novos pontos cadastrados`
          );
        }

        knownPointIdsRef.current = new Set(currentIds);
      } catch (error) {
        if (!notifyNew) {
          toast.error("Usando dados offline");
        }
      } finally {
        if (active && !notifyNew) {
          setIsLoadingPoints(false);
        }
      }
    };

    loadPoints(false);
    const interval = window.setInterval(() => loadPoints(true), 30000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [notificationPermission]);

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
      if (
        Notification.permission === "default" ||
        Notification.permission === "denied"
      ) {
        const timer = setTimeout(() => {
          toast.info(
            "Ative notificações para receber avisos de novos pontos próximos!"
          );
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    if (geo.error) {
      toast.error(geo.error);
    }
  }, [geo.error]);

  useEffect(() => {
    if (geo.position && !geo.loading && !locationToastShown) {
      toast.success("📍 Localização encontrada!");
      setLocationToastShown(true);
    }
  }, [geo.position, geo.loading, locationToastShown]);

  useEffect(() => {
    setFavoriteIds(getFavoriteIds(userFavoritesKey));
  }, [userFavoritesKey]);

  const filteredPoints = useMemo(() => {
    if (filters.length === 0) return points;
    return points.filter((p) => {
      const materials = p.materials || p.tags || [];
      return filters.some((f) => materials.includes(f));
    });
  }, [points, filters]);

  const sortedPoints = useMemo(() => {
    if (!userLocation) return filteredPoints;
    return [...filteredPoints].sort(
      (a, b) =>
        calculateDistance(userLocation[0], userLocation[1], a.lat, a.lng) -
        calculateDistance(userLocation[0], userLocation[1], b.lat, b.lng)
    );
  }, [filteredPoints, userLocation]);

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      toast.error("Notificações não suportadas neste navegador");
      return;
    }

    if (Notification.permission === "granted") {
      toast.info("Notificações já estão ativadas");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationPermission(permission);
      toast.success("✓ Notificações ativadas!");
      new Notification("EcoPonto", {
        body: "Você receberá avisos de novos pontos próximos!",
        icon: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
      });
    } else {
      toast.error("Permissão de notificação negada");
    }
  };

  const handleToggleMaterial = (material: MaterialType) => {
    setFilters((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  const handleToggleFavorite = (point: CollectionPoint) => {
    const isNowFavorited = toggleFavoritePoint(userFavoritesKey, point);
    const pointId = String(point._id || point.id || "");

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isNowFavorited) {
        next.add(pointId);
      } else {
        next.delete(pointId);
      }
      return next;
    });

    toast.success(
      isNowFavorited ? "Ponto adicionado aos favoritos" : "Ponto removido dos favoritos"
    );
  };

  return (
    <ProtectedRoute requiredType="user">
      <div className={styles.layout}>
        <Toaster position="bottom-right" />

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            onClick={() => router.back()}
            className={styles.iconBtn}
            title="Voltar"
          >
            <ArrowLeft size={16} />
          </button>
          <div className={styles.logoBox}>
            <Recycle size={16} className={styles.logoBoxIcon} />
          </div>
          <h1 className={styles.headerTitle}>EcoPonto</h1>
        </div>

        <div className={styles.headerRight}>
          <button
            onClick={handleEnableNotifications}
            className={styles.iconBtn}
            title={notificationPermission === "granted" ? "Notificações ativadas" : "Ativar notificações"}
          >
            {notificationPermission === "granted" ? <Bell size={16} /> : <BellOff size={16} />}
          </button>
          {user && (
            <button
              onClick={() => router.push(routes.favoritos)}
              className={styles.iconBtn}
              title="Favoritos"
            >
              <Heart size={16} />
            </button>
          )}
          {user && (
            <button
              onClick={() => router.push(routes.perfilCliente)}
              className={styles.iconBtn}
              title="Meu Perfil"
            >
              <UserCircle size={16} />
            </button>
          )}
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className={`${styles.iconBtn} ${styles.mobileOnly}`}
            title={panelOpen ? "Fechar painel" : "Abrir painel"}
          >
            {panelOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <aside
          className={`${styles.sidebar} ${panelOpen ? styles.sidebarOpen : styles.sidebarClosed}`}
        >
          <div className={styles.filterHeader}>
            <div className={styles.filterHeaderRow}>
              <h2 className={styles.filterTitle}>Filtrar por material</h2>
              {filters.length > 0 && (
                <button onClick={() => setFilters([])} className={styles.clearBtn}>
                  Limpar
                </button>
              )}
            </div>

            <div className={styles.materialsGrid}>
              {ALL.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleToggleMaterial(m)}
                  className={
                    filters.includes(m)
                      ? styles.materialChipActive
                      : styles.materialChip
                  }
                >
                  <Recycle className={styles.materialChipIcon} />
                  {MATERIAL_LABELS_DATA[m]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.statusBar}>
            <span className={styles.statusText}>
              {sortedPoints.length} ponto{sortedPoints.length !== 1 ? "s" : ""}{" "}
              encontrado{sortedPoints.length !== 1 ? "s" : ""}
            </span>
            <div className={styles.accuracyInfo}>
              {geo.accuracy && (
                <span className={styles.statusText}>
                  ±{Math.round(geo.accuracy)}m
                </span>
              )}
              {!userLocation && !geo.loading && (
                <span className={styles.noLocation}>
                  <MapPin size={12} /> Localização não disponível
                </span>
              )}
              {geo.loading && (
                <span className={styles.loadingLocation}>
                  <span className={styles.spinner} /> Buscando localização...
                </span>
              )}
            </div>
          </div>

          <div className={styles.pointsList}>
            {isLoadingPoints ? (
              <div className={styles.emptyState}>
                <p>Carregando pontos de coleta...</p>
              </div>
            ) : sortedPoints.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Nenhum ponto encontrado com os filtros selecionados</p>
              </div>
            ) : (
              sortedPoints.map((point) => {
                const distance =
                  userLocation &&
                  calculateDistance(
                    userLocation[0],
                    userLocation[1],
                    point.lat,
                    point.lng
                  );

                return (
                  <PointCard
                    key={point.id || point._id}
                    point={point}
                    distance={distance || undefined}
                    hasUserLocation={!!userLocation}
                    isFavorited={favoriteIds.has(String(point._id || point.id || ""))}
                    onToggleFavorite={handleToggleFavorite}
                    onSelect={(pt) => {
                      setSelectedPoint(pt);
                      setPanelOpen(false);
                    }}
                    onRoute={(pt) => {
                      setRouteDestination(pt);
                      setPanelOpen(false);
                      toast.success(`Rota para ${pt.name || pt.nome} ativada!`);
                    }}
                  />
                );
              })
            )}
          </div>
        </aside>

        <div className={styles.mapArea}>
          <EcoMap
            points={sortedPoints}
            userLocation={userLocation}
            selectedPoint={selectedPoint}
            routeDestination={routeDestination}
            onClearRoute={() => {
              setRouteDestination(null);
              toast.info("Rota limpa");
            }}
          />
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
