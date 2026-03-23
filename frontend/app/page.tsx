'use client';

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import StorySection from '@/components/StorySection';
import Footer from '@/components/Footer';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

export default function Home() {
  const galleryRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <main className="relative min-h-screen selection:bg-red-100 selection:text-red-900">
      <Navbar />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Hero />
        <ProductGrid />

        {/* Immersive Gallery Section */}
        <section ref={galleryRef} className="py-32 bg-stone-950 text-white overflow-hidden relative">
          {/* Decorative background text */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-[0.03] select-none">
            <span className="text-[15vw] font-serif font-black absolute top-0 -left-20 whitespace-nowrap text-[#CA8A04]">GENERATIONAL</span>
            <span className="text-[15vw] font-serif font-black absolute bottom-0 -right-20 whitespace-nowrap text-[#CA8A04]">TRADITION</span>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-24">
              <motion.span
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                whileInView={{ opacity: 1, letterSpacing: "0.3em" }}
                className="text-[#CA8A04] font-black uppercase text-xs mb-6 block"
              >
                HD FOODS & MASALE
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-6xl md:text-8xl font-serif mb-10"
              >
                The Art of Spices
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="text-white/40 max-w-2xl mx-auto text-xl font-medium leading-relaxed"
              >
                Spices are not just ingredients; they are stories of soil, sun, and centuries of tradition, ground to perfection for your table.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8" style={{ height: '800px' }}>

              {/* Left - Large Image */}
              <div className="md:col-span-8 h-full">
                <div className="relative h-full w-full rounded-[3rem] overflow-hidden group shadow-2xl">
                  <Image
                    src="https://picsum.photos/seed/art1/1200/800"
                    alt="Spice Art"
                    fill
                    className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition-all duration-700" />
                  <div className="absolute bottom-12 left-12">
                    <motion.h4
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      className="text-4xl font-serif font-bold mb-3"
                    >
                      The Golden Harvest
                    </motion.h4>
                    <p className="text-white/60 font-medium tracking-wide">
                      Sourcing the finest turmeric from the heart of Erode.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right - Two Stacked Images */}
              <div className="md:col-span-4 flex flex-col gap-8" style={{ height: '800px' }}>

                <div
                  className="relative w-full rounded-[3rem] overflow-hidden group shadow-2xl"
                  style={{ height: '384px', flexShrink: 0 }}
                >
                  <Image
                    src="https://picsum.photos/seed/art2/600/600"
                    alt="Spice Art"
                    fill
                    className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700" />
                </div>

                <div
                  className="relative w-full rounded-[3rem] overflow-hidden group shadow-2xl"
                  style={{ height: '384px', flexShrink: 0 }}
                >
                  <Image
                    src="https://picsum.photos/seed/art3/600/600"
                    alt="Spice Art"
                    fill
                    className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700" />
                </div>

              </div>
            </div>
          </div>
        </section>

        <StorySection />

        {/* CTA Section */}
        <section className="py-40 relative overflow-hidden group">
          <motion.div
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 z-0"
          >
            <Image
              src="https://picsum.photos/seed/cta/1920/1080"
              alt="CTA Background"
              fill
              className="object-cover transition-transform duration-[5000ms] group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-[2px] transition-all duration-1000 group-hover:bg-stone-950/70" />
          </motion.div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <h2 className="text-6xl md:text-8xl font-serif font-bold leading-[1.1] text-balance">
                Ready to Transform Your Cooking?
              </h2>
              <p className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto font-medium leading-relaxed">
                Join thousands of home chefs who trust HD Foods & Masale for their daily culinary adventures.
              </p>
              <div className="pt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-16 py-6 bg-[#A61717] text-white font-black rounded-full text-xl  transition-all cursor-pointer uppercase tracking-widest active:scale-95"
                >
                  Browse Products
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </motion.div>
    </main>
  );
}
