'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, Plus, Trash2, Package, Layers, Star } from 'lucide-react';
import Link from 'next/link';
import { fetchProductById, adminUpdateProduct, fetchCategories } from '@/lib/api';
import type { Product, Category, ProductVariant } from '@/lib/types';
import ImageManager from '@/components/ImageManager';
import { motion } from 'framer-motion';

export default function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [basePrice, setBasePrice] = useState('0');
  const [originalPrice, setOriginalPrice] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [productImages, setProductImages] = useState<any[]>([]);
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([]);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      const [found, cats] = await Promise.all([
        fetchProductById(parseInt(id)),
        fetchCategories()
      ]);

      setCategories(cats);

      if (found) {
        setName(found.name);
        setSubtitle(found.subtitle || '');
        setDescription(found.description || '');
        setCategoryId(found.category_id || '');
        setBasePrice(found.base_price.toString());
        setOriginalPrice(found.original_price?.toString() || '');
        setIsActive(found.is_active || false);
        setIsFeatured(found.is_featured || false);
        setProductImages(found.images || []);
        setVariants(found.variants || []);
      } else {
        setError('Product details not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = () => {
    setVariants([...variants, { name: '', stock_quantity: 0 }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: value };
    setVariants(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await adminUpdateProduct(parseInt(id), {
        name,
        subtitle,
        description,
        category_id: categoryId === '' ? undefined : categoryId,
        base_price: parseFloat(basePrice),
        original_price: originalPrice ? parseFloat(originalPrice) : undefined,
        is_active: isActive,
        is_featured: isFeatured,
        variants: variants.map(v => ({
          id: v.id,
          name: v.name || '',
          price_override: v.price_override ? Number(v.price_override) : undefined,
          stock_quantity: Number(v.stock_quantity) || 0
        }))
      });
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-32">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
              <ArrowLeft size={20} className="text-stone-400" />
            </Link>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">Edit Product</h1>
          </div>
          <p className="text-stone-500 text-xs font-fira-code uppercase tracking-widest mt-1">Catalog Management • ID: {id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

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
                <div className="flex gap-4">
                  <div className="flex-1 flex items-center justify-between p-4 bg-stone-50/50 rounded-2xl border border-stone-100">
                    <span className="text-[10px] font-fira-code font-bold uppercase tracking-widest text-stone-500">Featured</span>
                    <button
                      type="button"
                      onClick={() => setIsFeatured(!isFeatured)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 focus:outline-none ${
                        isFeatured ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-stone-200'
                      }`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                        isFeatured ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex-1 flex items-center justify-between p-4 bg-stone-50/50 rounded-2xl border border-stone-100">
                    <span className="text-[10px] font-fira-code font-bold uppercase tracking-widest text-stone-500">Active</span>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 focus:outline-none ${
                        isActive ? 'bg-green-600 shadow-[0_0_15px_rgba(22,163,74,0.3)]' : 'bg-stone-200'
                      }`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Product Name *</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-stone-50/50 border border-stone-200/60 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-red-600/50 focus:ring-8 focus:ring-red-600/5 transition-all text-stone-900 placeholder-stone-300" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Subtitle</label>
                  <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)}
                    className="w-full bg-stone-50/50 border border-stone-200/60 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-red-600/50 focus:ring-8 focus:ring-red-600/5 transition-all text-stone-900 placeholder-stone-300" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Category *</label>
                    <select required value={categoryId} onChange={e => setCategoryId(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full bg-stone-50/50 border border-stone-200/60 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-red-600/50 focus:ring-8 focus:ring-red-600/5 transition-all appearance-none cursor-pointer text-stone-900">
                      <option value="">Select</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Base Price (₹)</label>
                    <input type="number" required value={basePrice} onChange={e => setBasePrice(e.target.value)}
                      className="w-full bg-stone-50/50 border border-stone-200/60 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-red-600/50 focus:ring-8 focus:ring-red-600/5 transition-all text-stone-900" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-2">Original Price</label>
                  <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)}
                    className="w-full bg-stone-50/50 border border-stone-200/60 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-red-600/50 focus:ring-8 focus:ring-red-600/5 transition-all text-stone-900" />
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
                  <textarea rows={8} value={description} onChange={e => setDescription(e.target.value)}
                    className="w-full bg-stone-50/50 border border-stone-200/60 rounded-[1.5rem] px-6 py-5 text-sm font-medium focus:outline-none focus:border-red-600/50 focus:ring-8 focus:ring-red-600/5 resize-none transition-all text-stone-900 placeholder-stone-300 min-h-[200px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Media */}
          <div className="lg:col-span-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="glass-card rounded-[2.5rem] p-10 space-y-8 border-stone-100/60">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <Star size={16} />
                </span>
                Product Media
              </h2>
              <ImageManager 
                productId={parseInt(id)} 
                images={productImages} 
                onUpdate={() => load()} 
              />
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
                <button type="button" onClick={handleAddVariant}
                  className="text-[10px] font-fira-code font-black text-red-600 hover:text-red-700 uppercase tracking-widest transition-colors cursor-pointer">
                  + New Variant
                </button>
              </div>

              <div className="space-y-6">
                {variants.map((v, i) => (
                  <div key={i} className="bg-stone-50/50 p-6 rounded-3xl border border-stone-100 space-y-5 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-stone-200/40 group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-fira-code font-bold text-stone-400 uppercase tracking-widest">Variant #{i + 1}</span>
                      <button type="button" onClick={() => handleRemoveVariant(i)}
                        className="text-stone-300 hover:text-red-600 transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <input type="text" placeholder="e.g. 500g Pack" value={v.name} onChange={e => handleVariantChange(i, 'name', e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-red-600 transition-all" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 ml-2">Price (₹)</label>
                          <input type="number" placeholder="Override" value={v.price_override || ''} onChange={e => handleVariantChange(i, 'price_override', e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-bold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-stone-400 ml-2">Stock</label>
                          <input type="number" placeholder="Quantity" value={v.stock_quantity} onChange={e => handleVariantChange(i, 'stock_quantity', e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-bold" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {variants.length === 0 && (
                  <p className="text-center py-6 text-stone-400 text-[10px] font-fira-code uppercase tracking-widest">No variants defined</p>
                )}
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
                disabled={saving}
                className="px-12 py-4 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(220,38,38,0.2)] hover:shadow-[0_15px_30px_rgba(220,38,38,0.3)] transition-all duration-300 flex items-center gap-3 disabled:opacity-50 cursor-pointer group active:scale-95"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    Save Changes
                    <Save size={16} className="transition-transform duration-300 group-hover:scale-110" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
}
