'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { login, signup } from '@/lib/auth';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        router.push('/account');
      } else {
        await signup(name, email, password, phone || undefined);
        router.push('/account');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left Column: Visual/Image */}
      <div className="hidden md:block md:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200"
          alt="Spice Heritage"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex flex-col justify-end p-20 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-serif italic text-2xl border-2 border-white/20 shadow-xl">
              HD
            </div>
            <h1 className="text-6xl font-serif font-black leading-tight">
              A Legacy of <br />
              <span className="italic text-red-600">Pure Taste.</span>
            </h1>
            <p className="text-xl text-white/70 max-w-md font-medium leading-relaxed">
              Join our community of spice enthusiasts and experience the authentic flavors of Indian tradition.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-20 py-20 bg-stone-50 overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <Link href="/" className="md:hidden block mb-10 w-fit">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-serif italic text-xl border-2 border-white/20 shadow-lg cursor-pointer">
                HD
              </div>
            </Link>
            <motion.div
              key={isLogin ? 'login-head' : 'signup-head'}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <h2 className="text-4xl font-serif font-black text-stone-900">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-stone-500 font-medium">
                {isLogin
                  ? 'Sign in to access your orders and account details.'
                  : 'Register now to start your culinary journey with us.'}
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-red-600 transition-colors" size={20} />
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Rahul Sharma"
                        className="w-full bg-white border border-stone-200 rounded-2xl pl-14 pr-8 py-5 text-sm focus:outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/5 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">Phone (Optional)</label>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-red-600 transition-colors" size={20} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full bg-white border border-stone-200 rounded-2xl pl-14 pr-8 py-5 text-sm focus:outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/5 transition-all font-medium"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-red-600 transition-colors" size={20} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white border border-stone-200 rounded-2xl pl-14 pr-8 py-5 text-sm focus:outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/5 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Password</label>
                {isLogin && (
                  <button type="button" className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors cursor-pointer">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-red-600 transition-colors" size={20} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-white border border-stone-200 rounded-2xl pl-14 pr-8 py-5 text-sm focus:outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/5 transition-all font-medium"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-800 text-xs font-medium"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 shadow-xl shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="pt-8 border-t border-stone-200 text-center">
            <p className="text-stone-500 font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="ml-2 text-red-600 font-black uppercase tracking-widest text-[10px] hover:text-red-700 transition-colors cursor-pointer"
              >
                {isLogin ? 'Create Account' : 'Sign In Now'}
              </button>
            </p>
          </div>

          <div className="flex items-center gap-4 justify-center py-4">
            <ShieldCheck size={20} className="text-stone-400" />
            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-stone-400">Secure Login</p>
          </div>
        </div>
      </div>
    </div>
  );
}
