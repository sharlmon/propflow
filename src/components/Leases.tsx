import React from 'react';
import { FileText } from 'lucide-react';
import type { User } from '../types';

export const Leases: React.FC<{ user: User }> = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Lease Agreements</h2>
          <p className="text-slate-500">Manage digital leases and contracts</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md">
          Create New Lease
        </button>
      </div>

      <div className="bg-white rounded-[32px] p-8 text-center border border-dashed border-slate-300">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-2">No Active Leases found in this view</h3>
        <p className="text-slate-500 max-w-sm mx-auto mb-6">
          Start by generating a lease for a tenant using our AI-powered legal assistant.
        </p>
        <button className="text-indigo-600 font-bold hover:underline">Browse Templates</button>
      </div>
    </div>
  );
};
