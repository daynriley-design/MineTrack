import { useEffect, useState } from 'react';
import {
  Eye, House, AlertTriangle, Map, ShieldCheck, FileText, ClipboardList,
  CircleDollarSign, Package, Users, User, ClipboardPlus,
} from 'lucide-react';
import { supervisorAPI } from '../../api';
import AppShell from '../AppShell';

export default function SupervisorLayout() {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    supervisorAPI.alerts()
      .then(({ data }) => setAlertCount((data?.incidents?.length || 0) + (data?.pannes?.length || 0)))
      .catch(() => {});
  }, []);

  const links = [
    { to: '/supervisor/dashboard', label: 'Accueil', icon: House },
    { to: '/supervisor/alerts', label: 'Alertes', icon: AlertTriangle, count: alertCount },
    { to: '/supervisor/map', label: 'Carte interactive', icon: Map },
    { to: '/supervisor/hse-validation', label: 'Validation HSE', icon: ShieldCheck },
    { to: '/supervisor/reports', label: 'Rapports', icon: FileText },
    { to: '/supervisor/shift-reports', label: 'Rapports de shift', icon: ClipboardList },
    { to: '/supervisor/erp', label: 'ERP / Finances', icon: CircleDollarSign },
    { to: '/supervisor/stocks', label: 'Gestion stocks', icon: Package },
    { to: '/supervisor/users', label: 'Utilisateurs', icon: Users },
    { to: '/supervisor/profile', label: 'Profil', icon: User },
  ];

  return (
    <AppShell
      brandIcon={Eye}
      roleLabel="Supervision"
      links={links}
      dock={[links[0], links[2], links[4]]}
      fab={{ label: 'Nouveau rapport de shift', icon: ClipboardPlus, to: '/supervisor/shift-reports' }}
      flushPaths={['/supervisor/dashboard']}
    />
  );
}
