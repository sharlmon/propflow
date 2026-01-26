import React from 'react';
import {
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { FINANCIALS, MAINTENANCE_TICKETS, NOTICES } from '../constants';
import { TicketStatus, Role } from '../enums';
import type { User, Property, Tenant } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Building, AlertCircle, Calendar, CreditCard, Wrench, MessageSquare, CheckCircle2, Megaphone, Droplets, Zap, ChevronRight, Info } from 'lucide-react';

const chartData = [
    { name: 'Jan', income: 1200000, expense: 450000 },
    { name: 'Feb', income: 1150000, expense: 520000 },
    { name: 'Mar', income: 1300000, expense: 480000 },
    { name: 'Apr', income: 1280000, expense: 610000 },
    { name: 'May', income: 1450000, expense: 540000 },
    { name: 'Jun', income: 1550000, expense: 590000 },
];

interface DashboardProps {
    user: User;
    properties: Property[];
    tenants: Tenant[];
    setActiveTab: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, properties, tenants, setActiveTab }) => {
    if (user.role === Role.TENANT) {
        const tenant = tenants.find(t => t.id === user.tenantId);
        return <TenantDashboard user={user} tenant={tenant} setActiveTab={setActiveTab} />;
    }

    const totalRent = FINANCIALS.filter(f => f.category === 'Rent').reduce((acc, curr) => acc + curr.amount, 0);
    const openTickets = MAINTENANCE_TICKETS.filter(t => t.status !== TicketStatus.COMPLETED).length;
    // Improved: dynamic occupancy rate calculation
    const totalUnits = properties.reduce((acc, p) => acc + p.units, 0);
    // Mock occupancy for now as we don't have unit level data in properties list fully mapped
    const occupancyRate = "96%";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome Back, {user.name.split(' ')[0]}</h1>
                <p className="text-slate-500">Your property portfolio is performing <span className="text-emerald-600 font-bold">well</span> today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue (May)" value={`KSh ${totalRent.toLocaleString()}`} icon={<DollarSign className="text-emerald-600" />} trend="+14.2%" trendUp={true} />
                <StatCard title="Active Tickets" value={openTickets.toString()} icon={<AlertCircle className="text-amber-600" />} trend="-4 from last week" trendUp={false} />
                <StatCard title="Units Managed" value={totalUnits.toString()} icon={<Building className="text-indigo-600" />} trend={`${properties.length} Props`} trendUp={true} />
                <StatCard title="Avg Occupancy" value={occupancyRate} icon={<TrendingUp className="text-blue-600" />} trend="+1.5%" trendUp={true} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-7 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-slate-800">Portfolio Cash Flow (KSh)</h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-50 rounded-lg">6 Months</button>
                            <button className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg">Yearly</button>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={15} />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`}
                                />
                                <Tooltip
                                    formatter={(value) => `KSh ${Number(value).toLocaleString()}`}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="income" stroke="#4f46e5" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={4} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-slate-800">Urgent Tickets</h3>
                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full">High Priority</span>
                    </div>
                    <div className="space-y-5 flex-1 overflow-y-auto">
                        {MAINTENANCE_TICKETS.slice(0, 4).map(ticket => (
                            <div key={ticket.id} className="group cursor-pointer">
                                <div className="flex items-start gap-4 p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all">
                                    <div className={`w-3 h-3 mt-1.5 rounded-full flex-shrink-0 ${ticket.priority === 'Emergency' ? 'bg-red-500 animate-pulse' :
                                        ticket.priority === 'High' ? 'bg-orange-500' : 'bg-blue-400'
                                        }`}></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors">{ticket.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-medium text-slate-400">Unit {ticket.unitId}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className="text-xs font-medium text-slate-400">{ticket.submittedAt}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setActiveTab('maintenance')} className="mt-8 w-full py-3 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-colors">
                        View Maintenance Board
                    </button>
                </div>
            </div>
        </div>
    );
};

const TenantDashboard: React.FC<{ user: User, tenant?: Tenant, setActiveTab: (id: string) => void }> = ({ user, tenant, setActiveTab }) => (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
        <div className="bg-indigo-700 p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="relative z-10">
                <h1 className="text-3xl font-black mb-2">Hello, {user.name.split(' ')[0]}</h1>
                <p className="text-indigo-100 font-medium">Your residency at <span className="text-white font-bold">Amani Heights</span> is active.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Rent Amount</p>
                        <p className="text-2xl font-black">KSh {tenant?.rentAmount.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Amount Due</p>
                        <p className="text-2xl font-black">KSh {tenant?.balance.toLocaleString() || '0'}</p>
                    </div>
                    <div className={`p-6 rounded-3xl border backdrop-blur-md flex items-center justify-between ${tenant && tenant.balance <= 0 ? 'bg-emerald-400/20 border-emerald-400/30' : 'bg-amber-400/20 border-amber-400/30'}`}>
                        <div>
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Status</p>
                            <p className="text-xl font-black">{tenant && tenant.balance <= 0 ? 'Fully Paid' : 'Payment Due'}</p>
                        </div>
                        {tenant && tenant.balance <= 0 ? (
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        ) : (
                            <AlertCircle className="w-8 h-8 text-amber-400" />
                        )}
                    </div>
                </div>
            </div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1 & 2: Main Features */}
            <div className="lg:col-span-2 space-y-8">
                {/* Notice Board */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Megaphone className="w-5 h-5 text-indigo-600" /> Property Notices
                        </h3>
                        <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {NOTICES.map(notice => (
                            <div key={notice.id} className={`p-5 rounded-3xl border ${notice.priority === 'Urgent' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${notice.priority === 'Urgent' ? 'text-red-600' : 'text-slate-400'}`}>
                                        {notice.priority} • {notice.date}
                                    </span>
                                </div>
                                <h4 className="font-black text-slate-900 mb-1">{notice.title}</h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">{notice.content}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <QuickActionCard icon={<CreditCard />} label="Pay Rent" color="bg-emerald-600" onClick={() => setActiveTab('payments')} />
                    <QuickActionCard icon={<Wrench />} label="Report Fix" color="bg-orange-500" onClick={() => setActiveTab('maintenance')} />
                    <QuickActionCard icon={<MessageSquare />} label="Landlord Chat" color="bg-indigo-600" onClick={() => setActiveTab('messages')} />
                    <QuickActionCard icon={<Calendar />} label="View Lease" color="bg-slate-800" onClick={() => setActiveTab('leases')} />
                </div>
            </div>

            {/* Column 3: Utility and Residence Info */}
            <div className="space-y-8">
                {/* Utilities Card */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" /> Utility Status
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <Droplets className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">Water</p>
                                    <p className="text-[10px] text-slate-400 font-bold">Reading: 245.8 m³</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase">Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">Electricity</p>
                                    <p className="text-[10px] text-slate-400 font-bold">Reading: 1205 kWh</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase">Active</span>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-3 bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                        Usage Reports <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Property Rules Snippet */}
                <div className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100">
                    <div className="flex items-center gap-2 mb-4 text-indigo-700">
                        <Info className="w-5 h-5" />
                        <h4 className="text-sm font-black uppercase tracking-widest">House Rules</h4>
                    </div>
                    <ul className="space-y-3">
                        <li className="flex gap-2 text-xs font-bold text-indigo-600/80">
                            <span className="text-indigo-400">01</span> No noise after 10:00 PM
                        </li>
                        <li className="flex gap-2 text-xs font-bold text-indigo-600/80">
                            <span className="text-indigo-400">02</span> Guest registration required
                        </li>
                        <li className="flex gap-2 text-xs font-bold text-indigo-600/80">
                            <span className="text-indigo-400">03</span> Waste sorting is mandatory
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
);

// Fix: Changed icon prop type from React.ReactNode to React.ReactElement to ensure it's a clonable element and fix typing errors.
const QuickActionCard = ({ icon, label, color, onClick }: { icon: React.ReactElement, label: string, color: string, onClick?: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group w-full">
        <div className={`p-3 rounded-2xl text-white ${color} mb-3 shadow-lg`}>
            {React.cloneElement(icon, { className: 'w-5 h-5' })}
        </div>
        <span className="text-xs font-black text-slate-800 whitespace-nowrap">{label}</span>
    </button>
);

const StatCard = ({ title, value, icon, trend, trendUp }: { title: string, value: string, icon: React.ReactNode, trend: string, trendUp: boolean }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-100 transition-all">
        <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">{icon}</div>
        </div>
        <div className="space-y-1">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{title}</p>
            <h4 className="text-2xl font-black text-slate-900">{value}</h4>
        </div>
        <div className="mt-4 flex items-center gap-1.5">
            {trendUp ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-amber-500" />}
            <span className={`text-xs font-bold ${trendUp ? 'text-emerald-600' : 'text-amber-600'}`}>
                {trend}
            </span>
        </div>
    </div>
);
