/** Fait defiler jusqu'a un element et met le focus sur son premier champ
 *  (bouton d'action orange des pages a formulaire unique). */
export const scrollToId = (id) => () => {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const field = el.querySelector('input, select, textarea');
  if (field) setTimeout(() => field.focus({ preventScroll: true }), 350);
};
