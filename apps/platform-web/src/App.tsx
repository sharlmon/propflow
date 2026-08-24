import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/RouteGuards';
import { PortalLayout } from './layouts/PortalLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { HomePage, NotFoundPage, PermissionDeniedPage, ProductFoundationPage } from './pages/FoundationPages';
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
      { path: '/keja', element: <MarketplacePage /> },
      { path: '/keja/listings', element: <MarketplacePage /> },
      { path: '/keja/listings/:slug', element: <ListingDetailPage /> },
      { path: '/listings', element: <MarketplacePage /> },
      { path: '/listings/:slug', element: <ListingDetailPage /> },
      {
        path: '/stay',
        element: (
          <ProductFoundationPage
            product="StayBora"
            description="Short-stay discovery, booking state and host accounting on verified inventory."
            branch="feat/staybora-listings-calendar"
          />
        ),
      },
      { path: '/stay/listings', element: <Navigate to="/stay" replace /> },
      { path: '/stay/listings/:slug', element: <Navigate to="/stay" replace /> },
      {
        path: '/stay/bookings',
        element: (
          <ProductFoundationPage
            product="StayBora bookings"
            description="Conflict-safe booking requests and lifecycle state."
            branch="feat/staybora-booking-workflow"
          />
        ),
      },
      {
        path: '/stay/host',
        element: (
          <ProductFoundationPage
            product="StayBora host workspace"
            description="Verified host inventory and availability management."
            branch="feat/staybora-listings-calendar"
          />
        ),
      },
      {
        path: '/stay/host/calendar',
        element: (
          <ProductFoundationPage
            product="StayBora calendar"
            description="Availability management with double-booking protection."
            branch="feat/staybora-listings-calendar"
          />
        ),
      },
      {
        path: '/stay/host/payouts',
        element: (
          <ProductFoundationPage
            product="StayBora payout ledger"
            description="Calculated host payout state with a sandbox provider adapter."
            branch="feat/staybora-host-payout-ledger"
          />
        ),
      },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute roles={['landlord']} />,
    children: [
      {
        element: <PortalLayout />,
        children: [
          { path: '/landlord/dashboard', element: <LandlordDashboardPage /> },
          { path: '/propflow/dashboard', element: <LandlordDashboardPage /> },
          { path: '/landlord/properties', element: <PropertiesPage /> },
          { path: '/propflow/properties', element: <PropertiesPage /> },
          { path: '/landlord/properties/new', element: <NewPropertyPage /> },
          { path: '/propflow/properties/new', element: <NewPropertyPage /> },
          { path: '/landlord/properties/:propertyId', element: <PropertyDetailPage /> },
          { path: '/propflow/properties/:propertyId', element: <PropertyDetailPage /> },
          {
            path: '/propflow/units/:unitId',
            element: (
              <ProductFoundationPage
                product="Unit workspace"
                description="The canonical unit route is reserved while the existing property detail continues to manage units."
                branch="feat/propflow-properties-units"
              />
            ),
          },
          { path: '/landlord/inquiries', element: <LandlordInquiriesPage /> },
          { path: '/propflow/inquiries', element: <LandlordInquiriesPage /> },
          { path: '/landlord/tenancies', element: <TenanciesPage /> },
          { path: '/propflow/tenancies', element: <TenanciesPage /> },
          { path: '/landlord/payments', element: <PaymentsPage /> },
          { path: '/propflow/payments', element: <PaymentsPage /> },
          {
            path: '/propflow/reconciliation',
            element: (
              <ProductFoundationPage
                product="Rent reconciliation"
                description="Provider events, account-reference matching and exception resolution."
                branch="feat/propflow-daraja-reconciliation"
              />
            ),
          },
          { path: '/landlord/maintenance', element: <MaintenancePage /> },
          { path: '/propflow/maintenance', element: <MaintenancePage /> },
          {
            path: '/propflow/reports',
            element: (
              <ProductFoundationPage
                product="Portfolio reports"
                description="Occupancy, collection, arrears and yield reporting."
                branch="feat/propflow-roi-reporting"
              />
            ),
          },
          { path: '/landlord/profile', element: <ProfilePage /> },
          { path: '/propflow/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['renter']} />,
    children: [
      {
        element: <PortalLayout />,
        children: [
          { path: '/renter/dashboard', element: <RenterDashboardPage /> },
          { path: '/keja/dashboard', element: <RenterDashboardPage /> },
          { path: '/renter/inquiries', element: <RenterInquiriesPage /> },
          { path: '/keja/inquiries', element: <RenterInquiriesPage /> },
          { path: '/renter/maintenance', element: <MaintenancePage /> },
          { path: '/keja/maintenance', element: <MaintenancePage /> },
          { path: '/renter/profile', element: <ProfilePage /> },
          { path: '/keja/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '/permission-denied', element: <PermissionDeniedPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
