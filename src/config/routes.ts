import {
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  Key,
  LayoutDashboard,
  Map,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';
import { isFeatureEnabled } from './featureFlags';

export type RouteId =
  | 'dashboard'
  | 'properties'
  | 'marketplace'
  | 'intelligence'
  | 'tenants'
  | 'leases'
  | 'payments'
  | 'maintenance'
  | 'finance'
  | 'documents'
  | 'messages'
  | 'admin';

export const routes = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'properties', label: 'Properties', icon: Building2 },
  { id: 'marketplace', label: 'Marketplace', icon: Map, feature: 'marketplaceSearch' },
  { id: 'intelligence', label: 'Intelligence', icon: Sparkles, feature: 'investorIntelligence' },
  { id: 'tenants', label: 'Tenants', icon: Users },
  { id: 'leases', label: 'Leases', icon: Key },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'finance', label: 'Financials', icon: BarChart3 },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'admin', label: 'Admin', icon: ShieldCheck, feature: 'adminModeration' },
] as const;

export const visibleRoutes = routes.filter(
  (route) => !('feature' in route) || isFeatureEnabled(route.feature),
);
