import { createContext, useContext, useState, useEffect } from 'react';

const SharedDataContext = createContext(null);

export function SharedDataProvider({ children }) {
  // Try to load from localStorage, otherwise use default mock data
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('minetrack_shared_data');
    if (saved) return JSON.parse(saved);
    return {
      hseDeclarations: [
        { id: 'HSE-001', date: '17/06/2026 07:30', author: 'Jean-Pierre M.', peg: '10L-XC5SS', status: 'En attente' }
      ],
      geologistReports: [],
      incidents: []
    };
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('minetrack_shared_data', JSON.stringify(data));
  }, [data]);

  const addHSEDeclaration = (declaration) => {
    setData(prev => ({
      ...prev,
      hseDeclarations: [declaration, ...prev.hseDeclarations]
    }));
  };

  const approveHSEDeclaration = (id) => {
    setData(prev => ({
      ...prev,
      hseDeclarations: prev.hseDeclarations.filter(d => d.id !== id)
    }));
  };

  const addGeologistReport = (report) => {
    setData(prev => ({
      ...prev,
      geologistReports: [report, ...prev.geologistReports]
    }));
  };

  return (
    <SharedDataContext.Provider value={{ data, addHSEDeclaration, approveHSEDeclaration, addGeologistReport }}>
      {children}
    </SharedDataContext.Provider>
  );
}

export function useSharedData() {
  return useContext(SharedDataContext);
}
