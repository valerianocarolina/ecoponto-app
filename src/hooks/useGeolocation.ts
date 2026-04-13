"use client";

import { useEffect, useState, useRef } from "react";

interface GeolocationState {
  position: [number, number] | null;
  loading: boolean;
  error: string | null;
  accuracy: number | null;
  hasPermission: boolean;
  heading?: number;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    loading: false,
    error: null,
    accuracy: null,
    hasPermission: false,
    heading: undefined,
  });

  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocalização não suportada pelo navegador",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, heading } = position.coords;
        setState({
          position: [latitude, longitude],
          loading: false,
          error: null,
          accuracy,
          heading: heading ?? undefined,
          hasPermission: true,
        });
      },
      (error) => {
        let errorMessage = "Erro ao obter localização";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Permissão de localização negada";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Localização não disponível";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Timeout na obtenção de localização";
        }
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          hasPermission: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return state;
}
