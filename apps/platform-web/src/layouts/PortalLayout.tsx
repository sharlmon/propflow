import { Building2, Menu, LogOut, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

const landlordLinks = [
  ['Dashboard', '/propflow/dashboard'],
  ['Properties', '/propflow/properties'],
  ['Inquiries', '/propflow/inquiries'],
  ['Tenancies', '/propflow/tenancies'],
  ['Payments', '/propflow/payments'],
  ['Maintenance', '/propflow/maintenance'],
  ['Profile', '/propflow/profile'],
];
const renterLinks = [
  ['Dashboard', '/keja/dashboard'],
  ['Inquiries', '/keja/inquiries'],
  ['Maintenance', '/keja/maintenance'],
  ['Profile', '/keja/profile'],
];

export function PortalLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const links = user?.role === 'landlord' ? landlordLinks : renterLinks;
  async function signOut() {
    await logout();
  }
  return (
    <div className="min-h-screen bg-[#F6F9FF] lg:flex">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-white p-4 lg:hidden">
        <span className="font-bold">PropFlow</span>
        <button
          aria-label="Toggle portal navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      <aside
        className={`${open ? 'flex' : 'hidden'} fixed inset-y-0 left-0 z-30 w-72 flex-col bg-[#0F172A] p-5 text-white lg:sticky lg:flex lg:h-screen`}
      >
        <NavLink to="/" className="mb-8 flex items-center gap-3 text-lg font-bold">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-600">
            <Building2 />
          </span>
          PropFlow
        </NavLink>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Portal navigation">
          {links.map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={signOut}
          className="flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
