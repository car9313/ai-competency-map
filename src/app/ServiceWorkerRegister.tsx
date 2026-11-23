'use client';

import { useEffect } from 'react';

/**
 * Registra el service worker.
 *
 * Solo en producción: en desarrollo el servidor recarga los módulos por su cuenta y una
 * caché intermedia convierte cada cambio en «no veo lo que acabo de escribir».
 *
 * Se registra al cargar la página y sin bloquear: el worker mejora la segunda visita, no
 * la primera, así que no debe competir con nada.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    void (async () => {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch {
        // Sin service worker la app funciona igual: solo pierde el modo sin conexión.
      }
    })();
  }, []);

  return null;
}
