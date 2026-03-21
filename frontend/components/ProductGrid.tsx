'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, BadgePercent, ArrowRight, Wheat, Flame, Droplets, Zap, Filter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const products = [
  {
    id: 1,
    name: "Premium Turmeric Powder",
    subtitle: "Heritage Lakadong turmeric, high curcumin content",
    price: 149,
    compareAtPrice: 199,
    categories: "Pure Spices",
    image: "https://picsum.photos/seed/turmeric/600/800",
    rating: 4.8,
    isAd: true
  },
  {
    id: 2,
    name: "Authentic Garam Masala",
    subtitle: "Stone-ground blend of 12 premium whole spices",
    price: 199,
    compareAtPrice: 249,
    categories: "Pure Spices",
    image: "https://picsum.photos/seed/masala/600/800",
    rating: 4.9,
    isAd: false
  },
  {
    id: 3,
    name: "Kashmiri Red Chilli",
    subtitle: "Vibrant color, mild heat, sun-dried perfection",
    price: 179,
    compareAtPrice: 229,
    categories: "Pure Spices",
    image: "https://picsum.photos/seed/chilli/600/800",
    rating: 4.7,
    isAd: false
  },
  {
    id: 4,
    name: "Special Chai Masala",
    subtitle: "Aromatic blend with cardamom and ginger notes",
    price: 129,
    compareAtPrice: 159,
    categories: "Pure Spices",
    image: "https://picsum.photos/seed/chai/600/800",
    rating: 5.0,
    isAd: true
  },
  {
    id: 5,
    name: "Coriander Seeds",
    subtitle: "Whole roasted seeds for authentic curry base",
    price: 89,
    compareAtPrice: 119,
    categories: "Pure Spices",
    image: "https://picsum.photos/seed/coriander/600/800",
    rating: 4.6,
    isAd: false
  },
  {
    id: 6,
    name: "Black Pepper Whole",
    subtitle: "Bold Malabar peppercorns, intensely flavorful",
    price: 249,
    compareAtPrice: 349,
    categories: "Pure Spices",
    image: "https://picsum.photos/seed/pepper/600/800",
    rating: 4.9,
    isAd: false
  }
];

const categories = ['All', 'Pure Spices', 'Blends', 'Whole Spices'];

const categoryIcons: { [key: string]: any } = {
  'Theplas': Wheat,
  'Pure Spices': Flame,
  'Pickles': Droplets,
  'Chips': Zap,
};

export default function ProductGrid() {
  const [activeTab, setActiveTab] = useState('All');

  const filteredProducts = activeTab === 'All'
    ? products
    : products.filter(p => p.categories === activeTab);

  return (
    <section id="spices" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-red-700 font-black tracking-[0.3em] uppercase text-xs mb-6 block"
            >
              Our Signature Collection
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-serif text-stone-900 leading-[1.15]"
            >
              Bring the Authentic Flavors of India to Your Kitchen
            </motion.h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === tab ? 'text-white' : 'text-stone-500 hover:text-stone-900 bg-stone-50'
                  }`}
              >
                <span className="relative z-10">{tab}</span>
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-red-700 rounded-full shadow-[0_10px_20px_rgba(185,28,28,0.2)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  opacity: { duration: 0.2 },
                  layout: { type: "spring", bounce: 0.2, duration: 0.6 },
                  delay: index * 0.05
                }}
                className="group cursor-pointer"
              >
                <Link href={`/products/${product.id}`}>
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-stone-100 mb-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-all duration-700 group-hover:-translate-y-3">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />

                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Discount Badge */}
                    <div className="absolute top-6 right-6">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center gap-1.5 bg-red-700 text-white px-3 py-1.5 rounded-full text-[12px] font-black shadow-lg border border-white/10"
                      >
                        <BadgePercent className="w-4 h-4" />
                        <span>{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="px-2 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        {product.isAd && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-green-600 px-2 py-[2px] rounded-full uppercase tracking-wider shadow-sm">
                            Featured
                          </span>
                        )}
                        <h3 className="text-2xl font-serif font-black text-stone-900 group-hover:text-red-700 transition-colors leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-stone-500 font-medium leading-snug line-clamp-1">
                          {product.subtitle}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ x: 3, color: "#B91C1C" }}
                        className="mt-2 text-stone-300 transition-colors"
                      >
                        <ArrowRight size={20} />
                      </motion.button>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-red-700">₹{product.price}</span>
                      <span className="text-sm text-stone-400 line-through font-medium">₹{product.compareAtPrice}</span>
                    </div>

                    {/* Category */}
                    <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      {(() => {
                        const Icon = categoryIcons[product.categories] || Filter;
                        return <Icon size={14} className="text-red-700" />;
                      })()}
                      <span className="truncate">{product.categories}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 text-center"
        >
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#0C0A09" }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 border-2 border-stone-900 text-stone-900 font-black rounded-full hover:text-white transition-all uppercase tracking-[0.2em] text-sm cursor-pointer shadow-lg hover:shadow-2xl"
            >
              View All Products
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
