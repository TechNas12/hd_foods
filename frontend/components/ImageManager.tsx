'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  Upload, Cloud, X, Star, GripVertical, Trash2, 
  Loader2, AlertCircle, FileImage, CheckCircle2 
} from 'lucide-react';
import { supabase, BUCKET_NAME } from '@/lib/supabase';
import type { ProductImage } from '@/lib/types';
import { adminAddProductImage, adminDeleteProductImage, adminUpdateProductImage } from '@/lib/api';
import AlertModal from '@/components/ui/AlertModal';

interface ImageManagerProps {
  productId: number;
  images: ProductImage[];
  onUpdate: () => void;
}

interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

export default function ImageManager({ productId, images, onUpdate }: ImageManagerProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, image: ProductImage | null }>({
    isOpen: false,
    image: null
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending' as const
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);
  };

  const startUpload = async (uploadFile: UploadingFile) => {
    if (uploadFile.file.size > 5 * 1024 * 1024) {
      updateFileStatus(uploadFile.id, { status: 'error', error: 'Size > 5MB' });
      return;
    }

    const fileExt = uploadFile.file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${productId}/${fileName}`;

    updateFileStatus(uploadFile.id, { status: 'uploading', progress: 10 });

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, uploadFile.file);

      if (error) throw error;

      updateFileStatus(uploadFile.id, { status: 'uploading', progress: 60 });

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      // Insert into product_images table using Backend API
      const sortOrder = images.length + uploadingFiles.findIndex(f => f.id === uploadFile.id);
      
      await adminAddProductImage(productId, {
        storage_path: filePath,
        image_url: publicUrl,
        is_hero: images.length === 0 && uploadingFiles.findIndex(f => f.id === uploadFile.id) === 0,
        sort_order: sortOrder
      });

      updateFileStatus(uploadFile.id, { status: 'success', progress: 100 });
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadFile.id));
        onUpdate();
      }, 1000);

    } catch (err: any) {
      updateFileStatus(uploadFile.id, { status: 'error', error: err.message });
    }
  };

  const updateFileStatus = (id: string, updates: Partial<UploadingFile>) => {
    setUploadingFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  useEffect(() => {
    const next = uploadingFiles.find(f => f.status === 'pending');
    if (next) startUpload(next);
  }, [uploadingFiles]);

  const handleDelete = async (image: ProductImage) => {
    setIsProcessing(true);
    try {
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([image.storage_path]);

      await adminDeleteProductImage(image.id);

      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setDeleteModal({ isOpen: false, image: null });
    }
  };

  const setHero = async (image: ProductImage) => {
    setIsProcessing(true);
    try {
      await adminUpdateProductImage(image.id, { is_hero: true });

      onUpdate();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReorder = async (newImages: ProductImage[]) => {
    for (let i = 0; i < newImages.length; i++) {
      await adminUpdateProductImage(newImages[i].id, { sort_order: i });
    }
    onUpdate();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Product Media</h3>
          <p className="text-stone-500 text-sm">Manage your product images and hero shot.</p>
        </div>
        <label className="bg-stone-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer hover:bg-stone-800 transition-all">
          <Upload size={14} />
          Upload Images
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
        </label>
      </div>

      {/* Uploading List */}
      {uploadingFiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {uploadingFiles.map(file => (
            <div key={file.id} className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              <img src={file.preview} alt="preview" className="w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                {file.status === 'uploading' && <Loader2 size={24} className="animate-spin text-stone-900 mb-2" />}
                {file.status === 'error' && <AlertCircle size={24} className="text-red-500 mb-2" />}
                {file.status === 'success' && <CheckCircle2 size={24} className="text-emerald-500 mb-2" />}
                <p className="text-[10px] font-bold uppercase tracking-tight truncate w-full">
                  {file.error || (file.status === 'uploading' ? `Uploading... ${file.progress}%` : file.status)}
                </p>
                {file.status === 'error' && (
                  <button type="button" onClick={() => setUploadingFiles(prev => prev.filter(f => f.id !== file.id))} className="mt-2 text-stone-500 hover:text-stone-900">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reorderable Grid */}
      <Reorder.Group 
        axis="y" 
        values={images} 
        onReorder={handleReorder}
        className="space-y-4"
      >
        {images.map((image, index) => (
          <Reorder.Item key={image.id} value={image}>
            <div className={`flex items-center gap-4 p-4 rounded-2xl bg-white border-2 transition-all ${
              image.is_hero ? 'border-red-600 shadow-xl' : 'border-stone-100 hover:border-stone-200 shadow-sm'
            }`}>
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                <img src={image.image_url} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Position #{index + 1}</span>
                  {image.is_hero && (
                    <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest">
                      Hero Shot
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 font-medium truncate max-w-xs">{image.storage_path.split('/').pop()}</p>
                <div className="flex items-center gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => setHero(image)}
                    disabled={isProcessing}
                    className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                      image.is_hero ? 'text-yellow-600' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <Star size={12} fill={image.is_hero ? 'currentColor' : 'none'} />
                    {image.is_hero ? 'Main Image' : 'Set as Main'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDeleteModal({ isOpen: true, image })}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>

              <div className="w-10 h-10 flex items-center justify-center text-stone-300 cursor-grab active:cursor-grabbing hover:bg-stone-50 rounded-xl transition-colors">
                <GripVertical size={20} />
              </div>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {images.length === 0 && uploadingFiles.length === 0 && (
        <div className="py-12 border-2 border-dashed border-stone-200 rounded-3xl flex flex-col items-center text-center gap-4 bg-stone-50/50">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-stone-300 border border-stone-100 shadow-sm">
            <FileImage size={32} />
          </div>
          <div className="space-y-1">
            <p className="font-serif font-bold text-stone-900">No images uploaded yet</p>
            <p className="text-stone-400 text-sm max-w-[240px]">Upload at least one hero shot to make your product profile stand out.</p>
          </div>
        </div>
      )}

      <AlertModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={() => deleteModal.image && handleDelete(deleteModal.image)}
        title="Remove Image?"
        message="Are you sure you want to remove this image from the product gallery? This will also delete it from storage."
        confirmText="Remove Image"
        type="danger"
      />
    </div>
  );
}
