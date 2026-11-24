import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Eye, House, AlertTriangle, Map, ShieldCheck, FileText, ClipboardList,
  CircleDollarSign, Package, Users, User, ClipboardPlus,
} from 'lucide-react';
import api, { supervisorAPI } from '../../api';
import AppShell from '../AppShell';

export default function SupervisorLayout() {
  const [alertCount, setAlertCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => {
    supervisorAPI.alerts()
      .then(({ data }) => setAlertCount((data?.incidents?.length || 0) + (data?.pannes?.length || 0)))
      .catch(() => {});
  }, []);

  // Demandes de compte a valider (recalcule a chaque changement de page).
  useEffect(() => {
    api.get('/supervisor/users')
      .then(({ data }) => setPendingCount((Array.isArray(data) ? data : []).filter((u) => u.status === 'pending').length))
      .catch(() => {});
  }, [pathname]);

  const links = [
    { to: '/supervisor/dashboard', label: 'Accueil', icon: House },
    { to: '/supervisor/alerts', label: 'Alertes', icon: AlertTriangle, count: alertCount },
    { to: '/supervisor/map', label: 'Carte interactive', icon: Map },
    { to: '/supervisor/hse-validation', label: 'Validation HSE', icon: ShieldCheck },
    { to: '/supervisor/reports', label: 'Rapports', icon: FileText },
    { to: '/supervisor/shift-reports', label: 'Rapports de shift', icon: ClipboardList },
    { to: '/supervisor/erp', label: 'ERP / Finances', icon: CircleDollarSign },
    { to: '/supervisor/stocks', label: 'Gestion stocks', icon: Package },
    { to: '/supervisor/users', label: 'Utilisateurs', icon: Users, count: pendingCount },
    { to: '/supervisor/profile', label: 'Profil', icon: User },
  ];

  return (
    <AppShell
      brandIcon={Eye}
      roleLabel="Supervision"
      links={links}
      dock={[links[0], links[2], links[4]]}
      fab={{ label: 'Nouveau rapport de shift', icon: ClipboardPlus, to: '/supervisor/shift-reports' }}
      flushPaths={['/supervisor/dashboard', '/supervisor/reports', '/supervisor/users']}
    />
  );
}
