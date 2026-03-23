'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Loader2 } from 'lucide-react';
import { addAddress, updateAddress } from '@/lib/api';
import type { Address } from '@/lib/types';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  address?: Address | null;
}

export default function AddressModal({ isOpen, onClose, onSuccess, address }: AddressModalProps) {
  const [formData, setFormData] = useState({
    label: '',
    building_name: '',
    address_line1: '',
    address_line2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label,
        building_name: address.building_name || '',
        address_line1: address.address_line1,
        address_line2: address.address_line2 || '',
        landmark: address.landmark || '',
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        is_default: address.is_default,
      });
    } else {
      setFormData({
        label: '',
        building_name: '',
        address_line1: '',
        address_line2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false,
      });
    }
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (address) {
        await updateAddress(address.id, formData);
      } else {
        await addAddress(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600/10 text-red-600 rounded-2xl flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                  <h2 className="text-2xl font-serif font-black text-stone-900">
                    {address ? 'Edit Address' : 'Add New Address'}
                  </h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-stone-50 rounded-full text-stone-400 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Label (e.g. Home, Office)</label>
                    <input
                      required
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      placeholder="Home"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Building Name</label>
                    <input
                      value={formData.building_name}
                      onChange={(e) => setFormData({ ...formData, building_name: e.target.value })}
                      placeholder="Royal Residency"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Address Line 1</label>
                  <input
                    required
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    placeholder="Floor, House Number, Street"
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Address Line 2 (Optional)</label>
                    <input
                      value={formData.address_line2}
                      onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                      placeholder="Near Water Tank"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Landmark</label>
                    <input
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                      placeholder="Behind Central Mall"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">City</label>
                    <input
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Nashik"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">State</label>
                    <input
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Maharashtra"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Pincode</label>
                    <input
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="422001"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-600 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                  />
                  <label htmlFor="is_default" className="text-sm font-bold text-stone-700 cursor-pointer">
                    Set as default address
                  </label>
                </div>

                {error && (
                  <div className="text-red-600 text-[10px] font-black uppercase tracking-widest text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin mx-auto" />
                  ) : (
                    address ? 'Update Address' : 'Save Address'
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
