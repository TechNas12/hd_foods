'use client';

import { useState, useRef } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  Upload, Star, Trash2, GripVertical, 
  Loader2, Image as ImageIcon, Plus, X
} from 'lucide-react';
import { supabase, BUCKET_NAME } from '@/lib/supabase';
import AlertModal from '@/components/ui/AlertModal';

export interface VisualImage {
  id?: string; // For existing images
  image_url: string;
  storage_path: string;
  is_hero: boolean;
  sort_order: number;
}

interface VisualImagePickerProps {
  images: VisualImage[];
  onChange: (images: VisualImage[]) => void;
  folder?: string; // e.g. "products/new"
}

export default function VisualImagePicker({ images, onChange, folder = 'temp' }: VisualImagePickerProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, index: number | null }>({
    isOpen: false,
    index: null
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages = [...images];

    for (const file of Array.from(files)) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        newImages.push({
          image_url: publicUrl,
          storage_path: filePath,
          is_hero: newImages.length === 0,
          sort_order: newImages.length
        });
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    onChange(newImages);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // If we removed the hero, make the first one hero
    if (images[index].is_hero && newImages.length > 0) {
      newImages[0].is_hero = true;
    }
    // Update sort orders
    onChange(newImages.map((img, i) => ({ ...img, sort_order: i })));
  };

  const toggleHero = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_hero: i === index
    }));
    onChange(newImages);
  };

  const handleReorder = (reorderedImages: VisualImage[]) => {
    onChange(reorderedImages.map((img, i) => ({ ...img, sort_order: i })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-stone-900">Product Images</h3>
          <p className="text-xs text-stone-500">Upload high-quality images. Drag to reorder.</p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {uploading ? 'Uploading...' : 'Add Images'}
        </button>
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <Reorder.Group 
        axis="y" 
        values={images} 
        onReorder={handleReorder}
        className="space-y-4"
      >
        {images.map((img, index) => (
          <Reorder.Item key={img.storage_path} value={img}>
            <div className={`flex items-center gap-4 p-4 rounded-2xl bg-white border-2 transition-all ${
              img.is_hero ? 'border-red-600 shadow-xl' : 'border-stone-100 hover:border-stone-200 shadow-sm'
            }`}>
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Position #{index + 1}</span>
                  {img.is_hero && (
                    <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest">
                      Hero Shot
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 font-medium truncate max-w-xs">{img.storage_path.split('/').pop()}</p>
                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => toggleHero(index)}
                    className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                      img.is_hero ? 'text-yellow-600' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <Star size={12} fill={img.is_hero ? "currentColor" : "none"} />
                    {img.is_hero ? 'Main Image' : 'Set as Main'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteModal({ isOpen: true, index })}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>

              <div className="w-10 h-10 flex items-center justify-center text-stone-300 cursor-grab active:cursor-grabbing hover:bg-stone-50 rounded-xl transition-colors">
                <GripVertical size={20} />
              </div>
            </div>
          </Reorder.Item>
        ))}
        
        {images.length === 0 && !uploading && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-stone-100 hover:border-stone-300 transition-all"
          >
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center text-stone-300">
              <ImageIcon size={20} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Add Images</p>
          </div>
        )}
      </Reorder.Group>

      <AlertModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={() => {
          if (deleteModal.index !== null) {
            removeImage(deleteModal.index);
          }
        }}
        title="Remove Image?"
        message="Are you sure you want to remove this image? It won't be deleted from storage until you save the product, but it will be removed from this list."
        confirmText="Remove"
        type="warning"
      />
    </div>
  );
}
