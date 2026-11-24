import axios from 'axios';
import { enqueueRequest } from './utils/offlineQueue';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const MUTATING_METHODS = ['post', 'put', 'patch', 'delete'];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const method = (config.method || '').toLowerCase();
    // Pas de réponse du tout = vraie coupure réseau (pas une erreur 4xx/5xx du serveur).
    const isNetworkFailure = !error.response;

    const isAuthEndpoint = (config.url || '').includes('/auth/');

    if (isNetworkFailure && MUTATING_METHODS.includes(method) && !isAuthEndpoint) {
      try {
        const data = config.data ? JSON.parse(config.data) : {};
        await enqueueRequest({ method, url: config.url, data });
        window.dispatchEvent(new CustomEvent('minetrack:offline-queued'));
        // On résout comme si la requête avait réussi : l'écran ne bloque pas le mineur/géologue
        // sur le terrain. La synchronisation réelle se fait dès que la connexion revient.
        return Promise.resolve({
          data: { ...data, id: `offline-${Date.now()}`, _offline_queued: true },
          status: 202,
          statusText: 'Queued Offline',
          headers: {},
          config,
        });
      } catch {
        return Promise.reject(error);
      }
    }
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
export const ptoAPI            = makeModule('pto');
export const faceExaminationsAPI = makeModule('face-examinations');
export const groundSupportAPI  = makeModule('ground-support');

export const supervisorAPI = {
  alerts: () => api.get('/supervisor/alerts'),
};

export const syncAPI = {
  syncData: (payloads) => api.post('/sync', payloads),
};

