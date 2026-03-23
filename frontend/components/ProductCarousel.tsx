'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductImage } from '@/lib/types';

interface ProductCarouselProps {
  images: ProductImage[];
}

export default function ProductCarousel({ images }: ProductCarouselProps) {
  const [index, setIndex] = useState(0);

  // Hero image should be first. Our backend order_by="ProductImage.sort_order" already helps.
  // But let's be double sure if is_hero is set.
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_hero) return -1;
    if (b.is_hero) return 1;
    return a.sort_order - b.sort_order;
  });

  const next = () => setIndex((index + 1) % sortedImages.length);
  const prev = () => setIndex((index - 1 + sortedImages.length) % sortedImages.length);

  if (!sortedImages.length) {
    return (
      <div className="aspect-square bg-stone-100 rounded-3xl flex items-center justify-center text-stone-300">
        <span className="text-sm font-bold uppercase tracking-widest">No Image Available</span>
      </div>
    );
  }

  return (
    <div className="relative group aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl shadow-stone-200">
      <AnimatePresence mode="wait">
        <motion.img
          key={sortedImages[index].id}
          src={sortedImages[index].image_url}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>

      {sortedImages.length > 1 && (
        <>
          {/* Arrows */}
          <button 
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/30 text-white rounded-full flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/30 text-white rounded-full flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {sortedImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === index ? 'w-6 bg-white' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
