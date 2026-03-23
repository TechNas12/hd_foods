'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { adminFetchTickets, adminUpdateTicketStatus } from '@/lib/api';
import type { EnquiryTicketSummary } from '@/lib/types';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<EnquiryTicketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await adminFetchTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId: number, newStatus: string) => {
    try {
      await adminUpdateTicketStatus(ticketId, newStatus);
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      setMessage(`Ticket #${ticketId} updated to ${newStatus}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const statusColors: Record<string, string> = {
    'Open': 'bg-amber-50 text-amber-700',
    'In Progress': 'bg-blue-50 text-blue-700',
    'Resolved': 'bg-emerald-50 text-emerald-700',
    'Closed': 'bg-stone-100 text-stone-500',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Enquiry Tickets</h1>
        <p className="text-stone-500 text-sm font-medium">{tickets.length} total tickets</p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      {/* Tickets List */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-black uppercase tracking-widest text-stone-400">
                <th className="text-left px-8 py-4">Ticket ID</th>
                <th className="text-left px-4 py-4">Subject</th>
                <th className="text-left px-4 py-4">Order</th>
                <th className="text-left px-4 py-4">Status</th>
                <th className="text-left px-4 py-4">Date</th>
                <th className="text-right px-8 py-4">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-stone-900">#{ticket.id}</td>
                  <td className="px-4 py-5 text-stone-700 font-medium">{ticket.subject}</td>
                  <td className="px-4 py-5 text-stone-500 text-sm">
                    {ticket.order_id ? `#${ticket.order_id}` : '—'}
                  </td>
                  <td className="px-4 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      statusColors[ticket.status] || 'bg-stone-100 text-stone-500'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-stone-500 text-sm">
                    {new Date(ticket.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-stone-600 focus:outline-none focus:border-red-600 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tickets.length === 0 && (
            <div className="text-center py-16 text-stone-400 font-medium">No support tickets yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
