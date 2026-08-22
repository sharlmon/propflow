import { ArrowRight, Building2, CheckCircle2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export function HomePage() {
  return (
    <main>
      <section className="px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="font-semibold text-blue-700">Kenyan rentals, connected</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Find a home. Manage it with confidence.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              FindYourKeja helps renters discover clear, current rental listings. PropFlow gives landlords one
              practical place to manage the journey from vacancy to maintenance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/listings"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                <Search size={19} />
                Browse rentals
              </Link>
              <Link
                to="/register"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-800 hover:bg-blue-50"
              >
                List a property <ArrowRight size={19} />
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/80 bg-white/80 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur">
            <div className="rounded-2xl bg-[#0F172A] p-8 text-white">
              <Building2 className="text-blue-400" size={36} />
              <h2 className="mt-10 text-2xl font-bold">One connected rental workflow</h2>
              <ul className="mt-6 space-y-4 text-slate-300">
                {[
                  'Current public listings',
                  'Structured renter inquiries',
                  'Tenancy and rent ledger',
                  'Trackable maintenance requests',
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
    </main>
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
