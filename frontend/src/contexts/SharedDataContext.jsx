import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { SharedDataContext } from './sharedDataStore';

const STORAGE_KEY = 'minetrack_shared_data';
const DEFAULT_DATA = {
  hseDeclarations: [
    { id: 'HSE-001', date: '17/06/2026 07:30', author: 'Jean-Pierre M.', peg: '10L-XC5SS', status: 'En attente' }
  ],
  geologistReports: [],
  incidents: []
};

export function SharedDataProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_DATA;
    } catch {
      return DEFAULT_DATA;
    }
  });

  // PERF: écriture localStorage débattue (debounce) — évite de sérialiser
  // et écrire sur disque à chaque frappe/mise à jour rapide successive.
  const writeTimer = useRef(null);
  useEffect(() => {
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // quota dépassé ou storage indisponible: on ignore silencieusement
      }
    }, 300);
    return () => clearTimeout(writeTimer.current);
  }, [data]);

  // PERF: handlers stables (useCallback) — ne changent pas d'identité à
  // chaque render, donc les composants enfants qui les reçoivent en props
  // ne re-rendent pas inutilement (utile avec React.memo en aval).
  const addHSEDeclaration = useCallback((declaration) => {
    setData(prev => ({ ...prev, hseDeclarations: [declaration, ...prev.hseDeclarations] }));
  }, []);

  const approveHSEDeclaration = useCallback((id) => {
    setData(prev => ({ ...prev, hseDeclarations: prev.hseDeclarations.filter(d => d.id !== id) }));
  }, []);

  const addGeologistReport = useCallback((report) => {
    setData(prev => ({ ...prev, geologistReports: [report, ...prev.geologistReports] }));
  }, []);

  // PERF: value mémoïsée — sans ça, un nouvel objet littéral est créé à
  // CHAQUE render du Provider, ce qui force TOUS les consumers (useSharedData)
  // à re-render même quand `data` n'a pas changé.
  const value = useMemo(
    () => ({ data, addHSEDeclaration, approveHSEDeclaration, addGeologistReport }),
    [data, addHSEDeclaration, approveHSEDeclaration, addGeologistReport]
  );

  return (
    <SharedDataContext.Provider value={value}>
      {children}
    </SharedDataContext.Provider>
  );
}

