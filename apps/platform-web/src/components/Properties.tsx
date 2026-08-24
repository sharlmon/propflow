import React, { useState } from 'react';
import {
  ChevronRight,
  Plus,
  Search,
  MapPin,
  X,
  Home,
  Briefcase,
  GraduationCap,
  Settings,
  Info,
} from 'lucide-react';
import { PropertyType, Role } from '../enums';
import type { Property, User } from '../types';

interface PropertiesProps {
  user: User;
  properties: Property[];
  addProperty: (p: Property) => void;
}

export const Properties: React.FC<PropertiesProps> = ({ user, properties, addProperty }) => {
  const [showModal, setShowModal] = useState(false);
  const [viewUnitsFor, setViewUnitsFor] = useState<Property | null>(null);
  const [manageProperty, setManageProperty] = useState<Property | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: PropertyType.RESIDENTIAL,
    units: '',
    amenities: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProp: Property = {
      id: `p${Date.now()}`,
      name: formData.name,
      address: formData.address,
      type: formData.type,
      units: parseInt(formData.units),
      amenities: formData.amenities.split(',').map((s) => s.trim()),
    };
    addProperty(newProp);
    setShowModal(false);
    setFormData({ name: '', address: '', type: PropertyType.RESIDENTIAL, units: '', amenities: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900">Add New Property</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Property Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Apartments"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    required
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Kilimani, Nairobi"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={PropertyType.RESIDENTIAL}>Residential</option>
                    <option value={PropertyType.COMMERCIAL}>Commercial</option>
                    <option value={PropertyType.STUDENT}>Student</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Total Units
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Amenities
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Pool, Gym, Smart Locks"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4"
              >
                Create Property
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Units Modal */}
      {viewUnitsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{viewUnitsFor.name}</h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                  Unit Inventory & Status
                </p>
              </div>
              <button
                onClick={() => setViewUnitsFor(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-2">
              {Array.from({ length: viewUnitsFor.units }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col items-center gap-2 group hover:border-indigo-200 transition-all cursor-pointer"
                >
                  <span className="text-xs font-black text-slate-400">#{101 + i}</span>
                  <div
                    className={`w-3 h-3 rounded-full ${i % 3 === 0 ? 'bg-emerald-500' : i % 3 === 1 ? 'bg-amber-500' : 'bg-slate-300'}`}
                  ></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {i % 3 === 0 ? 'Occupied' : i % 3 === 1 ? 'Maint' : 'Vacant'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 justify-center">
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div> Maintenance
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-300"></div> Vacant
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Manage Property Modal */}
      {manageProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900">Manage {manageProperty.name}</h3>
              <button
                onClick={() => setManageProperty(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <button className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between hover:border-indigo-600 transition-all group text-left">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900">Portfolio Configuration</p>
                    <p className="text-xs text-slate-400 font-medium">Auto-renewals, late fees, and rules.</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between hover:border-indigo-600 transition-all group text-left">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900">Property Details</p>
                    <p className="text-xs text-slate-400 font-medium">Update address, type, and amenities.</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <button className="w-full mt-10 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-sm hover:bg-red-100 transition-all">
              Remove Property from Cloud
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search properties..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
          />
        </div>
        {user.role === Role.LANDLORD && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-sm shadow-lg shadow-indigo-100 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Property
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group"
          >
            <div className="h-56 bg-slate-200 relative overflow-hidden">
              <img
                src={`https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80&sig=${property.id}`}
                alt={property.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-6 left-6 flex gap-2">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-sm">
                  {property.type}
                </span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-black text-slate-900 leading-tight">{property.name}</h3>
                <div className="p-2 bg-slate-50 rounded-xl">
                  {property.type === PropertyType.RESIDENTIAL ? (
                    <Home className="w-5 h-5 text-indigo-600" />
                  ) : property.type === PropertyType.COMMERCIAL ? (
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
              </div>
              <p className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">
                <MapPin className="w-3.5 h-3.5" /> {property.address}
              </p>

              <div className="grid grid-cols-2 gap-4 py-6 border-t border-b border-slate-50 mb-6">
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                    Total Units
                  </p>
                  <p className="text-xl font-black text-slate-900">{property.units}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                    Amenities
                  </p>
                  <p className="text-xs font-bold text-indigo-600 truncate">
                    {property.amenities.join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setViewUnitsFor(property)}
                  className="flex-1 py-3.5 text-xs font-black uppercase tracking-widest border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors text-slate-600"
                >
                  View Units
                </button>
                <button
                  onClick={() => setManageProperty(property)}
                  className="flex-1 py-3.5 text-xs font-black uppercase tracking-widest bg-slate-900 text-white rounded-2xl hover:bg-black transition-colors shadow-lg shadow-slate-200"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
