import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SharedDataProvider } from './contexts/SharedDataContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts chargés eagerly (utilisés à chaque navigation dans leur zone, petits)
import Layout from './components/Layout';
import MinerLayout from './components/miner/MinerLayout';
import SupervisorLayout from './components/supervisor/SupervisorLayout';
import GeologistLayout from './components/geologist/GeologistLayout';

// PERF: pages en lazy import — chaque page = son propre chunk JS,
// téléchargé seulement à la navigation vers cette route. Sur 35 pages,
// évite de faire télécharger/parser tout l'admin+miner+supervisor+geologist
// à un opérateur qui ne visite que 6 écrans miner.
import LoginPage from './pages/LoginPage'; // route d'entrée: reste eager

const DashboardPage    = lazy(() => import('./pages/DashboardPage'));
const AdminOperations   = lazy(() => import('./pages/admin/AdminOperations'));
const ManagementReports = lazy(() => import('./pages/management/ManagementReports'));
const LogistiqueDashboard = lazy(() => import('./pages/logistique/LogistiqueDashboard'));
const SupportDashboard    = lazy(() => import('./pages/support/SupportDashboard'));
const PegsPage         = lazy(() => import('./pages/PegsPage'));
const WorkProgressPage = lazy(() => import('./pages/WorkProgressPage'));
const DrillingPage     = lazy(() => import('./pages/DrillingPage'));
const BlastingPage     = lazy(() => import('./pages/BlastingPage'));
const ProductionPage   = lazy(() => import('./pages/ProductionPage'));
const EquipmentPage    = lazy(() => import('./pages/EquipmentPage'));
const LaborPage        = lazy(() => import('./pages/LaborPage'));
const HSEPage          = lazy(() => import('./pages/HSEPage'));
const GeologyPage      = lazy(() => import('./pages/GeologyPage'));
const SupportPage      = lazy(() => import('./pages/SupportPage'));
const FinancialPage    = lazy(() => import('./pages/FinancialPage'));
const ReportsPage      = lazy(() => import('./pages/ReportsPage'));

const MinerDashboard  = lazy(() => import('./pages/miner/MinerDashboard'));
const MinerPegs       = lazy(() => import('./pages/miner/MinerPegs'));
const MinerHSE        = lazy(() => import('./pages/miner/MinerHSE'));
const MinerIncident   = lazy(() => import('./pages/miner/MinerIncident'));
const MinerProduction = lazy(() => import('./pages/miner/MinerProduction'));
const MinerEquipment  = lazy(() => import('./pages/miner/MinerEquipment'));
const MinerReport     = lazy(() => import('./pages/miner/MinerReport'));

const SupervisorDashboard      = lazy(() => import('./pages/supervisor/SupervisorDashboard'));
const SupervisorAlerts         = lazy(() => import('./pages/supervisor/SupervisorAlerts'));
const SupervisorMap            = lazy(() => import('./pages/supervisor/SupervisorMap'));
const SupervisorHSEValidation  = lazy(() => import('./pages/supervisor/SupervisorHSEValidation'));
const SupervisorReports        = lazy(() => import('./pages/supervisor/SupervisorReports'));
const SupervisorShiftReports   = lazy(() => import('./pages/supervisor/SupervisorShiftReports'));
const SupervisorERP            = lazy(() => import('./pages/supervisor/SupervisorERP'));
const SupervisorStocks         = lazy(() => import('./pages/supervisor/SupervisorStocks'));
const SupervisorUsers          = lazy(() => import('./pages/supervisor/SupervisorUsers'));
const SupervisorProfile        = lazy(() => import('./pages/supervisor/SupervisorProfile'));

const GeologistDashboard = lazy(() => import('./pages/geologist/GeologistDashboard'));
const GeologistSamples   = lazy(() => import('./pages/geologist/GeologistSamples'));
const GeologistGeotech   = lazy(() => import('./pages/geologist/GeologistGeotech'));
const GeologistMap       = lazy(() => import('./pages/geologist/GeologistMap'));
const GeologistReport    = lazy(() => import('./pages/geologist/GeologistReport'));
const GeologistProfile   = lazy(() => import('./pages/geologist/GeologistProfile'));
const GeologistFaceExam  = lazy(() => import('./pages/geologist/GeologistFaceExam'));

function RouteFallback() {
  return <div style={{ padding: '2rem', opacity: 0.6 }}>Chargement…</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SharedDataProvider>
          <ToastProvider>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedRoute />} />

                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/admin/operations" replace />} />
                  <Route path="operations"    element={<AdminOperations />} />
                  <Route path="dashboard"     element={<DashboardPage />} />
                  <Route path="pegs"          element={<PegsPage />} />
                  <Route path="work-progress" element={<WorkProgressPage />} />
                  <Route path="drilling"      element={<DrillingPage />} />
                  <Route path="blasting"      element={<BlastingPage />} />
                  <Route path="production"    element={<ProductionPage />} />
                  <Route path="equipment"     element={<EquipmentPage />} />
                  <Route path="labor"         element={<LaborPage />} />
                  <Route path="hse"           element={<HSEPage />} />
                  <Route path="geology"       element={<GeologyPage />} />
                  <Route path="support"       element={<SupportPage />} />
                  <Route path="financial"     element={<FinancialPage />} />
                  <Route path="reports"       element={<ReportsPage />} />
                </Route>

                <Route path="/management" element={
                  <ProtectedRoute allowedRoles={['management', 'admin']}>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/management/reports" replace />} />
                  <Route path="reports" element={<ManagementReports />} />
                </Route>

                {/* Logistique et Support technique : comptes et redirections en place,
                    écrans métier en attente des spécifications du client (cf. handoff). */}
                <Route path="/logistique/dashboard" element={
                  <ProtectedRoute allowedRoles={['logistique', 'admin']}>
                    <LogistiqueDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/logistique" element={<Navigate to="/logistique/dashboard" replace />} />

                <Route path="/support/dashboard" element={
                  <ProtectedRoute allowedRoles={['support', 'admin']}>
                    <SupportDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/support" element={<Navigate to="/support/dashboard" replace />} />

                <Route path="/miner" element={
                  <ProtectedRoute allowedRoles={['operator']}>
                    <MinerLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/miner/dashboard" replace />} />
                  <Route path="dashboard" element={<MinerDashboard />} />
                  <Route path="pegs" element={<MinerPegs />} />
                  <Route path="hse" element={<MinerHSE />} />
                  <Route path="incident" element={<MinerIncident />} />
                  <Route path="production" element={<MinerProduction />} />
                  <Route path="equipment" element={<MinerEquipment />} />
                  <Route path="report" element={<MinerReport />} />
                </Route>

                <Route path="/supervisor" element={
                  <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
                    <SupervisorLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/supervisor/dashboard" replace />} />
                  <Route path="dashboard" element={<SupervisorDashboard />} />
                  <Route path="alerts" element={<SupervisorAlerts />} />
                  <Route path="map" element={<SupervisorMap />} />
                  <Route path="hse-validation" element={<SupervisorHSEValidation />} />
                  <Route path="reports" element={<SupervisorReports />} />
                  <Route path="shift-reports" element={<SupervisorShiftReports />} />
                  <Route path="erp" element={<SupervisorERP />} />
                  <Route path="stocks" element={<SupervisorStocks />} />
                  <Route path="users" element={<SupervisorUsers />} />
                  <Route path="profile" element={<SupervisorProfile />} />
                </Route>

                <Route path="/geologist" element={
                  <ProtectedRoute allowedRoles={['geologist', 'admin']}>
                    <GeologistLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/geologist/dashboard" replace />} />
                  <Route path="dashboard" element={<GeologistDashboard />} />
                  <Route path="samples" element={<GeologistSamples />} />
                  <Route path="geotech" element={<GeologistGeotech />} />
                  <Route path="map" element={<GeologistMap />} />
                  <Route path="report" element={<GeologistReport />} />
                  <Route path="profile" element={<GeologistProfile />} />
                  <Route path="face-exam" element={<GeologistFaceExam />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ToastProvider>
        </SharedDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
