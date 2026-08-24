import { useQuery } from '@tanstack/react-query';
import { Building2, CreditCard, Home, MessageSquare, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import type { Inquiry, MaintenanceRequest, Payment, Tenancy } from '../api/types';
import { useAuth } from '../auth/AuthProvider';

interface LandlordDashboard {
  metrics: {
    total_properties: number;
    total_units: number;
    available_units: number;
    occupied_units: number;
    published_listings: number;
    new_inquiries: number;
    active_tenancies: number;
    payments_this_month: number;
    outstanding_balance: number;
    open_maintenance_requests: number;
  };
  recent_inquiries: Inquiry[];
  recent_payments: Payment[];
}
interface RenterDashboard {
  active_tenancy: Tenancy | null;
  recent_payments: Payment[];
  open_maintenance: MaintenanceRequest[];
  inquiries: Inquiry[];
}
const money = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});
function Loading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((key) => (
        <div key={key} className="h-32 animate-pulse rounded-2xl bg-white" />
      ))}
    </div>
  );
}
function Metric({ label, value, to }: { label: string; value: string | number; to: string }) {
  return (
    <Link to={to} className="rounded-2xl border bg-white p-5 shadow-sm hover:border-blue-300">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-3 text-3xl font-bold text-slate-950">{value}</dd>
    </Link>
  );
}

export function LandlordDashboardPage() {
  const query = useQuery({
    queryKey: ['dashboard', 'landlord'],
    queryFn: ({ signal }) => apiRequest<LandlordDashboard>('/dashboard/landlord', { signal }),
  });
  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">PropFlow overview</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">Landlord dashboard</h1>
      <p className="mt-2 text-slate-600">Live counts from your organization’s records.</p>
      <div className="mt-7">
        {query.isLoading ? (
          <Loading />
        ) : query.isError ? (
          <div role="alert" className="rounded-xl bg-red-50 p-4">
            {query.error.message}
            <button className="ml-3 font-semibold underline" onClick={() => query.refetch()}>
              Retry
            </button>
          </div>
        ) : query.data ? (
          <>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Metric
                label="Properties"
                value={query.data.metrics.total_properties}
                to="/propflow/properties"
              />
              <Metric label="Total units" value={query.data.metrics.total_units} to="/propflow/properties" />
              <Metric
                label="Available units"
                value={query.data.metrics.available_units}
                to="/propflow/properties"
              />
              <Metric
                label="Occupied units"
                value={query.data.metrics.occupied_units}
                to="/propflow/tenancies"
              />
              <Metric
                label="Published listings"
                value={query.data.metrics.published_listings}
                to="/keja/listings"
              />
              <Metric
                label="New inquiries"
                value={query.data.metrics.new_inquiries}
                to="/propflow/inquiries"
              />
              <Metric
                label="Active tenancies"
                value={query.data.metrics.active_tenancies}
                to="/propflow/tenancies"
              />
              <Metric
                label="Payments this month"
                value={query.data.metrics.payments_this_month}
                to="/propflow/payments"
              />
              <Metric
                label="Outstanding this month"
                value={money.format(query.data.metrics.outstanding_balance)}
                to="/propflow/payments"
              />
              <Metric
                label="Open maintenance"
                value={query.data.metrics.open_maintenance_requests}
                to="/propflow/maintenance"
              />
            </dl>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <article className="rounded-2xl border bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Recent inquiries</h2>
                  <Link className="text-sm font-semibold text-blue-700" to="/propflow/inquiries">
                    View all
                  </Link>
                </div>
                {query.data.recent_inquiries.length === 0 ? (
                  <p className="mt-5 text-slate-500">No inquiries yet.</p>
                ) : (
                  <ul className="mt-4 divide-y">
                    {query.data.recent_inquiries.map((item) => (
                      <li key={item.id} className="py-3">
                        <p className="font-semibold">{item.listing_title}</p>
                        <p className="text-sm text-slate-500">
                          {item.renter_name} · {item.status}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
              <article className="rounded-2xl border bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Recent payments</h2>
                  <Link className="text-sm font-semibold text-blue-700" to="/propflow/payments">
                    View ledger
                  </Link>
                </div>
                {query.data.recent_payments.length === 0 ? (
                  <p className="mt-5 text-slate-500">No payments yet.</p>
                ) : (
                  <ul className="mt-4 divide-y">
                    {query.data.recent_payments.map((item) => (
                      <li key={item.id} className="flex justify-between gap-4 py-3">
                        <div>
                          <p className="font-semibold">{item.tenant_name}</p>
                          <p className="text-sm text-slate-500">
                            {item.property_name} · {item.unit_label}
                          </p>
                        </div>
                        <span className="font-semibold text-emerald-700">{money.format(item.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

export function RenterDashboardPage() {
  const query = useQuery({
    queryKey: ['dashboard', 'renter'],
    queryFn: ({ signal }) => apiRequest<RenterDashboard>('/dashboard/renter', { signal }),
  });
  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Your rental</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">Renter dashboard</h1>
      <p className="mt-2 text-slate-600">Your tenancy, payments, inquiries, and maintenance in one place.</p>
      <div className="mt-7">
        {query.isLoading ? (
          <Loading />
        ) : query.isError ? (
          <div role="alert" className="rounded-xl bg-red-50 p-4">
            {query.error.message}
          </div>
        ) : query.data ? (
          <>
            <article className="rounded-2xl bg-[#0F172A] p-6 text-white">
              {query.data.active_tenancy ? (
                <div className="grid gap-5 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <p className="text-sm text-blue-300">Active tenancy</p>
                    <h2 className="mt-2 text-2xl font-bold">
                      {query.data.active_tenancy.property_name} · {query.data.active_tenancy.unit_label}
                    </h2>
                    <p className="mt-2 text-slate-300">
                      Started {new Date(query.data.active_tenancy.start_date).toLocaleDateString('en-KE')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-300">Monthly rent</p>
                    <p className="mt-2 text-2xl font-bold">
                      {money.format(query.data.active_tenancy.monthly_rent)}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Home className="text-blue-300" />
                  <h2 className="mt-4 text-xl font-bold">No active tenancy yet</h2>
                  <p className="mt-2 text-slate-300">Browse homes and send an inquiry to get started.</p>
                  <Link
                    to="/keja/listings"
                    className="mt-5 inline-block rounded-xl bg-blue-600 px-4 py-2 font-semibold"
                  >
                    Browse rentals
                  </Link>
                </div>
              )}
            </article>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <Link to="/keja/inquiries" className="rounded-2xl border bg-white p-5">
                <MessageSquare className="text-blue-700" />
                <p className="mt-4 text-2xl font-bold">{query.data.inquiries.length}</p>
                <p className="text-sm text-slate-500">Recent inquiries</p>
              </Link>
              <Link to="/keja/maintenance" className="rounded-2xl border bg-white p-5">
                <Wrench className="text-blue-700" />
                <p className="mt-4 text-2xl font-bold">{query.data.open_maintenance.length}</p>
                <p className="text-sm text-slate-500">Open maintenance</p>
              </Link>
              <div className="rounded-2xl border bg-white p-5">
                <CreditCard className="text-blue-700" />
                <p className="mt-4 text-2xl font-bold">{query.data.recent_payments.length}</p>
                <p className="text-sm text-slate-500">Recent payments</p>
              </div>
            </div>
            <article className="mt-6 rounded-2xl border bg-white p-6">
              <h2 className="text-xl font-bold">Recent payments</h2>
              {query.data.recent_payments.length === 0 ? (
                <p className="mt-4 text-slate-500">No payments recorded.</p>
              ) : (
                <ul className="mt-4 divide-y">
                  {query.data.recent_payments.map((payment) => (
                    <li key={payment.id} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <p className="font-semibold">{payment.reference}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(payment.paid_at).toLocaleDateString('en-KE')} ·{' '}
                          {payment.method === 'mpesa_demo' ? 'M-Pesa demo' : payment.method}
                        </p>
                      </div>
                      <strong className="text-emerald-700">{money.format(payment.amount)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </>
        ) : null}
      </div>
    </section>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Account</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">Profile</h1>
      <article className="mt-7 max-w-2xl rounded-2xl border bg-white p-6">
        <div className="grid size-14 place-items-center rounded-2xl bg-blue-100 text-blue-700">
          <Building2 />
        </div>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Full name</dt>
            <dd className="mt-1 font-semibold">{user?.full_name}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Role</dt>
            <dd className="mt-1 font-semibold capitalize">{user?.role}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Email</dt>
            <dd className="mt-1 font-semibold">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Phone</dt>
            <dd className="mt-1 font-semibold">{user?.phone || 'Not provided'}</dd>
          </div>
        </dl>
      </article>
    </section>
  );
}
