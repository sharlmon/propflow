import React from 'react';
import { Search, Filter, Download, CreditCard, DollarSign, Calendar, ArrowUpRight, ArrowDownLeft, Wallet, History } from 'lucide-react';
import { PaymentMethod, Role } from '../enums';
import type { User, Tenant } from '../types';

interface PaymentsProps {
    user: User;
    tenants: Tenant[];
}

export const Payments: React.FC<PaymentsProps> = ({ user }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-600 p-6 rounded-[32px] text-white shadow-xl shadow-indigo-100">
                    <Wallet className="w-8 h-8 mb-4 opacity-80" />
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Total Collections</p>
                    <h3 className="text-3xl font-black">KSh 1.2M</h3>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <History className="w-8 h-8 mb-4 text-orange-500" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Pending Invoices</p>
                    <h3 className="text-3xl font-black text-slate-900">4</h3>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
                <CreditCard className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Payment Gateway Integration</h3>
                <p className="text-slate-500 mt-2">M-Pesa Express and Bank Transfer integration settings appear here.</p>
            </div>
        </div>
    );
};
