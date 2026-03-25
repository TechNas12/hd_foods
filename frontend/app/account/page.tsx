'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, MapPin, Mail, Phone, Clock, Plus, ExternalLink, MessageSquare,
  ChevronRight, ShieldCheck, CheckCircle2, Truck, RotateCcw, XCircle, LogOut, Loader2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { logout, getSession } from '@/lib/auth';
import { fetchProfile, fetchMyOrders, createTicket, deleteAddress, setDefaultAddress } from '@/lib/api';
import type { User, OrderSummary, Address } from '@/lib/types';
import AddressModal from '@/components/AddressModal';
import type { OrderStatus } from '@/lib/accountData';

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [formState, setFormState] = useState({ subject: '', orderId: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    const session = await getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    try {
      const [profileData, ordersData] = await Promise.all([
        fetchProfile(),
        fetchMyOrders(),
      ]);
      setUser(profileData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load account:', err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createTicket({
        subject: formState.subject,
        message: formState.message,
        order_id: formState.orderId ? parseInt(formState.orderId) : undefined,
      });
      setIsSuccess(true);
      setFormState({ subject: '', orderId: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleAddressAction = async (action: 'delete' | 'default', id: number) => {
    if (processingIds.includes(id)) return;
    
    try {
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this address?')) return;
      }
      
      setProcessingIds(prev => [...prev, id]);
      
      if (action === 'delete') {
        await deleteAddress(id);
      } else {
        await setDefaultAddress(id);
      }
      await loadAccount();
    } catch (err) {
      console.error(`Failed to ${action} address:`, err);
    } finally {
      setProcessingIds(prev => prev.filter(pid => pid !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-red-600" />
      </div>
    );
  }

  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Processing': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Out for Delivery': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Cancelled': return 'bg-stone-100 text-stone-500 border-stone-200';
      default: return 'bg-stone-50 text-stone-600 border-stone-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle2 size={14} />;
      case 'Shipped': return <Truck size={14} />;
      case 'Processing': return <Clock size={14} />;
      case 'Out for Delivery': return <Package size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      default: return null;
    }
  };

  const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const memberSince = new Date(user.member_since).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Navbar />

      <main className="pt-32 pb-24">
        {/* Profile Header */}
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-10 bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.03)] border border-stone-100"
          >
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-red-600 rounded-full flex items-center justify-center text-white font-serif italic text-4xl md:text-5xl border-4 border-white/20 shadow-2xl shadow-stone-900/20">
                {initials}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-full border-4 border-white shadow-lg">
                <ShieldCheck size={20} />
              </div>
            </div>

            <div className="text-center md:text-left space-y-4">
              <div className="space-y-1">
                <span className="text-[8px] mb-4 font-black uppercase tracking-[0.3em] text-red-600 bg-red-600/10 px-3 py-1 rounded-full border border-red-600/20">
                  Member since {memberSince}
                </span>
                <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 pt-4">{user.full_name}</h1>
              </div>

              <div className="flex flex-col md:flex-row gap-4 md:gap-10">
                <div className="flex items-center justify-center md:justify-start gap-3 text-stone-500 font-medium">
                  <Mail size={18} className="text-stone-300" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center justify-center md:justify-start gap-3 text-stone-500 font-medium">
                    <Phone size={18} className="text-stone-300" />
                    {user.phone}
                  </div>
                )}
              </div>
            </div>

            <div className="md:ml-auto flex gap-4">
              <button className="px-8 py-4 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all cursor-pointer">
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-8 py-4 border border-red-600/20 text-red-600 hover:bg-red-600/5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all cursor-pointer flex items-center gap-2"
              >
                <LogOut size={14} />
                Log Out
              </button>
            </div>
          </motion.div>
        </section>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Side: Addresses & Enquiry */}
          <div className="lg:col-span-4 space-y-16">
            {/* Addresses */}
            <section className="space-y-10">
              <div className="flex items-end justify-between px-2">
                <h2 className="text-2xl font-serif font-bold text-stone-900">Saved Addresses</h2>
              </div>

              <div className="space-y-6">
                {user.addresses?.map((addr) => (
                  <motion.div
                    key={addr.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group bg-white p-8 rounded-3xl border border-stone-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.05)] transition-all relative overflow-hidden"
                  >
                    {addr.is_default && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl shadow-md">
                          Default
                        </div>
                      </div>
                    )}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-stone-50 rounded-lg text-stone-400 group-hover:bg-red-600/10 group-hover:text-red-600 transition-colors">
                            <MapPin size={16} />
                          </div>
                          <h3 className="font-serif text-lg font-bold text-stone-900">{addr.label}</h3>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {processingIds.includes(addr.id) ? (
                            <div className="p-2 text-stone-300">
                              <Loader2 size={16} className="animate-spin" />
                            </div>
                          ) : (
                            <>
                              {!addr.is_default && (
                                <button
                                  onClick={() => handleAddressAction('default', addr.id)}
                                  className="p-2 hover:bg-emerald-50 text-stone-400 hover:text-emerald-600 rounded-lg transition-all cursor-pointer"
                                  title="Set as Default"
                                >
                                  <ShieldCheck size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingAddress(addr);
                                  setIsAddressModalOpen(true);
                                }}
                                className="p-2 hover:bg-stone-100 text-stone-400 hover:text-stone-900 rounded-lg transition-all cursor-pointer"
                                title="Edit"
                              >
                                <ExternalLink size={16} />
                              </button>
                              <button
                                onClick={() => handleAddressAction('delete', addr.id)}
                                className="p-2 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                                title="Delete"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {addr.building_name && (
                          <p className="text-stone-900 font-serif font-bold text-sm tracking-tight">{addr.building_name}</p>
                        )}
                        <p className="text-stone-500 font-medium leading-relaxed text-sm">{addr.address_line1}</p>
                        {addr.address_line2 && (
                          <p className="text-stone-500 font-medium text-sm">{addr.address_line2}</p>
                        )}
                        {addr.landmark && (
                          <p className="text-stone-400 font-medium italic text-xs">Landmark: {addr.landmark}</p>
                        )}
                        <p className="text-stone-900 font-serif font-bold pt-2 text-sm">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setIsAddressModalOpen(true);
                  }}
                  className="w-full py-8 border-2 border-dashed border-stone-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-stone-300 hover:border-red-600/50 hover:text-red-600 hover:bg-red-600/5 transition-all group cursor-pointer"
                >
                  <div className="p-3 bg-stone-50 rounded-2xl group-hover:bg-red-600/10 group-hover:text-red-600 transition-all">
                    <Plus size={24} />
                  </div>
                  <span className="font-black uppercase tracking-widest text-[10px]">Add New Address</span>
                </button>
              </div>
            </section>

            {/* Enquiry Section */}
            <section className="bg-white p-10 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.05)] border border-stone-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-red-600/10 transition-colors" />
              <div className="mb-10 text-center relative z-10">
                <div className="w-16 h-16 bg-stone-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-stone-100">
                  <MessageSquare size={28} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Need Help?</h2>
                <p className="text-stone-500 font-medium text-sm leading-relaxed">Raise an enquiry for your orders or any general questions.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Subject</label>
                  <input
                    required
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    placeholder="e.g., Order Delayed"
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/5 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2 px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Related Order</label>
                  <select
                    value={formState.orderId}
                    onChange={(e) => setFormState({ ...formState, orderId: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600 cursor-pointer"
                  >
                    <option value="">None / General Inquiry</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>#{o.id} - ₹{o.total_amount}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="Describe your issue..."
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600 transition-all font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all cursor-pointer ${isSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-red-600 text-white shadow-red-600/20 hover:bg-red-700'
                    } disabled:opacity-50`}
                >
                  {isSubmitting ? 'Sending...' : isSuccess ? 'Ticket Raised!' : 'Submit Enquiry'}
                </button>
              </form>
            </section>
          </div>

          {/* Right Side: Orders */}
          <div className="lg:col-span-8">
            <section className="space-y-10">
              <div className="flex items-end justify-between px-2">
                <div className="space-y-1">
                  <h2 className="text-3xl font-serif font-bold text-stone-900">Your Orders</h2>
                  <p className="text-stone-500 font-medium">Tracking your heritage shipments</p>
                </div>
              </div>

              <div className="space-y-8">
                {orders.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[3rem] border border-stone-100">
                    <Package size={48} className="mx-auto text-stone-200 mb-6" />
                    <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">No orders yet</h3>
                    <p className="text-stone-400 font-medium">Start exploring our spice collection!</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-white rounded-[2.5rem] border border-stone-100 shadow-[0_10px_60px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_80px_rgba(0,0,0,0.06)] transition-all overflow-hidden"
                    >
                      <div className="p-8 md:px-12 md:py-10 flex flex-wrap items-center justify-between gap-8">
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <h3 className="text-xl font-serif font-bold text-stone-900">Order #{order.id}</h3>
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)} shadow-sm`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </div>
                          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                            Ordered on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>

                        <div className="flex items-center gap-10">
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Total Amount</p>
                            <p className="text-2xl font-black text-stone-900">₹{order.total_amount}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${order.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                              {order.payment_status}
                            </span>
                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                              {order.payment_method}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
      
      <AddressModal
        isOpen={isAddressModalOpen}
        address={editingAddress}
        onClose={() => setIsAddressModalOpen(false)}
        onSuccess={loadAccount}
      />
    </div>
  );
}
