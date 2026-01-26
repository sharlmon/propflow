import React, { useState } from 'react';
import { Search, Filter, Plus, Phone, Mail, Home, MoreVertical, X, User, Hash, Smartphone, MoreHorizontal } from 'lucide-react';
import { Role } from '../enums';
import type { Tenant, User as AppUser } from '../types';

interface TenantsProps {
    user: AppUser;
    tenants: Tenant[];
    addTenant: (t: Tenant) => void;
    setActiveTab: (id: string) => void;
}

export const Tenants: React.FC<TenantsProps> = ({ user, tenants, addTenant, setActiveTab }) => {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        unit: '',
        rent: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newTenant: Tenant = {
            id: `t${Date.now()}`,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            propertyId: 'p1',
            unitNumber: formData.unit,
            leaseStart: new Date().toISOString().split('T')[0],
            leaseEnd: '2025-12-31',
            rentAmount: parseFloat(formData.rent),
            balance: parseFloat(formData.rent),
            status: 'Active'
        };
        addTenant(newTenant);
        setShowModal(false);
        setFormData({ name: '', email: '', phone: '', unit: '', rent: '' });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">Add New Tenant</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. John Doe"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input
                                            required
                                            type="text"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="254..."
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Unit #</label>
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input
                                            required
                                            type="text"
                                            value={formData.unit}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                            placeholder="A-101"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Monthly Rent</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.rent}
                                        onChange={e => setFormData({ ...formData, rent: e.target.value })}
                                        placeholder="KSh"
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 mt-4"
                            >
                                Add Tenant & Send Invite
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Portfolio Tenants</h3>
                        <p className="text-sm text-slate-400 font-medium">Managing {tenants.length} residents across properties</p>
                    </div>
                    {user.role === Role.LANDLORD && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Tenant
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Tenant</th>
                                <th className="px-8 py-5">Unit</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Balance</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {tenants.map(tenant => (
                                <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900">{tenant.name}</p>
                                                <p className="text-xs text-slate-400 font-bold">{tenant.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-600">{tenant.unitNumber}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tenant.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {tenant.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 font-black text-slate-900">
                                        KSh {tenant.balance.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {tenant.balance > 0 && user.role === Role.LANDLORD && (
                                                <button
                                                    onClick={() => setActiveTab('payments')}
                                                    title="Request M-Pesa Payment"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black hover:bg-emerald-100 transition-all border border-emerald-100 uppercase tracking-widest"
                                                >
                                                    <Smartphone className="w-3.5 h-3.5" /> STK Push
                                                </button>
                                            )}
                                            <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
