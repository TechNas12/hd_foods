'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CreditCard, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { mockAddresses } from '@/lib/accountData';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const router = useRouter();
  
  const [selectedAddress, setSelectedAddress] = useState(mockAddresses[0]?.id || null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const shipping = cartTotal > 999 ? 0 : 50;
  const grandTotal = cartTotal + (items.length > 0 ? shipping : 0);

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsSuccess(true);
    clearCart();
    
    // Redirect to account after viewing success
    setTimeout(() => {
      router.push('/account');
    }, 4000);
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

  // Redirect if cart is empty and not on success screen
  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-4">Your cart is empty</h1>
          <Link href="/products">
            <button className="text-red-700 font-bold uppercase text-[10px] tracking-widest hover:text-red-800">
              Return to Shop
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-center">
         <Link href="/cart" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-red-700 group transition-colors">
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
               <div className="w-10 h-10 bg-red-50 text-red-700 rounded-xl flex items-center justify-center">
                 <MapPin size={20} />
               </div>
               <h2 className="text-2xl font-serif font-black text-stone-900">Shipping Address</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {mockAddresses.map((addr) => (
                <div 
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id)}
                  className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${
                    selectedAddress === addr.id 
                      ? 'border-red-700 bg-red-50/10 shadow-md ring-4 ring-red-700/5' 
                      : 'border-stone-100 bg-white hover:border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-serif font-bold text-stone-900">{addr.label}</span>
                    {selectedAddress === addr.id && (
                      <CheckCircle2 size={20} className="text-red-700" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-stone-500 font-medium text-sm leading-relaxed">{addr.street}</p>
                    <p className="text-stone-500 font-medium text-sm">{addr.city}, {addr.pincode}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-stone-100">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-10 h-10 bg-red-50 text-red-700 rounded-xl flex items-center justify-center">
                 <CreditCard size={20} />
               </div>
               <h2 className="text-2xl font-serif font-black text-stone-900">Payment Option</h2>
            </div>
            
            <div className="space-y-4">
              {['UPI / Google Pay', 'Cash on Delivery'].map((method) => (
                <div 
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === method 
                      ? 'border-red-700 bg-red-50/10 shadow-sm' 
                      : 'border-stone-100 bg-white hover:border-red-200'
                  }`}
                >
                  <span className="font-bold text-stone-900">{method}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === method ? 'border-red-700' : 'border-stone-200'}`}>
                    {paymentMethod === method && <div className="w-3 h-3 bg-red-700 rounded-full" />}
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
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-white/90">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
            </div>

            <div className="h-px bg-white/10" />

            <div className="flex justify-between items-end">
              <span className="text-white font-bold">Total</span>
              <span className="text-3xl font-black text-red-500">₹{grandTotal}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing || !selectedAddress}
              className="w-full py-6 mt-4 bg-red-700 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(185,28,28,0.4)] transition-all cursor-pointer disabled:opacity-50 disabled:hover:bg-red-700"
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

       {/* Styled scrollbar for items list */}
       <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
