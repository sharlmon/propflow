import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Maintenance } from './components/Maintenance';
import { Finance } from './components/Finance';
import { Properties } from './components/Properties';
import { Tenants } from './components/Tenants';
import { Leases } from './components/Leases';
import { Documents } from './components/Documents';
import { Messages } from './components/Messages';
import { Payments } from './components/Payments';
import { Role } from './enums';
import type { User, Property, Tenant } from './types';
import { PROPERTIES as INITIAL_PROPERTIES } from './constants';

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
    status: 'Active'
  },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User>({
    id: 'u1',
    name: 'Musa Omari',
    email: 'musa@amanheights.com',
    role: Role.LANDLORD
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
        tenantId: 't1'
      });
      setActiveTab('dashboard'); // Reset tab when switching
    } else {
      setUser({
        id: 'u1',
        name: 'Musa Omari',
        email: 'musa@amanheights.com',
        role: Role.LANDLORD
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
      setActiveTab
    };

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard {...props} />;
      case 'properties':
        return <Properties {...props} />;
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
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      onToggleRole={toggleRole}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
