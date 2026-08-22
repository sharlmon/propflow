import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/RouteGuards';
import { PortalLayout } from './layouts/PortalLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { HomePage, NotFoundPage, PermissionDeniedPage, SectionPage } from './pages/FoundationPages';
import { NewPropertyPage, PropertiesPage, PropertyDetailPage } from './pages/InventoryPages';
import { ListingDetailPage, MarketplacePage } from './pages/MarketplacePages';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 }, mutations: { retry: 0 } },
});

const portal = (title: string, description: string) => <SectionPage title={title} description={description} />;

// Exported for route-level tests.
// eslint-disable-next-line react-refresh/only-export-components
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/listings', element: <MarketplacePage /> },
      { path: '/listings/:slug', element: <ListingDetailPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute roles={['landlord']} />,
    children: [{ element: <PortalLayout />, children: [
      { path: '/landlord/dashboard', element: portal('Dashboard', 'Your live portfolio overview.') },
      { path: '/landlord/properties', element: <PropertiesPage /> },
      { path: '/landlord/properties/new', element: <NewPropertyPage /> },
      { path: '/landlord/properties/:propertyId', element: <PropertyDetailPage /> },
      { path: '/landlord/inquiries', element: portal('Inquiries', 'Review renter interest and update progress.') },
      { path: '/landlord/tenancies', element: portal('Tenancies', 'Record and review active rental agreements.') },
      { path: '/landlord/payments', element: portal('Payments', 'Maintain the demo rent ledger.') },
      { path: '/landlord/maintenance', element: portal('Maintenance', 'Track requests through resolution.') },
      { path: '/landlord/profile', element: portal('Profile', 'Review your account details.') },
    ] }],
  },
  {
    element: <ProtectedRoute roles={['renter']} />,
    children: [{ element: <PortalLayout />, children: [
      { path: '/renter/dashboard', element: portal('Dashboard', 'Your rental activity at a glance.') },
      { path: '/renter/inquiries', element: portal('Inquiries', 'Review your listing inquiries.') },
      { path: '/renter/maintenance', element: portal('Maintenance', 'Submit and follow maintenance requests.') },
      { path: '/renter/profile', element: portal('Profile', 'Review your account details.') },
    ] }],
  },
  { path: '/permission-denied', element: <PermissionDeniedPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

export default function App() {
  return <QueryClientProvider client={queryClient}><AuthProvider><RouterProvider router={router} /></AuthProvider></QueryClientProvider>;
}
