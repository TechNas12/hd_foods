'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { useCart } from '@/lib/cart';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Our Story', href: '/#our-story' },
  { name: 'Contact', href: '/contact' }
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [clientMounted, setClientMounted] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { itemCount } = useCart();

  useEffect(() => {
    setClientMounted(true);
    setIsAuth(isAuthenticated());
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const showScrolledStyle = isScrolled || !isHome;

  return (
    <nav
      className={`fixed z-50 transition-all duration-500 ease-in-out ${showScrolledStyle
        ? 'top-4 left-4 right-4 py-3 bg-white/80 backdrop-blur-xl border border-stone-200 shadow-lg rounded-2xl md:py-4 px-6'
        : 'top-0 left-0 right-0 py-6 bg-transparent px-6'
        }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-red-700 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-yellow-500 overflow-hidden shadow-lg"
          >
            <span className="font-serif italic">HD</span>
          </motion.div>
          <span className={`font-serif text-xl font-bold tracking-tight transition-colors hidden sm:block ${showScrolledStyle ? 'text-stone-900' : 'text-white'}`}>
            HD FOODS <span className="text-red-600">&</span> MASALE
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
            >
              <Link
                href={item.href}
                className={`group relative text-xs font-bold uppercase tracking-[0.2em] transition-colors ${showScrolledStyle ? 'text-stone-600' : 'text-white/90'
                  } hover:text-red-700`}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-700 transition-all duration-300 group-hover:w-full" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Icons */}
        <div className={`flex items-center gap-3 sm:gap-5 ${showScrolledStyle ? 'text-stone-900' : 'text-white'}`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-full transition-colors cursor-pointer ${showScrolledStyle ? 'hover:bg-stone-100' : 'hover:bg-white/10'}`}
          >
            <Search size={20} />
          </motion.button>
          <Link href={isAuth ? "/account" : "/login"}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-full transition-colors cursor-pointer ${showScrolledStyle ? 'hover:bg-stone-100' : 'hover:bg-white/10'}`}
            >
              <User size={20} />
            </motion.button>
          </Link>
          <Link href="/cart">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-full transition-colors overflow-visible cursor-pointer relative ${showScrolledStyle ? 'hover:bg-stone-100' : 'hover:bg-white/10'}`}
            >
              <ShoppingBag size={20} />
              {clientMounted && itemCount > 0 && (
                 <span className="absolute top-0 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-sm ring-2 ring-white transform origin-center scale-100 transition-transform">
                   {itemCount}
                 </span>
              )}
            </motion.button>
          </Link>
          <button
            className={`md:hidden p-2 rounded-full transition-colors cursor-pointer ${showScrolledStyle ? 'hover:bg-stone-100' : 'hover:bg-white/10'}`}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[60] bg-stone-50 flex flex-col p-8"
          >
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 bg-red-700 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-yellow-500">
                <span className="font-serif italic">HD</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-stone-900 hover:bg-stone-200 rounded-full cursor-pointer transition-colors"
              >
                <X size={32} />
              </button>
            </div>
            <div className="flex flex-col gap-6 mt-20">
              {navLinks.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-5xl font-serif font-bold text-stone-900 hover:text-red-700 transition-colors flex items-center justify-between group"
                  >
                    {item.name}
                    <motion.span
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      className="text-red-700 text-3xl"
                    >→</motion.span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
