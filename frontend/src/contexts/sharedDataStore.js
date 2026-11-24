import { createContext, useContext } from 'react';

// Objet de contexte et hook, separes du Provider (SharedDataContext.jsx)
// pour que le fast refresh de Vite fonctionne (react-refresh/only-export-components).
export const SharedDataContext = createContext(null);

export function useSharedData() {
  return useContext(SharedDataContext);
}
