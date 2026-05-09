import React, { Suspense, lazy, useState } from 'react';
import { Layout } from './components/Layout';
import { Role } from './enums';
import type { User, Property, Tenant } from './types';
import { PROPERTIES as INITIAL_PROPERTIES } from './constants';
import { LoadingSkeleton } from './shared/components/LoadingSkeleton';
import { validateEnvironment } from './config/environment';

const Dashboard = lazy(() =>
  import('./components/Dashboard').then((module) => ({ default: module.Dashboard })),
);
const Maintenance = lazy(() =>
  import('./components/Maintenance').then((module) => ({ default: module.Maintenance })),
);
const Finance = lazy(() => import('./components/Finance').then((module) => ({ default: module.Finance })));
const Properties = lazy(() =>
  import('./components/Properties').then((module) => ({ default: module.Properties })),
);
const Tenants = lazy(() => import('./components/Tenants').then((module) => ({ default: module.Tenants })));
const Leases = lazy(() => import('./components/Leases').then((module) => ({ default: module.Leases })));
const Documents = lazy(() =>
  import('./components/Documents').then((module) => ({ default: module.Documents })),
);
const Messages = lazy(() => import('./components/Messages').then((module) => ({ default: module.Messages })));
const Payments = lazy(() => import('./components/Payments').then((module) => ({ default: module.Payments })));
const Marketplace = lazy(() =>
  import('./components/Marketplace').then((module) => ({ default: module.Marketplace })),
);
const Intelligence = lazy(() =>
  import('./components/Intelligence').then((module) => ({ default: module.Intelligence })),
);

validateEnvironment().forEach((warning) => console.warn(`[PropFlow config] ${warning}`));

const MOCK_TENANTS: Tenant[] = [
  {
    id: 't1',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    phone: '254712345789',
    propertyId: 'p1',
    unitNumber: 'A-101',
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    rentAmount: 120000,
    balance: 120000,
    status: 'Active',
  },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User>({
    id: 'u1',
    name: 'Musa Omari',
    email: 'musa@amanheights.com',
    role: Role.LANDLORD,
  });

  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);

  // When switching to tenant mode, we simulate being Alice Johnson
  const toggleRole = () => {
    if (user.role === Role.LANDLORD) {
      setUser({
        id: 'u2',
        name: 'Alice Johnson',
        email: 'alice.j@example.com',
        role: Role.TENANT,
        tenantId: 't1',
      });
      setActiveTab('dashboard'); // Reset tab when switching
    } else {
      setUser({
        id: 'u1',
        name: 'Musa Omari',
        email: 'musa@amanheights.com',
        role: Role.LANDLORD,
      });
      setActiveTab('dashboard');
    }
  };

  const addProperty = (p: Property) => setProperties([...properties, p]);
  const addTenant = (t: Tenant) => setTenants([...tenants, t]);

  const renderContent = () => {
    const props = {
      user,
      properties,
      tenants,
      addProperty,
      addTenant,
      setActiveTab,
    };

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard {...props} />;
      case 'properties':
        return <Properties {...props} />;
      case 'marketplace':
        return <Marketplace />;
      case 'intelligence':
      case 'admin':
        return <Intelligence />;
      case 'tenants':
        return <Tenants {...props} />;
      case 'leases':
        return <Leases user={user} />;
      case 'maintenance':
        return <Maintenance user={user} />;
      case 'finance':
        return <Finance />;
      case 'documents':
        return <Documents />;
      case 'messages':
        return <Messages user={user} />;
      case 'payments':
        return <Payments user={user} tenants={tenants} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user} onToggleRole={toggleRole}>
      <Suspense fallback={<LoadingSkeleton />}>{renderContent()}</Suspense>
    </Layout>
  );
};

export default App;
