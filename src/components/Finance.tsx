import React from 'react';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

export const Finance: React.FC = () => {
    return (
        <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm animate-in fade-in duration-500">
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="p-6 bg-indigo-50 rounded-3xl mb-6">
                    <BarChart3 className="w-12 h-12 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3">Financial Analytics</h2>
                <p className="text-slate-500 max-w-md mb-8">
                    Detailed expense tracking, tax reporting, and revenue forecasting features are coming soon.
                </p>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm">Download Report</button>
                    <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50">Sync Bank Account</button>
                </div>
            </div>
        </div>
    );
};
