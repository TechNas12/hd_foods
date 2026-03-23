'use client';

import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';

const features = [
  {
    id: 1,
    title: "Sourced from Origin",
    description: "We travel to the remotest parts of India to find the finest quality whole spices directly from farmers.",
    image: "https://picsum.photos/seed/origin/800/600"
  },
  {
    id: 2,
    title: "Traditional Grinding",
    description: "Our spices are ground at low temperatures to preserve their natural oils and intense aroma.",
    image: "https://picsum.photos/seed/grinding/800/600"
  },
  {
    id: 3,
    title: "Purity Guaranteed",
    description: "Every batch undergoes rigorous quality checks to ensure zero adulteration and maximum potency.",
    image: "https://picsum.photos/seed/purity/800/600"
  }
];

function Counter({ value, suffix = "" }: { value: number, suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      let startTimestamp: number | null = null;

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        setDisplayValue(Math.floor(progress * (end - start) + start));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, value]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
}

export default function StorySection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [-5, 5]);

  return (
    <section id="our-story" ref={containerRef} className="py-32 bg-stone-50 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.span
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              whileInView={{ opacity: 1, letterSpacing: "0.3em" }}
              className="text-red-600 font-black uppercase text-xs mb-6 block"
            >
              Our Legacy
            </motion.span>

            <h2 className="text-6xl md:text-7xl font-serif text-stone-900 leading-[1.1] mb-10 text-balance">
              A Journey of Taste <br />
              <span className="italic text-red-600 font-light">Since 1995</span>
            </h2>

            <p className="text-xl text-stone-600 leading-relaxed mb-8 font-medium">
              HD Foods & Masale was born out of a passion for authentic Indian flavors. For over two decades, we have been committed to bringing the purest spices from the farm to your table.
            </p>

            <p className="text-xl text-stone-500 leading-relaxed mb-12">
              Our process is rooted in tradition but powered by modern technology, ensuring that every pinch of our masala adds a burst of life to your cooking.
            </p>

            <div className="grid grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 group">
                <span className="block text-5xl font-serif font-bold text-red-600 mb-3 tracking-tighter">
                  <Counter value={25} suffix="+" />
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-stone-400 font-black">Years of Trust</span>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 group">
                <span className="block text-5xl font-serif font-bold text-red-600 mb-3 tracking-tighter">
                  <Counter value={100} suffix="%" />
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-stone-400 font-black">Natural Ingredients</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <motion.div
              style={{ rotate }}
              className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.15)] relative z-10"
            >
              <Image
                src="https://picsum.photos/seed/legacy/1000/1000"
                alt="Our Legacy"
                fill
                className="object-cover transition-transform duration-[2s] hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Glassmorphism Floating Quote Card */}
            <motion.div
              initial={{ opacity: 0, x: -100, y: 50 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 1, type: "spring" }}
              className="absolute -bottom-12 -left-12 p-10 liquid-glass rounded-3xl max-w-sm hidden md:block z-20"
            >
              <div className="text-red-600 text-5xl font-serif mb-4 leading-none opacity-20 group-hover:opacity-100 transition-opacity">“</div>
              <p className="text-stone-800 font-serif italic text-2xl mb-8 leading-snug">
                Spices are the soul of Indian cooking, and we treat them with the respect they deserve.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-8 h-px bg-red-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">
                  Founder, HD Foods
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.7 }}
              className="group"
            >
              <div className="h-80 rounded-[2.5rem] overflow-hidden mb-8 relative shadow-lg group-hover:shadow-2xl transition-all duration-700 group-hover:-translate-y-2">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <motion.h3
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-3xl font-serif font-bold text-stone-900 mb-5 group-hover:text-red-600 transition-colors"
              >
                {feature.title}
              </motion.h3>
              <p className="text-stone-500 leading-relaxed font-medium text-lg">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute top-1/2 -right-64 w-[500px] h-[500px] bg-orange-100 rounded-full blur-[120px] opacity-30 pointer-events-none" />
    </section>
  );
}
