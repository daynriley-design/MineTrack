import { useTranslation } from 'react-i18next';
import {
  House, Settings, MapPin, Activity, Drill, Zap, Factory,
  Truck, Users, ShieldAlert, FlaskConical, Wrench, DollarSign,
  FileBarChart2, Pickaxe, Eye, Package, Headset, ClipboardList, UserCog,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AppShell from './AppShell';

/** Layout des roles Admin et Management (coquille commune AppShell). */
export default function Layout() {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (user?.role === 'management') {
    const links = [{ to: '/management/reports', label: 'Rapports de shift', icon: ClipboardList }];
    return (
      <AppShell
        brandIcon={Pickaxe}
        roleLabel="Management"
        links={links}
        dock={links}
        flushPaths={['/management/reports']}
      />
    );
  }

  const links = [
    { section: t('nav.main'), to: '/admin/operations', label: t('nav.setup'), icon: Settings },
    { to: '/admin/dashboard', label: t('nav.dashboard'), icon: House },
    { to: '/supervisor/users', label: 'Utilisateurs', icon: UserCog },
    { section: t('nav.operations'), to: '/admin/pegs', label: t('nav.pegs'), icon: MapPin },
    { to: '/admin/work-progress', label: t('nav.progress'), icon: Activity },
    { to: '/admin/drilling', label: t('nav.drilling'), icon: Drill },
    { to: '/admin/blasting', label: t('nav.blasting'), icon: Zap },
    { to: '/admin/production', label: t('nav.production'), icon: Factory },
    { section: t('nav.resources'), to: '/admin/equipment', label: t('nav.equipment'), icon: Truck },
    { to: '/admin/labor', label: t('nav.labor'), icon: Users },
    { to: '/admin/hse', label: t('nav.hse'), icon: ShieldAlert },
    { section: t('nav.tech_finance'), to: '/admin/geology', label: t('nav.geology'), icon: FlaskConical },
    { to: '/admin/support', label: t('nav.support'), icon: Wrench },
    { to: '/admin/financial', label: t('nav.financial'), icon: DollarSign },
    { to: '/admin/reports', label: t('nav.reports'), icon: FileBarChart2 },
    // L'admin a aussi acces aux espaces des autres roles (cf. App.jsx).
    { section: 'Espaces', to: '/supervisor/dashboard', label: 'Supervision', icon: Eye },
    { to: '/management/reports', label: 'Management', icon: ClipboardList },
    { to: '/logistique/dashboard', label: 'Logistique', icon: Package },
    { to: '/support/dashboard', label: 'Support technique', icon: Headset },
  ];

  const byPath = (p) => links.find((l) => l.to === p);

  return (
    <AppShell
      brandIcon={Pickaxe}
      roleLabel={t('user.role_admin')}
      links={links}
      dock={[byPath('/admin/dashboard'), byPath('/admin/pegs'), byPath('/admin/reports')]}
      fab={{ label: t('nav.setup'), icon: Settings, to: '/admin/operations' }}
      flushPaths={['/admin/operations']}
    />
  );
}
