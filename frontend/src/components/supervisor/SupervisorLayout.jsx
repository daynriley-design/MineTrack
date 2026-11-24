import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Eye, House, AlertTriangle, Map, ShieldCheck, FileText, ClipboardList,
  CircleDollarSign, Package, Users, User, ClipboardPlus,
} from 'lucide-react';
import api, { supervisorAPI } from '../../api';
import AppShell from '../AppShell';

export default function SupervisorLayout() {
  const { t } = useTranslation();
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
    { to: '/supervisor/dashboard', label: t('app.home'), icon: House },
    { to: '/supervisor/alerts', label: t('app.alerts'), icon: AlertTriangle, count: alertCount },
    { to: '/supervisor/map', label: t('app.map'), icon: Map },
    { to: '/supervisor/hse-validation', label: t('app.hse_validation'), icon: ShieldCheck },
    { to: '/supervisor/reports', label: t('app.reports'), icon: FileText },
    { to: '/supervisor/shift-reports', label: t('app.shift_reports'), icon: ClipboardList },
    { to: '/supervisor/erp', label: t('app.erp'), icon: CircleDollarSign },
    { to: '/supervisor/stocks', label: t('app.stocks'), icon: Package },
    { to: '/supervisor/users', label: t('app.users'), icon: Users, count: pendingCount },
    { to: '/supervisor/profile', label: t('app.profile'), icon: User },
  ];

  return (
    <AppShell
      brandIcon={Eye}
      roleLabel={t('app.area_supervision')}
      links={links}
      dock={[links[0], links[2], links[4]]}
      fab={{ label: t('app.new_shift_report'), icon: ClipboardPlus, to: '/supervisor/shift-reports' }}
      flushPaths={['/supervisor/dashboard', '/supervisor/reports', '/supervisor/users', '/supervisor/hse-validation', '/supervisor/stocks', '/supervisor/erp', '/supervisor/map', '/supervisor/profile']}
    />
  );
}
