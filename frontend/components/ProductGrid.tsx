'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, BadgePercent, ArrowRight, Wheat, Flame, Droplets, Zap, Filter, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchProducts } from '@/lib/api';
import type { ProductSummary } from '@/lib/types';

const categoryIcons: { [key: string]: any } = {
  'thepla': Wheat,
  'masala': Flame,
  'pure spices': Flame,
  'pickles': Droplets,
  'snacks': Zap,
};

function ProductCardImage({ product }: { product: ProductSummary }) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = product.images?.length ? [...product.images].sort((a, b) => (a.is_hero ? -1 : (b.is_hero ? 1 : 0))) : [];

  useEffect(() => {
    if (!isHovered || images.length <= 1) {
      setIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  if (!images.length) {
    return (
      <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-300">
        <BadgePercent size={40} className="opacity-20" />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="popLayout">
        <motion.img
          key={`${product.id}-${index}`}
          src={images[index].image_url}
          alt={product.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
    </div>
  );
}

export default function ProductGrid() {
  const [activeTab, setActiveTab] = useState('All');
  const [allFeaturedProducts, setAllFeaturedProducts] = useState<ProductSummary[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'All') {
      setDisplayedProducts(allFeaturedProducts);
    } else {
      setDisplayedProducts(
        allFeaturedProducts.filter(p => p.category_rel?.slug === activeTab || p.category_rel?.name.toLowerCase() === activeTab.toLowerCase())
      );
    }
  }, [activeTab, allFeaturedProducts]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Fetch all featured products once
      const data = await fetchProducts({ is_featured: true, limit: 100 });
      setAllFeaturedProducts(data);

      // Extract unique categories from featured products
      const uniqueCategorySlugs = new Set<string>();
      data.forEach(p => {
        if (p.category_rel?.slug) {
          uniqueCategorySlugs.add(p.category_rel.slug);
        }
      });

      setCategories(['All', ...Array.from(uniqueCategorySlugs)]);
    } catch (err) {
      console.error('Failed to load initial featured products:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (slug: string) => {
    if (slug === 'All') return 'All';
    // Find a product with this category to get the display name
    const product = allFeaturedProducts.find(p => p.category_rel?.slug === slug);
    return product?.category_rel?.name || slug;
  };

  return (
    <section id="spices" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-red-600 font-black tracking-[0.3em] uppercase text-xs mb-6 block"
            >
              Peak Of Generational Taste
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-serif text-stone-900 leading-[1.15]"
            >
              Our Products
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
                <span className="relative z-10">{getCategoryLabel(tab)}</span>
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-stone-900 rounded-full shadow-[0_10px_20px_rgba(28,25,23,0.15)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 size={40} className="animate-spin text-red-600" />
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16"
          >
            <AnimatePresence mode="popLayout">
              {displayedProducts.map((product, index) => (
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
                  <Link href={`/products/${product.slug}`}>
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-stone-100 mb-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-all duration-700 group-hover:-translate-y-3">
                      <ProductCardImage product={product} />

                      {/* Shimmer overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

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
                          className="ml-auto flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-stone-900 px-3 py-1.5 rounded-full text-[12px] font-black shadow-lg border border-white/20"
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
                          <h3 className="text-2xl font-serif font-bold text-stone-900 group-hover:text-red-600 transition-colors leading-tight">
                            {product.name}
                          </h3>
                          {product.subtitle && (
                            <p className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                              {product.subtitle}
                            </p>
                          )}
                        </div>
                        <motion.div
                          whileHover={{ x: 3 }}
                          className="mt-2 text-stone-300 group-hover:text-red-600 transition-colors"
                        >
                          <ArrowRight size={20} />
                        </motion.div>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-stone-900">₹{product.base_price}</span>
                        {product.original_price && (
                          <span className="text-sm text-stone-400 line-through decoration-stone-300/60 decoration-2 font-bold">
                            ₹{product.original_price}
                          </span>
                        )}
                      </div>

                      {/* Category */}
                      <div className="flex items-center gap-2 bg-stone-100 px-2.5 py-1.5 rounded-xl border border-stone-200/50 min-w-0">
                        {(() => {
                          const categoryName = product.category_rel?.name || '';
                          const Icon = categoryIcons[categoryName.toLowerCase()] || categoryIcons[product.slug?.split('-')[0]] || Filter;
                          return <Icon size={14} className="text-red-600/50" />;
                        })()}
                        <span className="truncate">
                          {product.category_rel?.name || 'Product'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 text-center"
        >
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#DC2626", borderColor: "#DC2626" }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 border-2 border-stone-900 text-stone-900 font-black rounded-full hover:text-white transition-all uppercase tracking-[0.2em] text-xs cursor-pointer shadow-lg hover:shadow-[0_20px_40px_rgba(220,38,38,0.3)]"
            >
              View Full Collection
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
