'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare,
  ChevronLeft, LogOut, Loader2, Menu, X, Layers, Users
} from 'lucide-react';
import { fetchProfile } from '@/lib/api';
import { getSession, logout } from '@/lib/auth';
import type { User } from '@/lib/types';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Layers },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/tickets', label: 'Tickets', icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const session = await getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    try {
      const profile = await fetchProfile();
      if (!profile.is_admin) {
        router.push('/account');
        return;
      }
      setUser(profile);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-red-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 glass-dark text-white flex flex-col transform transition-transform duration-500 ease-[0.33,1,0.68,1] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand */}
        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center text-white italic text-xl border border-white/20 shadow-[0_8px_16px_rgba(220,38,38,0.3)]">
              HD
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight">HD Foods</h1>
              <p className="text-[10px] font-fira-code font-bold uppercase tracking-[0.2em] text-red-500/80">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-3">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-white'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent rounded-2xl border-l-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.1)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <link.icon size={20} className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-red-500' : ''}`} />
                <span className="relative z-10 font-fira-sans tracking-wide">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/50 text-sm font-bold border border-white/10">
              {user.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.full_name}</p>
              <p className="text-[10px] text-white/40 font-bold truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <ChevronLeft size={14} />
              Store
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-red-500/10 rounded-xl text-white/60 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-stone-200 px-6 py-4 flex items-center gap-4 lg:px-10 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <Menu size={22} className="text-stone-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-black text-stone-900 capitalize tracking-tight">
              {pathname === '/admin' ? 'Dashboard Overview' : pathname.split('/admin/')[1]?.split('/')[0] || 'Admin Center'}
            </h2>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
