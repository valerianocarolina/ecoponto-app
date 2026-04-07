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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import {
  CollectionPoint,
  MATERIAL_LABELS_DATA,
  transformApiPoint,
} from "@/data/collectionPoints";
import { MaterialType } from "@/util/materials";
import { useGeolocation } from "@/hooks/useGeolocation";
import { getAllCollectionPoints } from "@/services/points";
import { EcoMap } from "@/components/EcoMap/EcoMap";
import { PointCard } from "@/components/PointCard/PointCard";
import styles from "./styles.module.css";

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
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [filters, setFilters] = useState<MaterialType[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);
  const [routeDestination, setRouteDestination] = useState<CollectionPoint | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [simulatedPosition, setSimulatedPosition] = useState<[number, number] | null>(null);
  const [locationToastShown, setLocationToastShown] = useState(false);

  useEffect(() => {
    async function loadPoints() {
      try {
        setIsLoadingPoints(true);
        const apiPoints = await getAllCollectionPoints();

        if (apiPoints && apiPoints.length > 0) {
          const transformed = apiPoints.map(transformApiPoint);
          setPoints(transformed);
        }
      } catch (error) {
        toast.error("Usando dados offline");
      } finally {
        setIsLoadingPoints(false);
      }
    }

    loadPoints();
  }, []);

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
    if (!routeDestination || !geo.position) {
      setSimulatedPosition(null);
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
      return;
    }

    const startLat = geo.position[0];
    const startLng = geo.position[1];
    const endLat = routeDestination.lat;
    const endLng = routeDestination.lng;

    let step = 0;
    const totalSteps = 50;

    simulationIntervalRef.current = setInterval(() => {
      step += 1;
      const progress = step / totalSteps;

      if (progress >= 1) {
        setSimulatedPosition(null);
        clearInterval(simulationIntervalRef.current!);
        toast.success("🎉 Você chegou ao ponto de coleta!");
        return;
      }

      const lat = startLat + (endLat - startLat) * progress;
      const lng = startLng + (endLng - startLng) * progress;

      setSimulatedPosition([lat, lng]);
    }, 500);

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [routeDestination, geo.position]);

  const filteredPoints = useMemo(() => {
    if (filters.length === 0) return points;
    return points.filter((p) => {
      const materials = p.materials || p.tags || [];
      return filters.some((f) => materials.includes(f));
    });
  }, [points, filters]);

  const userLocation = simulatedPosition || geo.position;

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

  return (
    <div className={styles.layout}>
      <Toaster position="top-right" />

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
          {notificationPermission !== "granted" && (
            <button
              onClick={handleEnableNotifications}
              className={styles.iconBtn}
              title="Ativar notificações"
            >
              <Bell size={16} />
            </button>
          )}
          <button
            onClick={() => router.push("/cliente/perfil")}
            className={styles.iconBtn}
            title="Meu Perfil"
          >
            <UserCircle size={16} />
          </button>
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
              {sortedPoints.length} ponto{sortedPoints.length !== 1 ? "styles" : ""}{" "}
              encontrado{sortedPoints.length !== 1 ? "styles" : ""}
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
                    isFavorited={false}
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
  );
}
