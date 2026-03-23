'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Pencil, Trash2, Loader2, 
  User as UserIcon, Shield, Mail, Phone, Calendar,
  Check, X, AlertTriangle, MoreVertical, Crown
} from 'lucide-react';
import { 
  adminFetchUsers, adminCreateUser, 
  adminUpdateUser, adminDeleteUser 
} from '@/lib/api';
import type { User } from '@/lib/types';
import AlertModal from '@/components/ui/AlertModal';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: number | null }>({
    isOpen: false,
    id: null
  });

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    is_admin: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await adminFetchUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user: User | null = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || '',
        password: '',
        is_admin: user.is_admin,
      });
    } else {
      setCurrentUser(null);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        is_admin: false,
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');
    try {
      if (currentUser?.id) {
        // Update
        const payload: any = {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || undefined,
          is_admin: formData.is_admin,
        };
        if (formData.password) payload.password = formData.password;
        
        await adminUpdateUser(currentUser.id, payload);
      } else {
        // Create
        await adminCreateUser(formData);
      }
      await load();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Action failed. Please check your inputs.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminDeleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      console.error('Delete failed:', err);
    }
  };

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">User Accounts</h1>
          <p className="text-stone-500 text-xs font-fira-code uppercase tracking-widest mt-1">
            <span className="text-red-500 font-black">{users.length}</span> Total Registered
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(220,38,38,0.2)] hover:shadow-[0_15px_30px_rgba(220,38,38,0.3)] transition-all duration-300 cursor-pointer active:scale-95"
        >
          <Plus size={18} className="transition-transform duration-300 group-hover:rotate-90" />
          Create User
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-red-600 transition-colors duration-300" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full bg-white/60 backdrop-blur-md border border-stone-200/60 rounded-[1.5rem] pl-16 pr-8 py-5 text-sm focus:outline-none focus:border-red-600/50 focus:ring-8 focus:ring-red-600/5 transition-all duration-300 font-medium placeholder-stone-400"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-[2.5rem] border-stone-100/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                <th className="text-left px-10 py-6">User Information</th>
                <th className="text-left px-6 py-6">Role</th>
                <th className="text-left px-6 py-6">Phone</th>
                <th className="text-left px-6 py-6">Member Since</th>
                <th className="text-right px-10 py-6">Ops</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode='popLayout'>
                {filtered.map((user) => (
                  <motion.tr 
                    key={user.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-stone-50 hover:bg-stone-50/50 transition-all duration-300 group"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl border border-stone-100 flex items-center justify-center text-stone-400 group-hover:border-red-100 group-hover:bg-red-50/30 transition-all duration-300">
                          <UserIcon size={20} className={user.is_admin ? "text-red-600" : "text-stone-400"} />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 group-hover:text-red-700 transition-colors duration-300">{user.full_name}</p>
                          <p className="text-[10px] font-medium text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                            <Mail size={10} /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-fira-code">
                      <div className="flex flex-col gap-2">
                        {user.is_superuser && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100 shadow-sm">
                            <Crown size={12} fill="currentColor" className="opacity-80" /> Super User
                          </span>
                        )}
                        {user.is_admin ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100/50 shadow-sm shadow-red-100/20">
                            <Shield size={12} fill="currentColor" className="opacity-80" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-500 rounded-full text-[10px] font-black uppercase tracking-wider border border-stone-200/50">
                            <UserIcon size={12} className="opacity-80" /> User
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-xs text-stone-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-stone-300" />
                        {user.phone || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-xs text-stone-500 font-medium font-fira-sans">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-stone-300" />
                        {new Date(user.member_since).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      {!user.is_superuser ? (
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={() => openModal(user)}
                            className="p-3 bg-white border border-stone-100 text-stone-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50/50 rounded-xl transition-all duration-300 shadow-sm shadow-stone-200/40 cursor-pointer"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleteModal({ isOpen: true, id: user.id })}
                            className="p-3 bg-white border border-stone-100 text-stone-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50/50 rounded-xl transition-all duration-300 shadow-sm shadow-stone-200/40 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest text-stone-300 select-none">
                          <Shield size={14} className="opacity-50" /> Immutable
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                    {currentUser ? 'Edit User' : 'Create User'}
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-3 hover:bg-stone-50 rounded-2xl transition-all cursor-pointer text-stone-400 hover:text-stone-900"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold font-fira-sans">
                      <AlertTriangle size={18} />
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600/30 transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600/30 transition-all font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-5">Phone (Optional)</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600/30 transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-5">
                        {currentUser ? 'New Password' : 'Password'}
                      </label>
                      <input
                        type="password"
                        required={!currentUser}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600/30 transition-all font-bold"
                        placeholder={currentUser ? 'Leave blank to keep current' : ''}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-stone-50 rounded-2xl border border-stone-100 select-none">
                    <div>
                      <p className="text-sm font-black text-stone-900 tracking-tight">Admin Access</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Grants full control over dashboard</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, is_admin: !formData.is_admin})}
                      className={`relative w-14 h-8 rounded-full transition-all duration-300 shadow-sm ${formData.is_admin ? 'bg-red-600' : 'bg-stone-300'}`}
                    >
                      <motion.div
                        animate={{ x: formData.is_admin ? 28 : 4 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  <button
                    disabled={modalLoading}
                    className="w-full flex items-center justify-center gap-3 py-5 bg-stone-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {modalLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={18} />
                        {currentUser ? 'Save Changes' : 'Create Account'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AlertModal
        isOpen={deleteModal.isOpen}
        title="Delete User"
        message="Are you sure you want to remove this user? This action can be reversed by an admin later but they will immediately lose access."
        onConfirm={async () => {
          if (deleteModal.id) {
            await handleDelete(deleteModal.id);
            setDeleteModal({ isOpen: false, id: null });
          }
        }}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
