'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Search, Filter, ArrowUpDown, ExternalLink, 
  Map as MapIcon, Loader2, User as UserIcon, Navigation
} from 'lucide-react';
import { adminFetchDistances } from '@/lib/api';
import type { UserDistance } from '@/lib/types';

export default function AdminAddressesPage() {
  const [data, setData] = useState<UserDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'distance'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await adminFetchDistances();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch distances:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data
    .filter((item) => 
      item.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.addresses.some(addr => addr.city?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.full_name.localeCompare(b.full_name)
          : b.full_name.localeCompare(a.full_name);
      } else {
        const distA = a.avg_distance_km || 999999;
        const distB = b.avg_distance_km || 999999;
        return sortOrder === 'asc' ? distA - distB : distB - distA;
      }
    });

  const toggleSort = (type: 'name' | 'distance') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-600/10 text-red-600 rounded-2xl flex items-center justify-center">
                  <Navigation size={24} />
                </div>
                <div>
                  <h1 className="text-4xl font-serif font-black text-stone-900 tracking-tight">Logistics Dashboard</h1>
                  <p className="text-stone-500 font-medium">Tracking user distances from warehouse</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-red-600 transition-colors">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search user or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border-2 border-stone-100 focus:border-red-600/20 rounded-2xl py-3 pl-12 pr-6 text-sm font-medium focus:outline-none transition-all w-full md:w-64"
                />
              </div>

              <div className="flex bg-white p-1 rounded-2xl border-2 border-stone-100 shadow-sm">
                <button
                  onClick={() => toggleSort('name')}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                    sortBy === 'name' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <UserIcon size={14} />
                  By Name
                  {sortBy === 'name' && <ArrowUpDown size={12} className={sortOrder === 'desc' ? 'rotate-180' : ''} />}
                </button>
                <button
                  onClick={() => toggleSort('distance')}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                    sortBy === 'distance' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <MapPin size={14} />
                  By Distance
                  {sortBy === 'distance' && <ArrowUpDown size={12} className={sortOrder === 'desc' ? 'rotate-180' : ''} />}
                </button>
              </div>
            </div>
          </motion.div>
        </section>

      {/* Data Table */}
      <section>
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-stone-50 bg-stone-50/50">
                    <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">User Details</th>
                    <th className="px-6 py-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Addresses</th>
                    <th className="px-6 py-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Avg Distance</th>
                    <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filteredData.map((user) => (
                    <motion.tr 
                      key={user.user_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-stone-50/50 transition-colors"
                    >
                      <td className="px-10 py-10 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-red-600/10 group-hover:text-red-600 transition-colors font-serif font-black italic">
                            {user.full_name[0]}
                          </div>
                          <div>
                            <div className="font-serif font-bold text-stone-900 text-lg">{user.full_name}</div>
                            <div className="text-stone-400 text-xs font-medium">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-10">
                        <div className="space-y-4 max-w-md">
                          {user.addresses.map((addr) => (
                            <div key={addr.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm group-hover:shadow-md transition-all">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-600/5 px-2 py-1 rounded-lg">
                                  {addr.label}
                                </span>
                                {addr.distance_km && (
                                  <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1">
                                    <MapPin size={10} /> {addr.distance_km.toFixed(1)} km
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-medium text-stone-600 line-clamp-1">{addr.address_line1}</p>
                              {addr.maps_url && (
                                <a 
                                  href={addr.maps_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-blue-600 transition-colors"
                                >
                                  View on Google Maps <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-10 text-center">
                        {user.avg_distance_km ? (
                          <div className="inline-block">
                            <div className="text-2xl font-black text-stone-900">{user.avg_distance_km.toFixed(1)}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-stone-400">km Average</div>
                            <div className="h-1 w-full bg-stone-100 rounded-full mt-2 overflow-hidden">
                              <div 
                                className="h-full bg-red-600 rounded-full" 
                                style={{ width: `${Math.min(user.avg_distance_km / 10, 100)}%` }} 
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-stone-300 italic text-xs">No coords</span>
                        )}
                      </td>
                      <td className="px-10 py-10 text-right">
                        <button className="p-4 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10 cursor-pointer">
                          <MapIcon size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              
              {filteredData.length === 0 && (
                <div className="py-24 text-center">
                  <MapIcon size={48} className="mx-auto text-stone-200 mb-6" />
                  <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">No data found</h3>
                  <p className="text-stone-400 font-medium">Try adjusting your search or filters.</p>
                </div>
              )}
          </div>
        </div>
      </section>
    </div>
  );
}
