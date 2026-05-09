import React, { useState } from 'react';
import { MAINTENANCE_TICKETS } from '../constants';
import { TicketStatus, TicketPriority, Role } from '../enums';
import type { MaintenanceTicket, User } from '../types';
import {
  Plus,
  Search,
  Filter,
  Wrench,
  MoreVertical,
  MessageSquare,
  X,
  Hash,
  AlertTriangle,
} from 'lucide-react';
import { analyzeMaintenanceTriage } from '../services/geminiService';

interface MaintenanceProps {
  user: User;
}

export const Maintenance: React.FC<MaintenanceProps> = ({ user }) => {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(MAINTENANCE_TICKETS);
  const [showTriage, setShowTriage] = useState<string | null>(null);
  const [triageResult, setTriageResult] = useState<{ priority: string; advice: string } | null>(null);
  const [loadingTriage, setLoadingTriage] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    unit: user.role === Role.TENANT ? 'A-101' : '',
  });

  const handleTriage = async (description: string, id: string) => {
    setLoadingTriage(true);
    setShowTriage(id);
    const res = await analyzeMaintenanceTriage(description);
    setTriageResult(res);
    setLoadingTriage(false);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: MaintenanceTicket = {
      id: `t${Date.now()}`,
      propertyId: 'p1',
      unitId: formData.unit,
      title: formData.title,
      description: formData.description,
      status: TicketStatus.PENDING,
      priority: TicketPriority.MEDIUM,
      submittedAt: new Date().toISOString().split('T')[0],
    };
    setTickets([newTicket, ...tickets]);
    setShowCreateModal(false);
    setFormData({ title: '', description: '', unit: user.role === Role.TENANT ? 'A-101' : '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900">Report an Issue</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Summary</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Leaky sink, Broken door lock"
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the problem in detail..."
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Unit Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    required
                    readOnly={user.role === Role.TENANT}
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. A-101"
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold disabled:opacity-75"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 border border-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  If this is a life-threatening emergency (fire, flood, gas leak), please call emergency
                  services immediately.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-100 hover:bg-black transition-all active:scale-95 mt-2"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search work orders..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          {user.role === Role.LANDLORD && (
            <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl hover:bg-slate-50 text-slate-700 font-medium">
              <Filter className="w-4 h-4" /> Filters
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-sm shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> {user.role === Role.LANDLORD ? 'Create Work Order' : 'Report Issue'}
          </button>
        </div>
      </div>

      {/* Triage Modal */}
      {showTriage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <span className="bg-indigo-100 p-2 rounded-xl text-indigo-600">✨</span> AI Triage System
            </h3>
            {loadingTriage ? (
              <div className="py-10 text-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-slate-500 font-bold">Analyzing request severity...</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] uppercase font-black text-indigo-400 tracking-wider mb-2">
                    Suggested Priority
                  </p>
                  <p className="text-xl font-black text-indigo-900">{triageResult?.priority}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-2">
                    AI Recommendation
                  </p>
                  <p className="text-slate-700 leading-relaxed font-medium">{triageResult?.advice}</p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowTriage(null)}
                    className="flex-1 py-4 border border-slate-200 rounded-2xl font-black text-sm hover:bg-slate-50 transition-colors"
                  >
                    Dismiss
                  </button>
                  <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                    Assign Vendor
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ticket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all relative group"
          >
            <div className="flex justify-between items-start mb-6">
              <span
                className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${
                  ticket.priority === 'Emergency'
                    ? 'bg-red-100 text-red-700'
                    : ticket.priority === 'High'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-slate-100 text-slate-700'
                }`}
              >
                {ticket.priority} Priority
              </span>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <h4 className="text-xl font-black text-slate-900 mb-2">{ticket.title}</h4>
            <p className="text-sm text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">
              {ticket.description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Location
                </span>
                <span className="font-black text-slate-800">Unit {ticket.unitId}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Status
                </span>
                <span className="font-black text-indigo-600">{ticket.status}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-6">
              <div className="flex -space-x-2">
                {[1, 2].map((i) => (
                  <img
                    key={i}
                    src={`https://picsum.photos/32/32?sig=${ticket.id}${i}`}
                    className="w-8 h-8 rounded-full border-2 border-white"
                    alt="Vendor"
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTriage(ticket.description, ticket.id)}
                  className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="AI Triage"
                >
                  <Wrench className="w-5 h-5" />
                </button>
                <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
