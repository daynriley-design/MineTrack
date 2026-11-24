import api from '../api';
import { getQueue, removeFromQueue } from './offlineQueue';

let syncing = false;

export async function syncOfflineQueue() {
  if (syncing || !navigator.onLine) return { synced: 0, failed: 0 };
  syncing = true;
  let synced = 0;
  let failed = 0;
  try {
    const queue = await getQueue();
    for (const item of queue) {
      try {
        await api.request({ method: item.method, url: item.url, data: item.data });
        await removeFromQueue(item.id);
        synced++;
      } catch {
        // Erreur serveur (ex: 400/401) : on laisse en file, ce n'est pas un problème réseau.
        // Une vraie coupure réseau fera échouer toute la boucle silencieusement (fetch rejette).
        failed++;
      }
    }
  } finally {
    syncing = false;
  }
  if (synced > 0) {
    window.dispatchEvent(new CustomEvent('minetrack:offline-synced', { detail: { synced, failed } }));
  }
  return { synced, failed };
}

export function initOfflineSync() {
  window.addEventListener('online', () => { syncOfflineQueue(); });
  // Tentative périodique (utile si l'event 'online' du navigateur est peu fiable sur le site)
  setInterval(() => {
    if (navigator.onLine) syncOfflineQueue();
  }, 30000);
  // Tentative immédiate au chargement si déjà en ligne
  if (navigator.onLine) syncOfflineQueue();
}
