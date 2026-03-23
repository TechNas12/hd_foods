'use client';

import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Send } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-white pt-32 pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-10"
          >
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="w-16 h-16 shrink-0 aspect-square bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl border-2 border-white/20 shadow-lg shadow-stone-900/20"
              >
                <span className="font-serif italic">HD</span>
              </motion.div>
              <span className="font-serif text-3xl font-black tracking-tighter">
                HD FOODS<span className="text-red-600"> & </span>MASALE
              </span>
            </Link>
            <p className="text-white/40 leading-relaxed font-medium">
              Bringing the authentic taste of Indian tradition to your kitchen with premium quality spices and blends since 1995.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1, backgroundColor: "#DC2626", borderColor: "#DC2626", color: "#FFFFFF" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer"
                >
                  <Icon size={20} />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-serif text-xl font-bold mb-10 text-white/90">Explore</h4>
            <ul className="flex flex-col gap-5">
              {/* Quick Links */}
              {[
                { name: 'Home', href: '/' },
                { name: 'Shop Spices', href: '/products' },
                { name: 'Masala Blends', href: '/products' },
                { name: 'Our Story', href: '/#our-story' },
                { name: 'Recipes', href: '#' },
                { name: 'Contact', href: '/contact' }
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-white/40 hover:text-red-600 transition-colors font-medium flex items-center group gap-0 hover:gap-3 cursor-pointer"
                  >
                    <span className="w-0 overflow-hidden group-hover:w-4 transition-all opacity-0 group-hover:opacity-100 text-red-600 font-black">›</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-serif text-xl font-bold mb-10 text-white/90">Contact Us</h4>
            <ul className="flex flex-col gap-8">
              <li className="flex items-start gap-5 text-white/40 group">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-red-600/10 group-hover:text-red-600 transition-colors shrink-0">
                  <MapPin size={22} />
                </div>
                <span className="font-medium pt-2.5">
                  123 Spice Market, Old Delhi,<br />New Delhi - 110006, India
                </span>
              </li>
              <li className="flex gap-5 text-white/40 group cursor-pointer">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-red-600/10 group-hover:text-red-600 transition-colors">
                  <Phone size={22} className="shrink-0" />
                </div>
                <span className="font-medium pt-2.5">+91 98765 43210</span>
              </li>
              <li className="flex gap-5 text-white/40 group cursor-pointer">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-red-600/10 group-hover:text-red-600 transition-colors">
                  <Mail size={22} className="shrink-0" />
                </div>
                <span className="font-medium pt-2.5">hello@hdfoods.com</span>
              </li>
            </ul>
          </motion.div>

        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-white/20 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <div className="flex flex-wrap justify-center gap-10">
            <p>&copy; 2026 HD FOODS & MASALE. ALL RIGHTS RESERVED.</p>
            <Link href="#" className="hover:text-red-600 transition-colors cursor-pointer">PRIVACY POLICY</Link>
            <Link href="#" className="hover:text-red-600 transition-colors cursor-pointer">TERMS OF SERVICE</Link>
          </div>

        </motion.div>
      </div>
    </footer>
  );
}
