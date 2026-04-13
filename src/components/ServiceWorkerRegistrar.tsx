"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/services/push";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
