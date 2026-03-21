'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  Plus, 
  ExternalLink, 
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Truck,
  RotateCcw,
  XCircle,
  LogOut
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { mockUser, mockAddresses, mockOrders, OrderStatus } from '@/lib/accountData';
import { logout, isAuthenticated } from '@/lib/auth';

export default function AccountPage() {
  const [formState, setFormState] = useState({ subject: '', orderId: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      setIsLoadingAuth(false);
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center font-black uppercase tracking-widest text-stone-300">Loading Heritage...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormState({ subject: '', orderId: '', message: '' });
    setTimeout(() => setIsSuccess(false), 5000);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Processing': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Out for Delivery': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Cancelled': return 'bg-stone-100 text-stone-500 border-stone-200';
      default: return 'bg-stone-50 text-stone-600 border-stone-100';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return <CheckCircle2 size={14} />;
      case 'Shipped': return <Truck size={14} />;
      case 'Processing': return <Clock size={14} />;
      case 'Out for Delivery': return <Package size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      default: return null;
    }
  };

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
              <div className="w-32 h-32 md:w-40 md:h-40 bg-red-700 rounded-full flex items-center justify-center text-white font-serif italic text-4xl md:text-5xl border-4 border-yellow-500 shadow-2xl shadow-red-900/20">
                {mockUser.initials}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-full border-4 border-white shadow-lg">
                <ShieldCheck size={20} />
              </div>
            </div>
            
            <div className="text-center md:text-left space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                  Member since {mockUser.memberSince}
                </span>
                <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900">{mockUser.name}</h1>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 md:gap-10">
                <div className="flex items-center justify-center md:justify-start gap-3 text-stone-500 font-medium">
                  <Mail size={18} className="text-stone-300" />
                  {mockUser.email}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-stone-500 font-medium">
                  <Phone size={18} className="text-stone-300" />
                  {mockUser.phone}
                </div>
              </div>
            </div>

            <div className="md:ml-auto flex gap-4">
              <button className="px-8 py-4 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all cursor-pointer">
                Edit Profile
              </button>
              <button 
                onClick={handleLogout}
                className="px-8 py-4 border border-red-100 text-red-700 hover:bg-red-50 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all cursor-pointer flex items-center gap-2"
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
                <button className="text-red-700 hover:text-red-800 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all cursor-pointer">
                  See All <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-6">
                {mockAddresses.map((addr) => (
                  <motion.div
                    key={addr.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group bg-white p-8 rounded-3xl border border-stone-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.05)] transition-all relative overflow-hidden"
                  >
                    {addr.isDefault && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl shadow-md">
                          Default
                        </div>
                      </div>
                    )}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-stone-50 rounded-lg text-stone-400 group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                          <MapPin size={16} />
                        </div>
                        <h3 className="font-serif text-lg font-bold text-stone-900">{addr.label}</h3>
                      </div>
                      <div className="space-y-1">
                        <p className="text-stone-500 font-medium leading-relaxed">{addr.street}</p>
                        <p className="text-stone-500 font-medium">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                      <button className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-red-700 transition-colors pt-2">
                        Edit Address
                      </button>
                    </div>
                  </motion.div>
                ))}

                <button className="w-full py-8 border-2 border-dashed border-stone-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-stone-300 hover:border-red-200 hover:text-red-700 hover:bg-red-50/30 transition-all group cursor-pointer">
                  <div className="p-3 bg-stone-50 rounded-2xl group-hover:bg-red-100 group-hover:text-red-700 transition-all">
                    <Plus size={24} />
                  </div>
                  <span className="font-black uppercase tracking-widest text-[10px]">Add New Address</span>
                </button>
              </div>
            </section>

            {/* Enquiry Section */}
            <section className="bg-white p-10 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.05)] border border-red-100">
              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
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
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-700 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2 px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Related Order</label>
                  <select
                    value={formState.orderId}
                    onChange={(e) => setFormState({ ...formState, orderId: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-700 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="">None / General Inquiry</option>
                    {mockOrders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} - ₹{o.total}</option>
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
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-700 transition-all font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all cursor-pointer ${
                    isSuccess 
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                      : 'bg-red-700 text-white shadow-red-700/20 hover:bg-red-800'
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
                <div className="flex gap-2">
                   {['All', 'Processing', 'Delivered'].map((tab) => (
                     <button key={tab} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${tab === 'All' ? 'bg-stone-900 text-white shadow-lg' : 'bg-white text-stone-400 border border-stone-100 hover:bg-stone-50'}`}>
                       {tab}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-8">
                {mockOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-white rounded-[2.5rem] border border-stone-100 shadow-[0_10px_60px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_80px_rgba(0,0,0,0.06)] transition-all overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-8 md:px-12 md:py-10 flex flex-wrap items-center justify-between gap-8 border-b border-stone-50 group-hover:bg-stone-50/50 transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="text-xl font-serif font-bold text-stone-900">{order.id}</h3>
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)} shadow-sm`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Ordered on {order.date}</p>
                      </div>

                      <div className="flex items-center gap-10">
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Total Amount</p>
                          <p className="text-2xl font-black text-red-700">₹{order.total}</p>
                        </div>
                        <button className="p-4 bg-stone-50 rounded-2xl text-stone-400 group-hover:bg-red-700 group-hover:text-white transition-all shadow-sm">
                          <ExternalLink size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Order Content */}
                    <div className="p-8 md:px-12 md:py-10 bg-white group-hover:bg-stone-50/20 transition-colors">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Items Summary</h4>
                           <div className="divide-y divide-stone-50">
                             {order.items.map((item, idx) => (
                               <div key={idx} className="flex justify-between py-3 group/item">
                                 <span className="font-medium text-stone-600">{item.name} <span className="text-stone-300 ml-2">x{item.quantity}</span></span>
                                 <span className="font-bold text-stone-900">₹{item.price * item.quantity}</span>
                               </div>
                             ))}
                           </div>
                        </div>

                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.estimatedDelivery && (
                          <div className="bg-stone-50 rounded-3xl p-8 space-y-4 border border-stone-100 group-hover:bg-white transition-colors">
                            <div className="flex items-center gap-3 text-red-700">
                              <Truck size={20} />
                              <h4 className="text-xs font-black uppercase tracking-widest">Tracking Update</h4>
                            </div>
                            <p className="text-stone-600 font-medium">Your heritage spices are on the way! </p>
                            <div className="pt-2">
                               <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Estimated Delivery</p>
                               <p className="text-xl font-bold text-stone-900">{order.estimatedDelivery}</p>
                            </div>
                          </div>
                        )}

                        {order.status === 'Delivered' && (
                          <div className="bg-emerald-50/50 rounded-3xl p-8 flex items-center gap-6 border border-emerald-100 group-hover:bg-white transition-colors">
                            <div className="p-4 bg-emerald-500 text-white rounded-2xl">
                              <CheckCircle2 size={24} />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-black uppercase tracking-widest text-emerald-700">Delivered Successfully</h4>
                              <p className="text-emerald-600/70 text-sm font-medium">Enjoy the authentic taste of tradition.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
