import { Building2, HardHat, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const dashboard = user?.role === 'landlord' ? '/propflow/dashboard' : '/keja/dashboard';
  return (
    <div className="min-h-screen bg-[#F6F9FF]">
      <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/90 backdrop-blur-xl">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6"
          aria-label="Public navigation"
        >
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white">
              <Building2 aria-hidden="true" size={22} />
            </span>
            <span>
              PropFlow Ecosystem{' '}
              <small className="block text-[10px] font-medium uppercase tracking-wider text-blue-700">
                Property · rentals · stays · construction
              </small>
            </span>
          </Link>
          <button
            className="rounded-lg p-2 sm:hidden"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <div
            className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-16 flex-col gap-2 border-b bg-white p-4 shadow-sm sm:static sm:flex sm:flex-row sm:items-center sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}
          >
            <NavLink
              to="/keja/listings"
              className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-blue-50"
            >
              FindYourKeja
            </NavLink>
            <NavLink to="/stay" className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-blue-50">
              StayBora
            </NavLink>
            <a
              href="http://localhost:3001"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-blue-50"
            >
              <HardHat size={17} aria-hidden="true" />
              JengaBora
            </a>
            {user ? (
              <Link to={dashboard} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 font-medium text-slate-700">
                  Sign in
                </Link>
                <Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">
                  Create account
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
