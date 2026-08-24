import { ArrowRight, Building2, CheckCircle2, HardHat, Home, Search, TentTree } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, PageHeader, StatusBadge } from '@propflow/ui';
import { useAuth } from '../auth/AuthProvider';

export function HomePage() {
  const products = [
    {
      name: 'PropFlow',
      description: 'Property operations, tenancies, rent records and maintenance.',
      to: '/propflow/dashboard',
      icon: Building2,
      status: 'Working MVP',
    },
    {
      name: 'FindYourKeja',
      description: 'Verified long-term rentals sourced from PropFlow inventory.',
      to: '/keja/listings',
      icon: Home,
      status: 'Working MVP',
    },
    {
      name: 'StayBora',
      description: 'Short-stay discovery, calendars, bookings and host accounting.',
      to: '/stay',
      icon: TentTree,
      status: 'Foundation',
    },
  ];
  return (
    <main>
      <section className="px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="font-semibold text-blue-700">One connected property ecosystem</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Operate property. Find homes. Control every milestone.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              PropFlow is the inventory and operations core. FindYourKeja, StayBora and JengaBora turn that
              trusted foundation into focused customer journeys.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/keja/listings"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                <Search size={19} />
                Browse rentals
              </Link>
              <a
                href="http://localhost:3001"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-800 hover:bg-blue-50"
              >
                Open JengaBora <ArrowRight size={19} />
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-white/80 bg-white/80 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur">
            <div className="rounded-2xl bg-[#0F172A] p-8 text-white">
              <Building2 className="text-blue-400" size={36} />
              <h2 className="mt-10 text-2xl font-bold">Shared foundations, focused products</h2>
              <ul className="mt-6 space-y-4 text-slate-300">
                {[
                  'Authoritative property inventory',
                  'Shared secure identity and API contracts',
                  'Auditable payments and approvals',
                  'Separate customer-focused applications',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-400" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-blue-100 bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <PageHeader
            eyebrow="Products"
            title="One ecosystem, four focused experiences"
            description="Only the completed long-term rental path is presented as working. New product foundations are labeled honestly until their vertical-slice branches ship."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {products.map(({ name, description, to, icon: Icon, status }) => (
              <Card key={name} className="flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                    <Icon aria-hidden="true" />
                  </span>
                  <StatusBadge tone={status === 'Working MVP' ? 'blue' : 'slate'}>{status}</StatusBadge>
                </div>
                <h2 className="mt-6 text-xl font-bold text-slate-950">{name}</h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
                <Link className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-700" to={to}>
                  Open product <ArrowRight size={17} />
                </Link>
              </Card>
            ))}
          </div>
          <Card className="mt-5 flex flex-wrap items-center justify-between gap-4 bg-[#0D1B33] text-white">
            <div className="flex items-center gap-4">
              <HardHat className="text-blue-300" />
              <div>
                <h2 className="font-bold">JengaBora runs as a separate application</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Construction projects, milestone evidence, review controls and release accounting on port
                  3001.
                </p>
              </div>
            </div>
            <a className="font-semibold text-blue-300" href="http://localhost:3001">
              Open JengaBora
            </a>
          </Card>
        </div>
      </section>
    </main>
  );
}

export function ProductFoundationPage({
  product,
  description,
  branch,
}: {
  product: string;
  description: string;
  branch: string;
}) {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <PageHeader eyebrow="Ecosystem foundation" title={product} description={description} />
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-950">Route and product shell ready</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                The database-backed workflow is intentionally unavailable until its branch adds authorization,
                persistence, validation and automated tests.
              </p>
            </div>
            <StatusBadge tone="amber">Planned: {branch}</StatusBadge>
          </div>
        </Card>
      </div>
    </section>
  );
}

export function SectionPage({ title, description }: { title: string; description: string }) {
  const { user } = useAuth();
  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">{user?.role} workspace</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{description}</p>
    </section>
  );
}

export function PermissionDeniedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center">
      <div>
        <p className="font-semibold text-red-700">Permission denied</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">This area belongs to another account role.</h1>
        <Link to="/" className="mt-6 inline-block font-semibold text-blue-700">
          Return home
        </Link>
      </div>
    </main>
  );
}

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center">
      <div>
        <p className="font-semibold text-blue-700">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Page not found</h1>
        <Link to="/" className="mt-6 inline-block font-semibold text-blue-700">
          Return home
        </Link>
      </div>
    </main>
  );
}
