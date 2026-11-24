import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'
import { initAnalytics } from './utils/analytics'

// Google Analytics : ne fait rien si VITE_GA_MEASUREMENT_ID n'est pas defini.
initAnalytics()

// Mode offline réel : cache l'app shell pour un chargement sans réseau après la 1ère visite.
// IMPORTANT : un nouveau SW (nouvelle version déployée) doit recharger la page tout seul,
// sinon un onglet resté ouvert continue d'afficher l'ancien JS indéfiniment (piège vécu :
// écran de login obsolète qui "ne change jamais" malgré les mises à jour du code).
if ('serviceWorker' in navigator) {
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Vérifie une éventuelle nouvelle version à chaque chargement de page.
      reg.update().catch(() => {});
    }).catch(() => {
      // Échec silencieux : l'app fonctionne quand même en ligne sans le SW.
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
