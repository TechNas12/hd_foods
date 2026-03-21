'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Star, Clock, Filter, ChevronDown, Search, ArrowRight, BadgePercent, Wheat, Flame, Droplets, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';


const filters = [
  { name: 'Filter', icon: Filter },
  { name: 'Sort By', icon: ChevronDown },
  { name: 'Fast Delivery', isNew: true },
  { name: 'Theplas', icon: Wheat },
  { name: 'Pure Spices', icon: Flame },
  { name: 'Pickles', icon: Droplets },
  { name: 'Chips', icon: Zap },
];

const products = [
  {
    id: 1,
    name: "Methi Thepla",
    rating: 4.8,
    price: 149,
    compareAtPrice: 199,
    categories: "Theplas",
    subtitle: "Soft, spiced & ready-to-eat fenugreek flatbread",
    image: "https://picsum.photos/seed/thepla/600/400",
    isAd: true
  },
  {
    id: 2,
    name: "Authentic Garam Masala",
    rating: 4.9,
    price: 199,
    compareAtPrice: 299,
    categories: "Pure Spices",
    subtitle: "Heritage blend of 12 whole spices, stone-ground",
    image: "https://picsum.photos/seed/masala_p/600/400",
    isAd: false
  },
  {
    id: 3,
    name: "Mango Pickle (Achar)",
    rating: 4.7,
    price: 249,
    compareAtPrice: 349,
    categories: "Pickles",
    subtitle: "Tangy raw mango in mustard oil, grandma's recipe",
    image: "https://picsum.photos/seed/pickle/600/400",
    isAd: true
  },
  {
    id: 4,
    name: "Banana Chips (Yellow)",
    rating: 5.0,
    price: 129,
    compareAtPrice: 179,
    categories: "Chips",
    subtitle: "Crispy Kerala-style chips, lightly salted",
    image: "https://picsum.photos/seed/chips/600/400",
    isAd: false
  },
  {
    id: 5,
    name: "Sada Thepla (Pack of 5)",
    rating: 4.6,
    price: 89,
    compareAtPrice: 149,
    categories: "Theplas",
    subtitle: "Plain Gujarati theplas, perfect for travel snacks",
    image: "https://picsum.photos/seed/thepla2/600/400",
    isAd: true
  },
  {
    id: 6,
    name: "Black Pepper Whole",
    rating: 4.9,
    price: 299,
    compareAtPrice: 399,
    categories: "Pure Spices",
    subtitle: "Bold Malabar peppercorns, hand-picked premium",
    image: "https://picsum.photos/seed/pepper_p/600/400",
    isAd: false
  },
  {
    id: 7,
    name: "Garlic Pickle",
    rating: 4.5,
    price: 139,
    compareAtPrice: 199,
    categories: "Pickles",
    subtitle: "Fiery garlic cloves in spicy oil, no preservatives",
    image: "https://picsum.photos/seed/garlic_p/600/400",
    isAd: true
  },
  {
    id: 8,
    name: "Potato Wafers",
    rating: 4.3,
    price: 159,
    compareAtPrice: 229,
    categories: "Chips",
    subtitle: "Thin-sliced, crunchy salted potato wafers",
    image: "https://picsum.photos/seed/wafers/600/400",
    isAd: false
  }
];

const categoryIcons: { [key: string]: any } = {
  'Theplas': Wheat,
  'Pure Spices': Flame,
  'Pickles': Droplets,
  'Chips': Zap,
};

export default function ProductsPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (name: string) => {
    setActiveFilters(prev =>
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    );
  };

  return (
    <main className="min-h-screen bg-stone-50 selection:bg-red-100 selection:text-red-900">
      <Navbar />

      <div className="pt-40 pb-32 max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <header className="mb-16">
          <motion.nav
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 mb-8"
          >
            <Link href="/" className="hover:text-red-700 transition-colors">Home</Link>
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

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center gap-4 mb-16 overflow-x-auto pb-4 no-scrollbar"
        >
          {filters.map((filter, i) => (
            <motion.button
              key={filter.name}
              onClick={() => toggleFilter(filter.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-3 px-6 py-3.5 border transition-all whitespace-nowrap rounded-2xl text-[11px] font-black uppercase tracking-widest cursor-pointer shadow-sm ${activeFilters.includes(filter.name)
                ? 'bg-red-700 border-red-700 text-white shadow-red-900/20 shadow-lg'
                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900'
                }`}
            >
              {filter.isNew && (
                <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded leading-none">NEW</span>
              )}
              {filter.name}
              {filter.icon && <filter.icon size={14} className={activeFilters.includes(filter.name) ? 'text-white' : 'text-stone-400'} />}
            </motion.button>
          ))}
        </motion.div>

        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-12 flex justify-between items-end border-b border-stone-200 pb-8"
        >
          <div>
            <h2 className="text-3xl font-serif font-bold text-stone-900">
              {products.length} Varieties Found
            </h2>
            <p className="text-xs font-black uppercase tracking-widest text-stone-400 mt-2">Showing all premium collections</p>
          </div>
          <div className="flex gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-stone-200 overflow-hidden">
                  <Image src={`https://picsum.photos/seed/${i + 10}/40/40`} alt="Avatar" width={40} height={40} />
                </div>
              ))}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-900">Join 5k+ Happy Customers</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Generational Taste</p>
            </div>
          </div>
        </motion.div>

        {/* Product Grid */}
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
                <Link href={`/products/${product.id}`}>
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] transition-all duration-700 group-hover:-translate-y-3">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />

                    {/* Discount Badge */}
                    <div className="absolute top-6 right-6">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center gap-1.5 bg-red-700 text-white px-3 py-1.5 rounded-full text-[12px] font-black shadow-lg"
                      >
                        <BadgePercent className="w-5 h-5" />
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
                        <h3 className="text-xl font-serif font-black text-stone-900 group-hover:text-red-700 transition-colors leading-tight">
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
        </div>

        {/* Load More Mock */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 flex flex-col items-center gap-6"
        >
          <div className="w-24 h-px bg-stone-200" />
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#0C0A09" }}
            whileTap={{ scale: 0.95 }}
            className="px-16 py-6 bg-stone-900 text-white font-black rounded-full shadow-2xl hover:shadow-stone-900/20 transition-all uppercase tracking-[0.3em] text-xs cursor-pointer"
          >
            Show More Varieties
          </motion.button>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-4">Showing 8 of 120 Spices</p>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
