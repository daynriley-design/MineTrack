import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ne pas forcer un rechargement complet de la page pour éviter une boucle infinie
    // lorsque le composant App ou AuthContext vérifie l'état de la session au démarrage.
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ─── Dashboard ───────────────────────────────────────────────────────────
export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats'),
  charts: () => api.get('/dashboard/charts'),
};

// ─── Module factories ─────────────────────────────────────────────────────
const makeModule = (path) => ({
  list: () => api.get(`/${path}`),
  create: (data) => api.post(`/${path}`, data),
  get: (id) => api.get(`/${path}/${id}`),
  delete: (id) => api.delete(`/${path}/${id}`),
});

export const pegsAPI = {
  list: () => api.get('/pegs'),
  create: (data) => api.post('/pegs', data),
  get: (id) => api.get(`/pegs/${id}`),
  update: (id, data) => api.put(`/pegs/${id}`, data),
  delete: (id) => api.delete(`/pegs/${id}`),
};

export const workProgressAPI   = makeModule('work-progress');
export const drillingAPI       = makeModule('drilling');
export const blastingAPI       = makeModule('blasting');
export const productionAPI     = makeModule('production');
export const equipmentAPI      = makeModule('equipment');
export const laborAPI          = makeModule('labor');
export const hseAPI            = makeModule('hse');
export const geologyAPI        = makeModule('geology');
export const supportAPI        = makeModule('support');
export const financialAPI      = makeModule('financial');

export const reportsAPI = {
  summary: () => api.get('/reports/summary'),
};

// ─── New 3-Apps API Modules ───────────────────────────────────────────────
export const pegAdvancesAPI    = makeModule('peg-advances');
export const incidentsAPI      = makeModule('incidents');
export const hseChecklistsAPI  = makeModule('hse-checklists');
export const equipmentPannesAPI= makeModule('equipment-pannes');
export const miniReportsAPI    = makeModule('mini-reports');

export const supervisorAPI = {
  alerts: () => api.get('/supervisor/alerts'),
};

export const syncAPI = {
  syncData: (payloads) => api.post('/sync', payloads),
};

