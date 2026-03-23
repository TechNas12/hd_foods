'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown, ChevronUp, MapPin, Package } from 'lucide-react';
import { adminFetchOrders, adminUpdateOrderStatus } from '@/lib/api';
import type { Order } from '@/lib/types';
import React from 'react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await adminFetchOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await adminUpdateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = ['All', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
  const orderStatuses = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  const filtered = statusFilter === 'All'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Orders Management</h1>
        <p className="text-stone-500 text-sm font-medium">{orders.length} total orders recorded</p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-3">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              statusFilter === status
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'bg-white text-stone-400 border border-stone-100 hover:bg-stone-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-black uppercase tracking-widest text-stone-400">
                <th className="text-left px-8 py-4 w-16"></th>
                <th className="text-left px-4 py-4">Order ID</th>
                <th className="text-left px-4 py-4">Status</th>
                <th className="text-left px-4 py-4">Payment</th>
                <th className="text-left px-4 py-4">Method</th>
                <th className="text-right px-4 py-4">Amount</th>
                <th className="text-left px-8 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map(order => (
                <React.Fragment key={order.id}>
                  <tr 
                    className={`hover:bg-stone-50/50 transition-colors cursor-pointer ${expandedOrderId === order.id ? 'bg-stone-50/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]' : ''}`}
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  >
                    <td className="px-8 py-5">
                      <div className={`transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-180' : ''}`}>
                        <ChevronDown size={18} className="text-stone-400" />
                      </div>
                    </td>
                    <td className="px-4 py-5 font-bold text-stone-900">#{order.id}</td>
                    <td className="px-4 py-5" onClick={(e) => e.stopPropagation()}>
                      <div className="relative group w-fit min-w-[140px]">
                        {updatingId === order.id ? (
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-stone-400">
                            <Loader2 size={12} className="animate-spin" /> Updating...
                          </div>
                        ) : (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`appearance-none bg-transparent pl-3 pr-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all cursor-pointer focus:outline-none focus:ring-0 w-full ${
                              order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              order.status === 'Processing' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              order.status === 'Out for Delivery' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                              'bg-stone-100 text-stone-500 border-stone-100'
                            }`}
                          >
                            {orderStatuses.map(s => (
                              <option key={s} value={s} className="bg-white text-stone-900 font-sans tracking-normal capitalize py-2">
                                {s}
                              </option>
                            ))}
                          </select>
                        )}
                        {!updatingId && (
                          <ChevronDown 
                            size={12} 
                            className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50`} 
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-5 font-medium text-stone-600">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        order.payment_status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-stone-500 text-sm font-medium uppercase tracking-tighter">{order.payment_method}</td>
                    <td className="px-4 py-5 text-right font-black text-stone-900">₹{order.total_amount}</td>
                    <td className="px-8 py-5 text-stone-400 text-xs font-medium">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                  
                  {/* Expanded Summary Row */}
                  {expandedOrderId === order.id && (
                    <tr className="bg-stone-50/50">
                      <td colSpan={7} className="px-8 py-10">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                        >
                          {/* Order Items */}
                          <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                              <Package size={16} className="text-stone-400" />
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Order Items</h4>
                            </div>
                            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-stone-50/50 border-b border-stone-100">
                                  <tr className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                                    <th className="text-left px-6 py-3">Product</th>
                                    <th className="text-center px-4 py-3">Qty</th>
                                    <th className="text-right px-4 py-3">Price</th>
                                    <th className="text-right px-6 py-3">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                  {order.items.map((item) => (
                                    <tr key={item.id}>
                                      <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                          <span className="font-bold text-stone-900">{item.product?.name || 'Deleted Product'}</span>
                                          {item.variant ? (
                                            <span className="text-[10px] text-stone-400 font-bold uppercase">{item.variant.name}</span>
                                          ) : item.variant_id && (
                                            <span className="text-[10px] text-stone-400 font-bold uppercase">Variant #{item.variant_id}</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 text-center font-medium text-stone-600">{item.quantity}</td>
                                      <td className="px-4 py-4 text-right text-stone-500 font-medium">₹{item.unit_price}</td>
                                      <td className="px-6 py-4 text-right font-bold text-stone-900">₹{item.unit_price * item.quantity}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-stone-50/30 border-t border-stone-100 font-bold">
                                  <tr>
                                    <td colSpan={3} className="px-6 py-3 text-right text-stone-500 uppercase text-[9px] tracking-widest">Subtotal</td>
                                    <td className="px-6 py-3 text-right text-stone-900">₹{order.subtotal}</td>
                                  </tr>
                                  <tr>
                                    <td colSpan={3} className="px-6 py-3 text-right text-stone-500 uppercase text-[9px] tracking-widest">Shipping</td>
                                    <td className="px-6 py-3 text-right text-stone-900">₹{order.shipping_fee}</td>
                                  </tr>
                                  <tr className="text-lg bg-red-600/5">
                                    <td colSpan={3} className="px-6 py-4 text-right text-red-600 uppercase text-[10px] font-black tracking-widest">Grand Total</td>
                                    <td className="px-6 py-4 text-right text-red-600 font-black font-serif">₹{order.total_amount}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>

                          {/* Shipping Details */}
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                              <MapPin size={16} className="text-stone-400" />
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Shipping Details</h4>
                            </div>
                            <div className="bg-white rounded-2xl border border-stone-100 p-8 space-y-4">
                              <div className="flex items-center gap-3 mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-stone-100 text-stone-600 rounded-lg">
                                  {order.address?.label}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {order.address?.building_name && (
                                  <p className="font-bold text-stone-900 text-sm">{order.address.building_name}</p>
                                )}
                                <p className="text-stone-500 font-medium text-sm leading-relaxed">{order.address?.address_line1}</p>
                                {order.address?.address_line2 && (
                                  <p className="text-stone-500 font-medium text-sm">{order.address.address_line2}</p>
                                )}
                                {order.address?.landmark && (
                                  <p className="text-stone-400 italic text-xs pt-1">Lnd: {order.address.landmark}</p>
                                )}
                                <p className="text-stone-900 font-black pt-3 text-sm tracking-tight">{order.address?.city}, {order.address?.state} — {order.address?.pincode}</p>
                              </div>

                              <div className="pt-6 border-t border-stone-50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-1">Customer</p>
                                <p className="font-bold text-stone-900">{order.user?.full_name}</p>
                                <p className="text-xs text-stone-400 font-medium">{order.user?.email}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-stone-50/30">
              <p className="text-stone-400 font-medium italic">No orders found matching the current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
