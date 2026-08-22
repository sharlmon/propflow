import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/RouteGuards';
import { PortalLayout } from './layouts/PortalLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { HomePage, NotFoundPage, PermissionDeniedPage } from './pages/FoundationPages';
import { NewPropertyPage, PropertiesPage, PropertyDetailPage } from './pages/InventoryPages';
import { ListingDetailPage, MarketplacePage } from './pages/MarketplacePages';
import { LandlordInquiriesPage, RenterInquiriesPage } from './pages/InquiryPages';
import { TenanciesPage } from './pages/TenancyPages';
import { PaymentsPage } from './pages/PaymentPages';
import { MaintenancePage } from './pages/MaintenancePages';
import { LandlordDashboardPage, ProfilePage, RenterDashboardPage } from './pages/DashboardPages';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 }, mutations: { retry: 0 } },
});

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
      { path: '/landlord/dashboard', element: <LandlordDashboardPage /> },
      { path: '/landlord/properties', element: <PropertiesPage /> },
      { path: '/landlord/properties/new', element: <NewPropertyPage /> },
      { path: '/landlord/properties/:propertyId', element: <PropertyDetailPage /> },
      { path: '/landlord/inquiries', element: <LandlordInquiriesPage /> },
      { path: '/landlord/tenancies', element: <TenanciesPage /> },
      { path: '/landlord/payments', element: <PaymentsPage /> },
      { path: '/landlord/maintenance', element: <MaintenancePage /> },
      { path: '/landlord/profile', element: <ProfilePage /> },
    ] }],
  },
  {
    element: <ProtectedRoute roles={['renter']} />,
    children: [{ element: <PortalLayout />, children: [
      { path: '/renter/dashboard', element: <RenterDashboardPage /> },
      { path: '/renter/inquiries', element: <RenterInquiriesPage /> },
      { path: '/renter/maintenance', element: <MaintenancePage /> },
      { path: '/renter/profile', element: <ProfilePage /> },
    ] }],
  },
  { path: '/permission-denied', element: <PermissionDeniedPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

export default function App() {
  return <QueryClientProvider client={queryClient}><AuthProvider><RouterProvider router={router} /></AuthProvider></QueryClientProvider>;
}
