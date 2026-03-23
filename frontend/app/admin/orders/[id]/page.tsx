'use client';

import { useEffect, useState, use } from 'react';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { adminFetchOrders, adminUpdateOrderStatus, adminUpdatePaymentStatus } from '@/lib/api';
import type { Order } from '@/lib/types';

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPayment, setNewPayment] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const all = await adminFetchOrders();
      const found = all.find(o => o.id === parseInt(id));
      if (found) {
        setOrder(found);
        setNewStatus(found.status);
        setNewPayment(found.payment_status);
      }
    } catch (err) {
      console.error('Order not found:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!order || status === order.status) return;
    setSaving(true);
    try {
      await adminUpdateOrderStatus(order.id, status);
      setOrder({ ...order, status });
      setNewStatus(status);
      setMessage('Order status updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePayment = async (paymentStatus: string) => {
    if (!order || paymentStatus === order.payment_status) return;
    setSaving(true);
    try {
      await adminUpdatePaymentStatus(order.id, paymentStatus);
      setOrder({ ...order, payment_status: paymentStatus });
      setNewPayment(paymentStatus);
      setMessage('Payment status updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-red-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500 font-medium mb-4">Order not found</p>
        <Link href="/admin/orders" className="text-red-600 font-bold uppercase text-[10px] tracking-widest">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="p-2 hover:bg-stone-200 rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-stone-600" />
        </Link>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Order #{order.id}</h1>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      {/* Order Info */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 space-y-6">
        <h2 className="text-lg font-bold text-stone-900">Order Summary</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Amount</p>
            <p className="text-2xl font-black text-red-600">₹{order.total_amount}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Payment Method</p>
            <p className="text-lg font-bold text-stone-900">{order.payment_method}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Current Status</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
              order.status === 'Shipped' ? 'bg-blue-50 text-blue-700' :
              order.status === 'Processing' ? 'bg-amber-50 text-amber-700' :
              'bg-stone-100 text-stone-500'
            }`}>
              {order.status}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Date</p>
            <p className="text-sm font-bold text-stone-900">
              {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Update Status */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Manage Status</h2>
          {saving && <Loader2 size={16} className="animate-spin text-red-600" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Order Tracking</label>
            <select 
              value={newStatus} 
              onChange={e => handleUpdateStatus(e.target.value)}
              disabled={saving}
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-red-600 transition-all appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Payment Status</label>
            <select 
              value={newPayment} 
              onChange={e => handleUpdatePayment(e.target.value)}
              disabled={saving}
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-red-600 transition-all appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
