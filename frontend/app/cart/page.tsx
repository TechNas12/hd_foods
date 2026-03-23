'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();

  const shipping = cartTotal > 999 ? 0 : 50;
  const grandTotal = cartTotal + (items.length > 0 ? shipping : 0);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 max-w-7xl mx-auto px-6 w-full">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 mb-4">Your Cart</h1>
          <p className="text-stone-500 font-medium">Review your heritage selections before checkout.</p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-stone-100 h-96 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-6">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-2xl font-serif font-black text-stone-900 mb-3">Your cart is empty</h2>
            <p className="text-stone-500 font-medium mb-8 max-w-md">Looks like you haven't added any spices to your cart yet. Discover our authentic blends.</p>
            <Link href="/products">
              <button className="bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors cursor-pointer active:scale-95">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, textShadow: '' }}
                    className="bg-white p-6 rounded-3xl border border-stone-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row gap-6 items-center"
                  >
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-3 text-center sm:text-left">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-stone-900">{item.name}</h3>
                        <p className="text-stone-500 font-medium text-sm">{item.variantName}</p>
                      </div>
                      <p className="text-lg font-black text-stone-900">₹{item.price}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-stone-500 hover:text-stone-900 cursor-pointer"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-black text-stone-900 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-stone-500 hover:text-stone-900 cursor-pointer"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-3 text-stone-300 hover:text-red-600 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-4 sticky top-32">
              <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-[0_20px_60px_rgba(0,0,0,0.04)] space-y-8">
                <h3 className="text-2xl font-serif font-bold text-stone-900">Order Summary</h3>
                
                <div className="space-y-4 text-stone-600 font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-stone-900">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-emerald-600 font-bold">Free</span> : `₹${shipping}`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[10px] text-stone-400 font-medium italic text-right mt-1">
                      Free shipping on orders over ₹999
                    </p>
                  )}
                </div>

                <div className="h-px bg-stone-100" />

                <div className="flex justify-between items-end">
                  <span className="text-stone-900 font-bold">Total</span>
                  <span className="text-3xl font-black text-stone-900">₹{grandTotal}</span>
                </div>

                <Link href="/checkout" className="block">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "#B91C1C" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 shadow-xl shadow-red-600/20 transition-all cursor-pointer"
                  >
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </motion.button>
                </Link>

                <div className="flex items-center justify-center gap-2 pt-4 opacity-60">
                  <ShoppingBag size={14} className="text-stone-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
