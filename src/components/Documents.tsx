import React from 'react';
import { Folder, File, Download, Search, Upload, MoreVertical, FileCheck, FileText } from 'lucide-react';

const CATEGORIES = [
    { name: 'Lease Agreements', count: 12, icon: FileCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Inspection Reports', count: 45, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Utility Bills', count: 8, icon: File, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Property Photos', count: 124, icon: Folder, color: 'text-blue-600', bg: 'bg-blue-50' },
];

const RECENT_DOCS = [
    { id: '1', name: 'AmaniHeights_Unit101_MoveIn.pdf', size: '2.4 MB', date: 'May 12, 2024', type: 'PDF' },
    { id: '2', name: 'CampusCommons_Roof_Inspection.pdf', size: '5.1 MB', date: 'May 10, 2024', type: 'PDF' },
    { id: '3', name: 'Commercial_Lease_Template_v2.docx', size: '45 KB', date: 'May 05, 2024', type: 'DOCX' },
    { id: '4', name: 'Emergency_Contact_List.pdf', size: '120 KB', date: 'April 28, 2024', type: 'PDF' },
];

export const Documents: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Search & Upload */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-sm transition-colors">
                    <Upload className="w-4 h-4" /> Upload Document
                </button>
            </div>

            {/* Category Folders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {CATEGORIES.map((cat, idx) => {
                    const Icon = cat.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors cursor-pointer">
                            <div className={`p-3 rounded-xl w-fit ${cat.bg} ${cat.color} mb-4`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-slate-900">{cat.name}</h4>
                            <p className="text-sm text-slate-500 mt-1">{cat.count} documents</p>
                        </div>
                    );
                })}
            </div>

            {/* Recent Files Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Recent Documents</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Date Modified</th>
                                <th className="px-6 py-4">Size</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {RECENT_DOCS.map(doc => (
                                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <File className="w-5 h-5 text-slate-400" />
                                            <span className="font-semibold text-slate-800">{doc.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{doc.date}</td>
                                    <td className="px-6 py-4 text-slate-500">{doc.size}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                                                <MoreVertical className="w-4 h-4" />
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
