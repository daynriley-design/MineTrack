import { useState, useEffect, useCallback } from 'react';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { getQueueCount } from '../utils/offlineQueue';
import { syncOfflineQueue, initOfflineSync } from '../utils/offlineSync';

let syncInitialized = false;

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(0);
  const [justSynced, setJustSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const refreshCount = useCallback(() => {
    getQueueCount().then(setPending).catch(() => {});
  }, []);

  useEffect(() => {
    if (!syncInitialized) {
      initOfflineSync();
      syncInitialized = true;
    }
    refreshCount();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleQueued = () => refreshCount();
    const handleSynced = () => {
      refreshCount();
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 4000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('minetrack:offline-queued', handleQueued);
    window.addEventListener('minetrack:offline-synced', handleSynced);
    const poll = setInterval(refreshCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('minetrack:offline-queued', handleQueued);
      window.removeEventListener('minetrack:offline-synced', handleSynced);
      clearInterval(poll);
    };
  }, [refreshCount]);

  const handleManualSync = async () => {
    setSyncing(true);
    await syncOfflineQueue();
    refreshCount();
    setSyncing(false);
  };

  if (isOnline && pending === 0 && !justSynced) return null;

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '0.6rem', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600,
      background: !isOnline ? 'rgba(239,68,68,0.15)' : justSynced ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
      borderBottom: `1px solid ${!isOnline ? 'rgba(239,68,68,0.4)' : justSynced ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`,
      color: !isOnline ? '#f87171' : justSynced ? '#34d399' : '#fbbf24',
    }}>
      {!isOnline ? (
        <>
          <WifiOff size={14} />
          <span>Hors ligne — {pending > 0 ? `${pending} donnée(s) en attente de synchronisation` : 'les nouvelles saisies seront synchronisées au retour du réseau'}</span>
        </>
      ) : justSynced ? (
        <>
          <CheckCircle size={14} />
          <span>Synchronisation terminée</span>
        </>
      ) : (
        <>
          <RefreshCw size={14} className={syncing ? 'spin' : ''} />
          <span>{pending} donnée(s) en attente de synchronisation</span>
          <button onClick={handleManualSync} disabled={syncing} style={{ marginLeft: '0.5rem', background: 'rgba(17,18,20,0.15)', border: 'none', borderRadius: '4px', padding: '0.15rem 0.6rem', color: 'inherit', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}>
            {syncing ? '...' : 'Synchroniser'}
          </button>
        </>
      )}
    </div>
  );
}
