'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Loader2, Package, Layers } from 'lucide-react';
import Link from 'next/link';
import { adminCreateProduct, fetchCategories } from '@/lib/api';
import type { Category } from '@/lib/types';
import VisualImagePicker, { VisualImage } from '@/components/admin/VisualImagePicker';
import AlertModal from '@/components/ui/AlertModal';

export default function AdminNewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    name: '',
    subtitle: '',
    slug: '',
    categoryId: '' as number | '',
    description: '',
    base_price: '',
    original_price: '',
    is_featured: false,
  });

  const [variants, setVariants] = useState([
    { name: 'Regular', price_override: '', stock_quantity: '100' },
  ]);

  const [images, setImages] = useState<VisualImage[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, index: number | null }>({
    isOpen: false,
    index: null
  });

  useEffect(() => {
    fetchCategories().then(setCategories).catch(err => console.error('Failed to load categories', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.categoryId) {
      setError('Please select a category');
      setLoading(false);
      return;
    }

    try {
      await adminCreateProduct({
        name: form.name,
        subtitle: form.subtitle || undefined,
        slug: form.slug || undefined,
        category_id: Number(form.categoryId),
        description: form.description || undefined,
        base_price: parseFloat(form.base_price),
        original_price: form.original_price ? parseFloat(form.original_price) : undefined,
        is_featured: form.is_featured,
        variants: variants
          .filter(v => v.name)
          .map(v => ({
            name: v.name,
            price_override: v.price_override ? parseFloat(v.price_override) : undefined,
            stock_quantity: parseInt(v.stock_quantity) || 0,
          })),
        images: images.map(img => ({
          image_url: img.image_url,
          storage_path: img.storage_path,
          is_hero: img.is_hero,
          sort_order: img.sort_order
        }))
      });
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => setVariants([...variants, { name: '', price_override: '', stock_quantity: '50' }]);
  const updateVariant = (i: number, field: string, value: string) => {
    const updated = [...variants];
    (updated[i] as any)[field] = value;
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
    setDeleteModal({ isOpen: false, index: null });
  };

  return (
    <div className="space-y-10 pb-32">
      {/* Header */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 flex items-center justify-center bg-white hover:bg-stone-900 hover:text-white rounded-2xl shadow-sm border border-stone-100 transition-all duration-300 cursor-pointer group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Create New Product</h1>
          <p className="text-stone-500 text-xs font-fira-code uppercase tracking-widest mt-1">Catalog Management</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Column 1: Basic Info */}
          <div className="lg:col-span-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card rounded-[2.5rem] p-10 space-y-8 border-stone-100/60">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <Package size={16} />
                </span>
                Basic Information
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-stone-50/50 rounded-2xl border border-stone-100">
                  <span className="text-[10px] font-fira-code font-bold uppercase tracking-widest text-stone-500">Feature on Landing</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 focus:outline-none ${
                      form.is_featured ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-stone-200'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                      form.is_featured ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Product Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Premium Garam Masala"
                    className="w-full bg-stone-50/50 border border-stone-200/60 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-red-600/50 focus:ring-8 focus:ring-red-600/5 transition-all text-stone-900 placeholder-stone-300" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Subtitle</label>
                  <input type="text" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="e.g. Hand-ground perfection"
                    className="w-full bg-stone-50/50 border border-stone-200/60 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-red-600/50 focus:ring-8 focus:ring-red-600/5 transition-all text-stone-900 placeholder-stone-300" />
                </div>

                <div className="space-y-2 text-stone-900">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2 font-fira-sans">Category *</label>
                  <select required value={form.categoryId} onChange={e => setForm({ ...form, categoryId: Number(e.target.value) })}
                    className="w-full bg-stone-50/50 border border-stone-200/60 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-red-600/50 focus:ring-8 focus:ring-red-600/5 transition-all appearance-none cursor-pointer">
                    <option value={0}>Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Base Price (₹)</label>
                    <input type="number" required value={form.base_price} onChange={e => setForm({ ...form, base_price: e.target.value })}
                      className="w-full bg-stone-50/50 border border-stone-200/60 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-red-600/50 focus:ring-8 focus:ring-red-600/5 transition-all text-stone-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Original (₹)</label>
                    <input type="number" value={form.original_price || ''} onChange={e => setForm({ ...form, original_price: e.target.value })}
                      className="w-full bg-stone-50/50 border border-stone-200/60 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-red-600/50 focus:ring-8 focus:ring-red-600/5 transition-all text-stone-900" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Description</label>
                    <div className="group relative">
                      <span className="text-[9px] font-fira-code font-bold text-red-600 cursor-help border-b border-red-600/30">Markdown Guide</span>
                      <div className="absolute right-0 bottom-full mb-3 w-56 glass-dark text-white text-[10px] p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-2xl scale-95 group-hover:scale-100 origin-bottom-right">
                        <p className="font-fira-code font-bold uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Formatting Syntax</p>
                        <ul className="space-y-2 text-stone-400">
                          <li className="flex justify-between"><span>Bold:</span> <code className="text-red-400">**text**</code></li>
                          <li className="flex justify-between"><span>Italic:</span> <code className="text-red-400">*text*</code></li>
                          <li className="flex justify-between"><span>Bullet:</span> <code className="text-red-400">- item</code></li>
                          <li className="flex justify-between"><span>Title:</span> <code className="text-red-400"># text</code></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <textarea rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Tell clients more about this product..."
                    className="w-full bg-stone-50/50 border border-stone-200/60 rounded-[1.5rem] px-6 py-5 text-sm font-medium focus:outline-none focus:border-red-600/50 focus:ring-8 focus:ring-red-600/5 resize-none transition-all text-stone-900 placeholder-stone-300 min-h-[160px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Images */}
          <div className="lg:col-span-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="glass-card rounded-[2.5rem] p-10 space-y-8 border-stone-100/60">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                    <Layers size={16} />
                  </span>
                  Product Media
                </h2>
                <button type="button" onClick={() => setImages([...images, { image_url: '', storage_path: '', is_hero: false, sort_order: images.length + 1 }])}
                  className="text-[10px] font-fira-code font-black text-red-600 hover:text-red-700 uppercase tracking-widest transition-colors cursor-pointer">
                  + Add Media
                </button>
              </div>

              <div className="space-y-6">
                <VisualImagePicker 
                  images={images} 
                  onChange={setImages} 
                  folder="products/temp" 
                />
              </div>
            </div>
          </div>

          {/* Column 3: Variants */}
          <div className="lg:col-span-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="glass-card rounded-[2.5rem] p-10 space-y-8 border-stone-100/60">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                    <Layers size={16} />
                  </span>
                  Inventory & Variants
                </h2>
                <button type="button" onClick={addVariant}
                  className="text-[10px] font-fira-code font-black text-red-600 hover:text-red-700 uppercase tracking-widest transition-colors cursor-pointer">
                  + New Variant
                </button>
              </div>

              <div className="space-y-6">
                {variants.map((variant, idx) => (
                  <div key={idx} className="bg-stone-50/50 p-6 rounded-3xl border border-stone-100 space-y-5 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-stone-200/40">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-fira-code font-bold text-stone-400 uppercase tracking-widest">Variant #{idx + 1}</span>
                      <button type="button" onClick={() => setDeleteModal({ isOpen: true, index: idx })}
                        className="text-stone-300 hover:text-red-600 transition-colors cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <input type="text" placeholder="e.g. 500g Pack" value={variant.name} onChange={e => updateVariant(idx, 'name', e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-red-600 transition-all" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="Price (Optional)" value={variant.price_override || ''} onChange={e => updateVariant(idx, 'price_override', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-bold" />
                        <input type="number" placeholder="Stock" value={variant.stock_quantity} onChange={e => updateVariant(idx, 'stock_quantity', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-bold" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl z-50 px-4"
        >
          <div className="liquid-glass rounded-[2rem] p-4 flex items-center justify-between px-10 gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-white/20">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-stone-500 hover:text-stone-900 font-fira-code font-bold uppercase text-[10px] tracking-widest transition-colors cursor-pointer"
            >
              Discard Changes
            </button>
            <div className="flex items-center gap-6">
              {error && <span className="text-red-400 text-xs font-medium mr-4">{error}</span>}
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-4 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(220,38,38,0.2)] hover:shadow-[0_15px_30px_rgba(220,38,38,0.3)] transition-all duration-300 flex items-center gap-3 disabled:opacity-50 cursor-pointer group active:scale-95"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    Create Product
                    <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </form>

      <AlertModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={() => deleteModal.index !== null && removeVariant(deleteModal.index)}
        title="Remove Variant?"
        message="Are you sure you want to remove this variant? Any details entered for this variant will be lost."
        confirmText="Remove Variant"
        type="warning"
      />
    </div>
  );
}

