"use client";

import { useEffect, useRef, useState } from "react";
import { CollectionPoint, MATERIAL_LABELS_DATA } from "@/data/collectionPoints";
import { formatHours } from "@/util/formatHours";
import styles from "./EcoMap.module.css";
import "leaflet/dist/leaflet.css";

interface EcoMapProps {
  points: CollectionPoint[];
  userLocation: [number, number] | null;
  selectedPoint: CollectionPoint | null;
  routeDestination: CollectionPoint | null;
  onClearRoute?: () => void;
}

export function EcoMap({
  points,
  userLocation,
  selectedPoint,
  routeDestination,
  onClearRoute,
}: EcoMapProps) {
  const mapRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any | null>(null);
  const userMarkerRef = useRef<any | null>(null);
  const routeLayerRef = useRef<any | null>(null);
  const initialFlyDone = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const defaultCenter: [number, number] = [-23.5615, -46.6559];
  const LRef = useRef<any>(null);
  const userIconRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    import("leaflet").then((L) => {
      LRef.current = L.default;

      delete (L.default.Icon.Default.prototype as any)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      userIconRef.current = new L.default.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !isReady || !LRef.current) return;

    const L = LRef.current;
    const map = L.map(containerRef.current, { zoomControl: false }).setView(
      userLocation || defaultCenter,
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [isReady]);

  useEffect(() => {
    if (mapRef.current && userLocation && !initialFlyDone.current) {
      mapRef.current.flyTo(userLocation, 14, { duration: 1.2 });
      initialFlyDone.current = true;
    }
  }, [userLocation]);

  useEffect(() => {
    if (!mapRef.current || !LRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const L = LRef.current;
      userMarkerRef.current = L.marker(userLocation, {
        icon: userIconRef.current,
      })
        .addTo(mapRef.current)
        .bindPopup("📍 Sua localização");
    }
  }, [userLocation]);

  useEffect(() => {
    if (!markersRef.current || !LRef.current) return;

    const L = LRef.current;
    markersRef.current.clearLayers();

    points.forEach((p) => {
      if (!p.lat || !p.lng || isNaN(p.lat) || isNaN(p.lng)) return;

      const materials = p.materials || p.tags || [];
      const materialsText = materials
        .map((m) => MATERIAL_LABELS_DATA[m])
        .join(", ");
      const popup = `<div style="min-width: 180px"><strong>${p.name || p.nome}</strong><br/><span style="font-size: 12px">${p.address || p.endereco}</span><br/><span style="font-size: 12px">${formatHours(p.hours || p.horario)}</span><br/><span style="font-size: 12px; font-weight: 500">${materialsText}</span></div>`;

      L.marker([p.lat, p.lng]).bindPopup(popup).addTo(markersRef.current!);
    });
  }, [points]);

  useEffect(() => {
    if (mapRef.current && selectedPoint) {
      mapRef.current.flyTo([selectedPoint.lat, selectedPoint.lng], 16, {
        duration: 0.8,
      });
    }
  }, [selectedPoint]);

  useEffect(() => {
    if (!mapRef.current || !LRef.current) return;

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (!routeDestination || !userLocation) return;

    const L = LRef.current;
    const [lat1, lng1] = userLocation;
    const { lat: lat2, lng: lng2 } = routeDestination;

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.routes?.[0] || !mapRef.current) return;

        const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]] as [number, number]
        );

        routeLayerRef.current = L.polyline(coords, {
          color: "hsl(142, 76%, 36%)",
          weight: 5,
          opacity: 0.8,
        }).addTo(mapRef.current);

        mapRef.current.fitBounds(routeLayerRef.current.getBounds(), {
          padding: [50, 50],
        });
      })
      .catch(() => {});
  }, [routeDestination, userLocation]);

  return (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.map} />
      {routeDestination && (
        <button onClick={onClearRoute} className={styles.clearRoute}>
          ✕ Limpar rota
        </button>
      )}
    </div>
  );
}
