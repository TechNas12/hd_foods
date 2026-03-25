'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { fetchAddresses, placeOrder, fetchPublicSettings } from '@/lib/api';
import { getSession } from '@/lib/auth';
import type { Address, StoreSettings } from '@/lib/types';
import AddressModal from '@/components/AddressModal';
import { Plus } from 'lucide-react';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    checkAuthAndLoadAddresses();
  }, []);

  const checkAuthAndLoadAddresses = async () => {
    const session = await getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    try {
      const [addrs, sets] = await Promise.all([
        fetchAddresses(),
        fetchPublicSettings()
      ]);
      setAddresses(addrs);
      setSettings(sets);
      const defaultAddr = addrs.find(a => a.is_default);
      setSelectedAddress(defaultAddr?.id || addrs[0]?.id || null);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  let shipping = 0;
  let isBeyondDelivery = false;
  
  if (settings && selectedAddress) {
    const addr = addresses.find(a => a.id === selectedAddress);
    if (addr?.lat && addr?.lng && settings.warehouse_lat && settings.warehouse_lng) {
      const distance = getDistance(settings.warehouse_lat, settings.warehouse_lng, addr.lat, addr.lng);
      if (distance <= settings.free_delivery_km) {
        shipping = 0;
      } else if (distance <= settings.tier1_delivery_km) {
        shipping = settings.tier1_delivery_fee;
      } else {
        isBeyondDelivery = true;
        shipping = 0;
      }
    } else {
      // Fallback if no coordinates
      shipping = cartTotal > 499 ? 0 : 50; 
    }
  } else {
    shipping = cartTotal > 499 ? 0 : 50;
  }

  const grandTotal = Number(cartTotal) + (items.length > 0 ? Number(shipping) : 0);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a shipping address');
      return;
    }
    setError('');
    setIsProcessing(true);

    try {
      await placeOrder({
        address_id: selectedAddress,
        payment_method: paymentMethod,
        items: items.map(item => ({
          product_id: item.productId,
          variant_id: item.variantId || undefined,
          quantity: item.quantity,
        })),
      });

      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();

      setTimeout(() => {
        router.push('/account');
      }, 4000);
    } catch (err: any) {
      setIsProcessing(false);
      setError(err.message || 'Failed to place order. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white max-w-lg w-full rounded-[3rem] p-16 text-center shadow-[0_30px_100px_rgba(0,0,0,0.05)] border border-emerald-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
          >
            <CheckCircle2 size={48} />
          </motion.div>
          <h1 className="text-4xl font-serif font-black text-stone-900 mb-4">Order Confirmed!</h1>
          <p className="text-stone-500 font-medium text-lg mb-8 leading-relaxed">
            Thank you for your purchase. Your authentic spices will reach you soon.
          </p>
          <div className="text-[10px] font-black uppercase tracking-widest text-stone-400 bg-stone-50 py-3 rounded-xl">
            Redirecting to your account...
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-4">Your cart is empty</h1>
          <Link href="/products">
            <button className="text-red-600 font-bold uppercase text-[10px] tracking-widest hover:text-red-700 cursor-pointer">
              Return to Shop
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-center">
        <Link href="/cart" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-red-600 group transition-colors cursor-pointer">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Cart
        </Link>
        <div className="text-xl font-serif font-black text-stone-900 select-none">
          Secure Checkout
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left: Details */}
        <div className="lg:col-span-7 space-y-12">

          {/* Shipping Address */}
          <section className="bg-white p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-stone-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-stone-50 text-red-600 rounded-xl flex items-center justify-center border border-stone-100">
                <MapPin size={20} />
              </div>
              <h2 className="text-2xl font-serif font-black text-stone-900">Shipping Address</h2>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-stone-100 rounded-[2rem] bg-stone-50/50">
                <p className="text-stone-500 font-medium mb-6">No saved addresses found.</p>
                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
                >
                  <Plus size={14} /> Add Shipping Address
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr.id)}
                      className={`p-8 rounded-[2rem] border-2 cursor-pointer transition-all relative overflow-hidden ${
                        selectedAddress === addr.id
                          ? 'border-red-600 bg-stone-50 shadow-md ring-4 ring-red-600/5'
                          : 'border-stone-100 bg-white hover:border-red-600/30 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <span className="font-serif font-black text-stone-900 text-lg uppercase tracking-tight">{addr.label}</span>
                          {addr.is_default && (
                            <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-100">Default</span>
                          )}
                        </div>
                        {selectedAddress === addr.id && (
                          <CheckCircle2 size={24} className="text-red-600" />
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {addr.building_name && (
                          <p className="text-stone-900 font-bold text-sm">{addr.building_name}</p>
                        )}
                        <p className="text-stone-500 font-medium text-sm leading-relaxed">{addr.address_line1}</p>
                        {addr.address_line2 && (
                          <p className="text-stone-500 font-medium text-sm">{addr.address_line2}</p>
                        )}
                        <p className="text-stone-900 font-serif font-black pt-3 text-sm">{addr.city}, {addr.state} — {addr.pincode}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="w-full py-6 border-2 border-dashed border-stone-200 rounded-[2rem] flex items-center justify-center gap-3 text-stone-400 hover:border-red-600/50 hover:text-red-600 hover:bg-stone-50 transition-all group cursor-pointer"
                >
                  <Plus size={18} />
                  <span className="font-black uppercase tracking-widest text-[10px]">Add Different Address</span>
                </button>
              </div>
            )}
          </section>

          {/* Payment Method */}
          <section className="bg-white p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-stone-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-stone-50 text-red-600 rounded-xl flex items-center justify-center border border-stone-100">
                <CreditCard size={20} />
              </div>
              <h2 className="text-2xl font-serif font-black text-stone-900">Payment Option</h2>
            </div>

            <div className="space-y-4">
              {[
                { value: 'UPI', label: 'UPI / Google Pay' },
                { value: 'COD', label: 'Cash on Delivery' },
              ].map((method) => (
                <div
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === method.value
                      ? 'border-red-600 bg-stone-50 shadow-sm'
                      : 'border-stone-100 bg-white hover:border-red-600/30'
                  }`}
                >
                  <span className="font-bold text-stone-900">{method.label}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.value ? 'border-red-600' : 'border-stone-200'}`}>
                    {paymentMethod === method.value && <div className="w-3 h-3 bg-red-600 rounded-full" />}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-5 sticky top-12">
          <div className="bg-stone-900 text-white p-10 rounded-[3rem] shadow-2xl space-y-8">
            <h3 className="text-2xl font-serif font-bold text-white/90">Order Summary</h3>

            <div className="space-y-4 max-h-60 overflow-y-auto pr-4 custom-scrollbar">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full opacity-80" />
                    </div>
                    <div>
                      <p className="font-bold text-white/90">{item.name}</p>
                      <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold text-white/90">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="h-px bg-white/10" />

            <div className="space-y-4 text-white/60 font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white/90">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping</span>
                <span className="text-white/90 text-right">
                  {isBeyondDelivery 
                    ? <span className="text-amber-400 text-[10px] tracking-widest uppercase bg-amber-400/10 px-2 py-1 rounded">Will be communicated</span>
                    : (shipping === 0 ? 'Free' : `₹${shipping}`)}
                </span>
              </div>
            </div>

            <div className="h-px bg-white/10" />

            <div className="flex justify-between items-end">
              <span className="text-white font-bold">Total</span>
              <span className="text-3xl font-black text-red-600">₹{grandTotal}</span>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-xs font-medium">
                {error}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing || !selectedAddress}
              className="w-full py-6 mt-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(220,38,38,0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:hover:bg-red-600"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Place Order
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 pt-2">
              <ShieldCheck size={14} className="text-white/40" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Encrypted & Secure</span>
            </div>
          </div>
        </div>
      </main>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSuccess={checkAuthAndLoadAddresses}
      />
    </div>
  );
}
