'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Star, Filter, ChevronDown, Search, ArrowRight, BadgePercent, Wheat, Flame, Droplets, Zap, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchProducts } from '@/lib/api';
import type { ProductSummary } from '@/lib/types';

const filters = [
  { name: 'All', icon: null },
  { name: 'thepla', label: 'Theplas', icon: Wheat },
  { name: 'masala', label: 'Pure Spices', icon: Flame },
  { name: 'pickles', label: 'Pickles', icon: Droplets },
  { name: 'snacks', label: 'Snacks', icon: Zap },
];

const categoryIcons: { [key: string]: any } = {
  'thepla': Wheat,
  'masala': Flame,
  'pickles': Droplets,
  'snacks': Zap,
};

const categoryLabels: Record<string, string> = {
  'thepla': 'Theplas',
  'masala': 'Pure Spices',
  'pickles': 'Pickles',
  'snacks': 'Snacks',
};

export default function ProductsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, [activeFilter]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: { category?: string; search?: string; limit?: number } = { limit: 50 };
      if (activeFilter !== 'All') params.category = activeFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const data = await fetchProducts(params);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const getProductImage = (product: ProductSummary) => {
    const hero = product.images?.find(img => img.is_hero);
    return hero?.image_url || product.images?.[0]?.image_url || 'https://picsum.photos/seed/default/600/400';
  };

  return (
    <main className="min-h-screen bg-stone-50 selection:bg-orange-100 selection:text-stone-900">
      <Navbar />

      <div className="pt-40 pb-32 max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <header className="mb-16">
          <motion.nav
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 mb-8"
          >
            <Link href="/" className="hover:text-red-600 transition-colors cursor-pointer">Home</Link>
            <span>/</span>
            <span className="text-stone-900">Our Spices</span>
          </motion.nav>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-serif font-black text-stone-900 mb-8 leading-tight"
          >
            Pure <span className="italic font-light text-red-600">Essence</span> <br />
            of Tradition
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-stone-500 text-xl max-w-2xl leading-relaxed font-medium"
          >
            Explore our curated collection of handpicked spices and heritage blends, delivered from the heart of India to your doorstep.
          </motion.p>
        </header>

        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6 mb-16"
        >
          <form onSubmit={handleSearch} className="relative max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-white border border-stone-200 rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/5 transition-all font-medium"
            />
          </form>

          <div className="flex flex-wrap items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
            {filters.map((filter) => (
              <motion.button
                key={filter.name}
                onClick={() => setActiveFilter(filter.name)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 px-6 py-3.5 border transition-all whitespace-nowrap rounded-2xl text-[11px] font-black uppercase tracking-widest cursor-pointer shadow-sm ${activeFilter === filter.name
                  ? 'bg-stone-900 border-stone-900 text-white shadow-stone-900/20 shadow-lg'
                  : 'bg-white border-stone-200 text-stone-600 hover:border-red-600 hover:text-red-600'
                  }`}
              >
                {filter.label || filter.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-12 flex justify-between items-end border-b border-stone-200 pb-8"
        >
          <div>
            <h2 className="text-3xl font-serif font-bold text-stone-900">
              {loading ? '...' : `${products.length} Varieties Found`}
            </h2>
            <p className="text-xs font-black uppercase tracking-widest text-stone-400 mt-2">
              {activeFilter === 'All' ? 'Showing all premium collections' : `Filtered by ${categoryLabels[activeFilter] || activeFilter}`}
            </p>
          </div>
        </motion.div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 size={40} className="animate-spin text-red-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 4) * 0.1, duration: 0.6 }}
                  className="group cursor-pointer"
                >
                  <Link href={`/products/${product.slug}`}>
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] transition-all duration-700 group-hover:-translate-y-3">
                      <Image
                        src={getProductImage(product)}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />

                      {/* Badges */}
                      <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                        {product.original_price && product.original_price > product.base_price && (
                          <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5"
                          >
                            <BadgePercent size={14} />
                            {Math.round(((Number(product.original_price) - Number(product.base_price)) / Number(product.original_price)) * 100)}% OFF
                          </motion.div>
                        )}
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="ml-auto flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-stone-900 px-3 py-1.5 rounded-full text-[12px] font-black shadow-lg"
                        >
                          <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                          <span>{Number(product.rating).toFixed(1)}</span>
                        </motion.div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="px-2 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-serif font-bold text-stone-900 group-hover:text-red-600 transition-colors leading-tight">
                            {product.name}
                          </h3>
                          {product.subtitle && (
                            <p className="text-[10px] font-medium text-stone-500 italic">
                              {product.subtitle}
                            </p>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ x: 3, color: "#DC2626" }}
                          className="mt-2 text-stone-300 transition-colors cursor-pointer"
                        >
                          <ArrowRight size={20} />
                        </motion.button>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-black text-stone-900">₹{product.base_price}</span>
                        {product.original_price && (
                          <span className="text-xs text-stone-400 line-through decoration-stone-300/60 font-bold">
                            ₹{product.original_price}
                          </span>
                        )}
                      </div>

                      {/* Category icon */}
                      <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        {(() => {
                          const Icon = categoryIcons[product.slug?.split('-')[0]] || Filter;
                          return <Icon size={14} className="text-red-600/50" />;
                        })()}
                        <span className="truncate">{categoryLabels[activeFilter] || 'All'}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
