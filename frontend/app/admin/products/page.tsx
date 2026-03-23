'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Loader2, Eye, EyeOff, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchProducts, adminDeleteProduct } from '@/lib/api';
import type { ProductSummary } from '@/lib/types';
import AlertModal from '@/components/ui/AlertModal';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: number | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await fetchProducts({ limit: 100 });
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminDeleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Delete failed:', err);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Products</h1>
          <p className="text-stone-500 text-xs font-fira-code uppercase tracking-widest mt-1">
            <span className="text-red-500 font-black">{products.length}</span> Active Items
          </p>
        </div>
        <Link href="/admin/products/new">
          <button className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(220,38,38,0.2)] hover:shadow-[0_15px_30px_rgba(220,38,38,0.3)] transition-all duration-300 cursor-pointer active:scale-95">
            <Plus size={18} className="transition-transform duration-300 group-hover:rotate-90" />
            New Product
          </button>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-red-600 transition-colors duration-300" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog by name or slug..."
            className="w-full bg-white/60 backdrop-blur-md border border-stone-200/60 rounded-[1.5rem] pl-16 pr-8 py-5 text-sm focus:outline-none focus:border-red-600/50 focus:ring-8 focus:ring-red-600/5 transition-all duration-300 font-medium placeholder-stone-400"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-[2.5rem] border-stone-100/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                <th className="text-left px-10 py-6">Product</th>
                <th className="text-left px-6 py-6">Identity</th>
                <th className="text-right px-6 py-6">Retail Price</th>
                <th className="text-center px-6 py-6">Customer Rating</th>
                <th className="text-right px-10 py-6">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50/50">
              {filtered.map(product => (
                <tr key={product.id} className="group hover:bg-red-50/30 transition-all duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200/50 shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2">
                        {product.images?.[0] && (
                          <Image src={product.images[0].image_url} alt={product.name} width={56} height={56} className="object-cover w-full h-full" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="block font-bold text-stone-900 group-hover:text-red-600 transition-colors duration-300">{product.name}</span>
                        <span className="text-[10px] font-fira-code text-stone-400 uppercase tracking-widest">ID: #{product.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="bg-stone-100 text-stone-500 px-3 py-1.5 rounded-lg text-[11px] font-fira-code border border-stone-200/50 group-hover:border-red-600/20 group-hover:bg-red-50/50 group-hover:text-red-600 transition-all duration-300">
                      {product.slug}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <span className="text-lg font-black text-stone-900">₹{product.base_price}</span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 shadow-sm">
                      <Star size={14} className="text-amber-500" fill="currentColor" />
                      <span className="text-amber-800 text-xs font-black">{Number(product.rating).toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <button className="w-10 h-10 flex items-center justify-center bg-white hover:bg-red-600 hover:text-white rounded-xl shadow-sm border border-stone-100 transition-all duration-300 cursor-pointer hover:-translate-y-1">
                          <Pencil size={16} />
                        </button>
                      </Link>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, id: product.id })}
                        className="w-10 h-10 flex items-center justify-center bg-white hover:bg-stone-900 hover:text-white rounded-xl shadow-sm border border-stone-100 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-stone-400 font-medium">No products found</div>
          )}
        </div>
      </div>

      <AlertModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
        title="Delete Product?"
        message="Are you sure you want to delete this product? This action cannot be undone and all associated variants and data will be removed."
        confirmText="Delete Product"
        type="danger"
      />
    </div>
  );
}
