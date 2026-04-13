"use client";

import { MapPin, Clock, Navigation, Heart } from "lucide-react";
import type { CollectionPoint } from "@/data/collectionPoints";
import { formatHours } from "@/util/formatHours";
import { MaterialType, MATERIAL_LABELS, MATERIAL_COLORS } from "@/util/materials";
import { toast } from "sonner";
import s from "./PointCard.module.css";

interface PointCardProps {
  point: CollectionPoint;
  distance?: number;
  onSelect: (point: CollectionPoint) => void;
  onRoute?: (point: CollectionPoint) => void;
  hasUserLocation?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: (point: CollectionPoint) => void;
}

export function PointCard({
  point,
  distance,
  onSelect,
  onRoute,
  hasUserLocation,
  isFavorited,
  onToggleFavorite,
}: PointCardProps) {
  const materials = point.materials || point.tags || [];
  const name = point.name || point.nome || "Ponto sem nome";
  const address = point.address || point.endereco || "";
  const hours = formatHours(point.hours || point.horario || "");
  const imageUrl = point.imageUrl || point.imagem;

  return (
    <button onClick={() => onSelect(point)} className={s.card}>
      <img
        src={imageUrl || "/default-point.jpg"}
        alt={name}
        className={s.image}
        loading="lazy"
      />
      <div className={s.body}>
        <h3 className={s.name}>{name}</h3>
        <p className={s.infoRow}>
          <MapPin className={s.infoIcon} /> {address}
        </p>
        <p className={s.infoRow}>
          <Clock className={s.infoIcon} /> {hours}
        </p>
        {distance !== undefined && (
          <p className={s.distance}>
            {distance < 1
              ? `${Math.round(distance * 1000)}m`
              : `${distance.toFixed(1)}km`}
          </p>
        )}
        <div className={s.badges}>
          {materials.map((m) => (
            <span
              key={m}
              className={`${s.materialBadge} ${s[MATERIAL_COLORS[m as MaterialType]]}`}
              title={MATERIAL_LABELS[m as MaterialType]}
            >
              {MATERIAL_LABELS[m as MaterialType]}
            </span>
          ))}
        </div>
        <div className={s.actions}>
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!hasUserLocation) {
                toast.error(
                  "Ative a localização no navegador para traçar a rota."
                );
                return;
              }
              onRoute?.(point);
            }}
            className={s.routeBtn}
          >
            <Navigation size={12} /> Traçar rota
          </span>
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(point);
              }}
              className={`${s.favoriteBtn} ${isFavorited ? s.favorited : ""}`}
              title={
                isFavorited
                  ? "Remover dos favoritos"
                  : "Adicionar aos favoritos"
              }
            >
              <Heart
                size={16}
                style={{
                  fill: isFavorited ? "currentColor" : "none",
                }}
              />
            </button>
          )}
        </div>
      </div>
    </button>
  );
}
