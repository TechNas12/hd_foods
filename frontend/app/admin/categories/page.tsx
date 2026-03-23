'use client';

import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Loader2, 
  Check, 
  X,
  Layers
} from 'lucide-react';
import { fetchCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '@/lib/api';
import type { Category } from '@/lib/types';
import AlertModal from '@/components/ui/AlertModal';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for Adding/Editing
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Alert Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: number | null }>({
    isOpen: false,
    id: null
  });
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    slug: ''
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', slug: '' });
    setIsAdding(false);
    setEditingId(null);
    setError('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await adminCreateCategory({
        name: form.name,
        description: form.description || undefined,
        slug: form.slug || undefined
      });
      await load();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setActionLoading(true);
    setError('');
    try {
      await adminUpdateCategory(editingId, {
        name: form.name,
        description: form.description || undefined,
        slug: form.slug || undefined
      });
      await load();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminDeleteCategory(id);
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description ?? '',
      slug: cat.slug
    });
    setIsAdding(false);
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Categories</h1>
          <p className="text-stone-500 text-sm">Manage product categories and tags</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Stats/Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <Layers size={24} />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-stone-900">{categories.length}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total Categories</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[32px] border border-stone-100 shadow-sm overflow-hidden">
        {/* Search & Filter */}
        <div className="p-6 border-b border-stone-100 flex items-center gap-4 bg-stone-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or slug..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:border-red-600 transition-all"
            />
          </div>
        </div>

        {/* Add/Edit Form Overlay-like section */}
        {(isAdding || editingId) && (
          <div className="p-8 border-b border-stone-100 bg-red-50/30 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-serif font-bold text-stone-900">
                {isAdding ? 'New Category' : 'Edit Category'}
              </h2>
              <button onClick={resetForm} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={isAdding ? handleCreate : handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Name *</label>
                <input 
                  required 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-red-600 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Slug (optional)</label>
                <input 
                  value={form.slug} 
                  onChange={e => setForm({...form, slug: e.target.value})}
                  placeholder="e.g. organic-spices"
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-red-600 transition-all font-medium" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Description</label>
                <input 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-red-600 transition-all" 
                />
              </div>
              
              <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                {error && <p className="mr-auto text-red-600 text-xs self-center">{error}</p>}
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-500 hover:bg-stone-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="px-8 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {isAdding ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 w-1/4">Category Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 w-1/4">Slug</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Description</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-red-600" />
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-400">
                    No categories found.
                  </td>
                </tr>
              ) : filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-stone-900">{cat.name}</td>
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono bg-stone-100 text-stone-600 px-2 py-1 rounded">
                      {cat.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-xs text-stone-500 max-w-xs truncate">
                    {cat.description || <span className="text-stone-300 italic">No description</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(cat)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setDeleteModal({ isOpen: true, id: cat.id })}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
        title="Delete Category?"
        message="Are you sure you want to delete this category? Products in this category may be affected and lose their classification."
        confirmText="Delete Category"
        type="danger"
      />
    </div>
  );
}
