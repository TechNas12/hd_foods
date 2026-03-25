'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { setAdminToken, apiFetch } from '@/lib/api-client';
import { fetchProfile } from '@/lib/api';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Get the normal access token
      const data = await apiFetch<any>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // 2. Temporarily set it as the admin token to verify profile
      setAdminToken(data.access_token);
      
      // 3. Verify admin status
      const profile = await fetchProfile();
      
      if (!profile.is_admin) {
        setAdminToken('');
        throw new Error('Unauthorized. Admin access required.');
      }
      
      // Success
      router.push('/admin');
    } catch (err: any) {
      setAdminToken('');
      setError(err.message || 'Invalid credentials or unauthorized');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center text-white italic text-3xl border border-white/20 shadow-[0_8px_16px_rgba(220,38,38,0.3)] mx-auto mb-6">
            HD
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Admin Portal</h1>
          <p className="text-sm font-bold uppercase tracking-widest text-red-500">Secure Access Only</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm flex items-center gap-3 font-medium"
              >
                <ShieldAlert size={18} className="shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 text-white placeholder-white/20 px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-medium"
                  placeholder="admin@hdfoods.com"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 text-white placeholder-white/20 px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[60px] bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-red-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Secure Login
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <Link 
              href="/"
              className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              ← Return to Store
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
