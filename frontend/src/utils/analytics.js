/**
 * Google Analytics 4 (gtag.js).
 *
 * Active uniquement si VITE_GA_MEASUREMENT_ID (ex. « G-XXXXXXXXXX ») est
 * defini au moment du build (Vercel : variable d'environnement du projet).
 * Sans identifiant, rien n'est charge.
 *
 * - Pages vues : gerees par la « mesure amelioree » du flux GA (historique).
 * - Aucune donnee personnelle : pas d'email ni de nom ; signaux Google et
 *   personnalisation publicitaire desactives.
 */
const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
let started = false;

export const analyticsEnabled = () => /^G-[A-Z0-9]+$/i.test(GA_ID);

export function initAnalytics() {
  if (started || !analyticsEnabled() || typeof window === 'undefined') return;
  started = true;
  window.dataLayer = window.dataLayer || [];
  // gtag attend l'objet « arguments » tel quel (format officiel de Google).
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  // Pages vues : page d'arrivee + changements de route comptes par GA lui-meme
  // (« mesure amelioree » du flux Web, evenements d'historique du navigateur).
  window.gtag('config', GA_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
}

/** Evenement metier optionnel (ex. trackEvent('report_pdf', { kind: 'weekly' })). */
export function trackEvent(name, params = {}) {
  if (!started || !window.gtag) return;
  window.gtag('event', name, params);
}
