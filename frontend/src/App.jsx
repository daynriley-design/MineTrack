import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SharedDataProvider } from './contexts/SharedDataContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import Layout from './components/Layout'; // Admin Layout
import MinerLayout from './components/miner/MinerLayout';
import SupervisorLayout from './components/supervisor/SupervisorLayout';
import GeologistLayout from './components/geologist/GeologistLayout';

// Public Pages
import LoginPage from './pages/LoginPage';

// Admin Pages (Existing)
import DashboardPage from './pages/DashboardPage';
import PegsPage from './pages/PegsPage';
import WorkProgressPage from './pages/WorkProgressPage';
import DrillingPage from './pages/DrillingPage';
import BlastingPage from './pages/BlastingPage';
import ProductionPage from './pages/ProductionPage';
import EquipmentPage from './pages/EquipmentPage';
import LaborPage from './pages/LaborPage';
import HSEPage from './pages/HSEPage';
import GeologyPage from './pages/GeologyPage';
import SupportPage from './pages/SupportPage';
import FinancialPage from './pages/FinancialPage';
import ReportsPage from './pages/ReportsPage';

// Miner Pages
import MinerDashboard from './pages/miner/MinerDashboard';
import MinerPegs from './pages/miner/MinerPegs';
import MinerHSE from './pages/miner/MinerHSE';
import MinerIncident from './pages/miner/MinerIncident';
import MinerProduction from './pages/miner/MinerProduction';
import MinerEquipment from './pages/miner/MinerEquipment';
import MinerReport from './pages/miner/MinerReport';

// Supervisor Pages
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import SupervisorAlerts from './pages/supervisor/SupervisorAlerts';
import SupervisorMap from './pages/supervisor/SupervisorMap';
import SupervisorHSEValidation from './pages/supervisor/SupervisorHSEValidation';
import SupervisorReports from './pages/supervisor/SupervisorReports';
import SupervisorERP from './pages/supervisor/SupervisorERP';
import SupervisorStocks from './pages/supervisor/SupervisorStocks';
import SupervisorUsers from './pages/supervisor/SupervisorUsers';
import SupervisorProfile from './pages/supervisor/SupervisorProfile';

// Geologist Pages
import GeologistDashboard from './pages/geologist/GeologistDashboard';
import GeologistSamples from './pages/geologist/GeologistSamples';
import GeologistGeotech from './pages/geologist/GeologistGeotech';
import GeologistMap from './pages/geologist/GeologistMap';
import GeologistReport from './pages/geologist/GeologistReport';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SharedDataProvider>
          <ToastProvider>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />

              {/* Default Route handles redirection via ProtectedRoute */}
              <Route path="/" element={<ProtectedRoute />} />

              {/* MINER APP */}
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

              {/* SUPERVISOR APP */}
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
                <Route path="erp" element={<SupervisorERP />} />
                <Route path="stocks" element={<SupervisorStocks />} />
                <Route path="users" element={<SupervisorUsers />} />
                <Route path="profile" element={<SupervisorProfile />} />
              </Route>

              {/* GEOLOGIST APP */}
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
              </Route>

              {/* ADMIN APP (Original) */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
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

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </SharedDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
