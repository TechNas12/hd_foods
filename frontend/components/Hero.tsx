'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const slides = [
  {
    id: 1,
    title: "Pure Essence of Tradition",
    subtitle: "Handpicked spices from the heart of India, processed with love and care.",
    image: "https://img.freepik.com/free-photo/top-view-indian-seasonings-spices-table_181624-59276.jpg?semt=ais_hybrid&w=740&q=80",
    accent: "text-red-500"
  },
  {
    id: 2,
    title: "Authentic Masala Blends",
    subtitle: "Secret family recipes passed down through generations for the perfect aroma.",
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    accent: "text-yellow-500"
  },
  {
    id: 3,
    title: "Quality You Can Taste",
    subtitle: "Zero additives, zero preservatives. Just 100% pure, natural flavor.",
    image: "https://picsum.photos/seed/spices3/1920/1080",
    accent: "text-emerald-500"
  }
];

const SLIDE_DURATION = 6000;

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
      setProgress(0);
    }, SLIDE_DURATION);

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.min(prev + (100 / (SLIDE_DURATION / 100)), 100));
    }, 100);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, [current]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-stone-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-black/50 z-10" />
          <Image
            src={slides[current].image}
            alt={slides[current].title}
            fill
            className="object-cover"
            priority
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={`tag-${current}`}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-block text-white/60 uppercase tracking-[0.4em] text-xs mb-6 font-bold"
          >
            Generational Taste
          </motion.span>

          <h1 className="text-6xl md:text-8xl font-serif text-white leading-[1.1] mb-8 text-balance">
            {slides[current].title.split(' ').map((word, i) => (
              <motion.span
                key={`${current}-${i}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1), duration: 0.8, ease: "easeOut" }}
                className={`inline-block mr-4 ${i === slides[current].title.split(' ').length - 1 ? slides[current].accent : ''}`}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            key={`sub-${current}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-lg md:text-xl text-white/60 mb-12 leading-relaxed max-w-lg"
          >
            {slides[current].subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-wrap gap-6"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-10 py-5 bg-red-700 text-white font-black rounded-full transition-all shadow-[0_0_20px_rgba(185,28,28,0.3)] hover:shadow-[0_0_30px_rgba(185,28,28,0.5)] flex items-center gap-2 cursor-pointer relative overflow-hidden active:scale-95"
            >
              <span className="relative z-10 uppercase tracking-widest text-sm">Shop Collection</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              className="px-10 py-5 bg-white/10 backdrop-blur-md text-white font-black rounded-full border border-white/20 transition-all uppercase tracking-widest text-sm cursor-pointer"
            >
              Our Story
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 right-12 z-30 flex gap-4">
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
          whileTap={{ scale: 0.9 }}
          onClick={prevSlide}
          className="p-4 rounded-full border border-white/20 text-white transition-colors backdrop-blur-md cursor-pointer"
        >
          <ChevronLeft size={24} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
          whileTap={{ scale: 0.9 }}
          onClick={nextSlide}
          className="p-4 rounded-full border border-white/20 text-white transition-colors backdrop-blur-md cursor-pointer"
        >
          <ChevronRight size={24} />
        </motion.button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-12 left-12 z-30 flex flex-col gap-4">
        <div className="flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setProgress(0); }}
              className="group relative cursor-pointer py-4"
            >
              <div className={`h-1 transition-all duration-500 rounded-full bg-white/20 overflow-hidden ${i === current ? 'w-16' : 'w-8 group-hover:w-12'
                }`}>
                {i === current && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-red-600"
                  />
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4">
          <span>0{current + 1}</span>
          <div className="w-12 h-px bg-white/20" />
          <span>03</span>
        </div>
      </div>

      {/* Decorative Particle Elements */}
      <div className="absolute top-[20%] right-[10%] w-24 h-24 bg-red-500/10 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />
    </section>
  );
}
