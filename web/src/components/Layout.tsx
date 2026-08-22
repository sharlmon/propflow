import React from 'react';
import { NAV_ITEMS_FULL } from '../constants';
import { Menu, X, Bell, Repeat, LogOut } from 'lucide-react';
import { Role } from '../enums';
import type { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (id: string) => void;
  user: User;
  onToggleRole: () => void;
}

const PropFlowLogo = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="url(#pf-grad)" />
    <path
      d="M10 22V14L18 8L26 14V22"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M18 8V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M14 28H22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="pf-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4F46E5" />
        <stop offset="1" stopColor="#3730A3" />
      </linearGradient>
    </defs>
  </svg>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onToggleRole }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // Define which tabs are visible for which role
  const filteredNavItems = NAV_ITEMS_FULL.filter((item) => {
    if (user.role === Role.LANDLORD) return true;
    // Tenant-specific navigation
    const tenantAllowed = ['dashboard', 'payments', 'maintenance', 'documents', 'messages'];
    return tenantAllowed.includes(item.id);
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 font-bold text-xl text-indigo-700">
          <PropFlowLogo />
          PropFlow
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition duration-300 ease-in-out
        w-64 bg-slate-900 text-white z-40 flex flex-col h-screen shadow-2xl md:shadow-none
      `}
      >
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-slate-800/50">
          <PropFlowLogo />
          <span className="text-xl font-bold tracking-tight text-white">PropFlow</span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    activeTab === item.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto space-y-2">
          <button
            onClick={onToggleRole}
            className="w-full flex items-center gap-3 px-4 py-3 text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800/50 transition-colors"
          >
            <Repeat className="w-4 h-4" />
            Switch to {user.role === Role.LANDLORD ? 'Tenant' : 'Landlord'}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white text-sm font-medium rounded-xl hover:bg-slate-800/50 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {NAV_ITEMS_FULL.find((i) => i.id === activeTab)?.label}
            </h2>
            <span
              className={`ml-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${user.role === Role.LANDLORD ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}
            >
              {user.role} Portal
            </span>
          </div>

          <div className="flex items-center gap-5">
            <button className="p-2 text-slate-400 hover:text-indigo-600 relative rounded-full hover:bg-slate-50 transition-all">
              <Bell className="w-5.5 h-5.5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 leading-tight">{user.name}</p>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                  {user.role === Role.LANDLORD ? 'Portfolio Manager' : 'Resident'}
                </p>
              </div>
              <img
                src={
                  user.role === Role.LANDLORD
                    ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80'
                    : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80'
                }
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-indigo-100 shadow-sm cursor-pointer hover:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
};
