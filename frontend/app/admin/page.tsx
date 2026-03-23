'use client';

import React, { useEffect, useState, Fragment } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, DollarSign, TrendingUp, Loader2, Layers, ChevronDown, ChevronUp, MapPin, User } from 'lucide-react';
import { fetchProducts, adminFetchOrders, fetchCategories } from '@/lib/api';
import type { ProductSummary, Order, Category } from '@/lib/types';

export default function AdminDashboard() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const toggleOrder = (id: number) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [prods, ords, cats] = await Promise.all([
        fetchProducts({ limit: 100 }),
        adminFetchOrders(),
        fetchCategories(),
      ]);
      setProducts(prods);
      setOrders(ords);
      setCategories(cats);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-red-600" />
      </div>
    );
  }

  const totalRevenue = orders.filter(o => o.payment_status === 'Paid').reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingOrders = orders.filter(o => o.status === 'Processing').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'text-stone-600', iconBg: 'bg-stone-100' },
    { label: 'Categories', value: categories.length, icon: Layers, color: 'text-amber-700', iconBg: 'bg-amber-50' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-emerald-700', iconBg: 'bg-emerald-50' },
    { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-red-600', iconBg: 'bg-red-600/10' },
  ];

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-2xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon size={22} className={stat.color} />
              </div>
            </div>
            <p className="text-3xl font-black text-stone-900 mb-1">{stat.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-stone-100">
          <h3 className="text-xl font-bold text-stone-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-black uppercase tracking-widest text-stone-400">
                <th className="w-10 px-4 py-4"></th>
                <th className="text-left px-4 py-4">Order ID</th>
                <th className="text-left px-4 py-4">Status</th>
                <th className="text-left px-4 py-4">Payment</th>
                <th className="text-right px-8 py-4">Amount</th>
                <th className="text-left px-4 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {orders.slice(0, 10).map(order => (
                <Fragment key={order.id}>
                  <tr 
                    className={`hover:bg-stone-50/50 transition-colors cursor-pointer ${expandedOrderId === order.id ? 'bg-stone-50/80 shadow-inner' : ''}`}
                    onClick={() => toggleOrder(order.id)}
                  >
                    <td className="px-4 py-5 text-center">
                      {expandedOrderId === order.id ? (
                        <ChevronUp size={16} className="text-red-600" />
                      ) : (
                        <ChevronDown size={16} className="text-stone-400" />
                      )}
                    </td>
                    <td className="px-4 py-5 font-bold text-stone-900">#{order.id}</td>
                    <td className="px-4 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                        order.status === 'Shipped' ? 'bg-blue-50 text-blue-700' :
                        order.status === 'Processing' ? 'bg-amber-50 text-amber-700' :
                        'bg-stone-100 text-stone-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        order.payment_status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-stone-900">₹{order.total_amount}</td>
                    <td className="px-4 py-5 text-stone-500 text-sm">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>

                  {/* Expanded Summary Row */}
                  {expandedOrderId === order.id && (
                    <tr className="bg-stone-50/50">
                      <td colSpan={6} className="px-8 py-10">
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
                                      <td className="px-6 py-4 text-right font-bold text-stone-900">₹{Number(item.unit_price) * item.quantity}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-stone-50/30 border-t border-stone-100 font-bold">
                                  <tr>
                                    <td colSpan={3} className="px-6 py-3 text-right text-stone-500 uppercase text-[9px] tracking-widest">Subtotal</td>
                                    <td className="px-6 py-3 text-right text-stone-900">₹{(Number(order.total_amount) - 50).toFixed(2)}</td>
                                  </tr>
                                  <tr>
                                    <td colSpan={3} className="px-6 py-3 text-right text-stone-500 uppercase text-[9px] tracking-widest">Shipping</td>
                                    <td className="px-6 py-3 text-right text-stone-900">₹50.00</td>
                                  </tr>
                                  <tr className="text-lg bg-red-600/5">
                                    <td colSpan={3} className="px-6 py-4 text-right text-red-600 uppercase text-[10px] font-black tracking-widest">Grand Total</td>
                                    <td className="px-6 py-4 text-right text-red-600 font-black">₹{order.total_amount}</td>
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
                            <div className="bg-white rounded-2xl border border-stone-100 p-8 space-y-4 shadow-sm">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-stone-100 text-stone-600 rounded-lg">
                                  {order.address?.label || 'Direct'}
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
                                <p className="font-bold text-stone-900 leading-tight">{order.user?.full_name}</p>
                                <p className="text-xs text-stone-400 font-medium">{order.user?.email}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-16 text-stone-400 font-medium">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
