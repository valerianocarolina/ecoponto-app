import { CollectionPoint } from "@/data/collectionPoints";

const FAVORITES_KEY_PREFIX = "ecoponto:favorites";

function getPointId(point: Pick<CollectionPoint, "_id" | "id">): string {
  return String(point._id || point.id || "");
}

function getStorageKey(userKey: string) {
  return `${FAVORITES_KEY_PREFIX}:${userKey}`;
}

export function getFavorites(userKey: string): CollectionPoint[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(getStorageKey(userKey));
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getFavoriteIds(userKey: string): Set<string> {
  return new Set(
    getFavorites(userKey)
      .map((point) => getPointId(point))
      .filter(Boolean)
  );
}

function saveFavorites(userKey: string, favorites: CollectionPoint[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(userKey), JSON.stringify(favorites));
}

export function toggleFavoritePoint(userKey: string, point: CollectionPoint): boolean {
  const pointId = getPointId(point);
  if (!pointId) return false;

  const current = getFavorites(userKey);
  const exists = current.some((item) => getPointId(item) === pointId);

  if (exists) {
    saveFavorites(
      userKey,
      current.filter((item) => getPointId(item) !== pointId)
    );
    return false;
  }

  saveFavorites(userKey, [point, ...current]);
  return true;
}

export function removeFavorite(userKey: string, pointId: string) {
  const current = getFavorites(userKey);
  saveFavorites(
    userKey,
    current.filter((item) => getPointId(item) !== pointId)
  );
}
