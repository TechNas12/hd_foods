'use client';

import { motion } from 'framer-motion';

interface Variant {
  id: number;
  flavour: string;
  priceOverride: number | null;
  stockQuantity: number;
  images: string[];
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: number;
  onSelect: (variant: Variant) => void;
}

export default function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
}: VariantSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black uppercase tracking-widest text-stone-900">
        Select Flavour
      </h3>
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => onSelect(variant)}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer border ${
              selectedVariantId === variant.id
                ? 'bg-red-700 border-red-700 text-white shadow-lg shadow-red-900/20'
                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900'
            }`}
          >
            {variant.flavour}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            (variants.find(v => v.id === selectedVariantId)?.stockQuantity || 0) > 10 
              ? 'bg-emerald-500' 
              : (variants.find(v => v.id === selectedVariantId)?.stockQuantity || 0) > 0 
                ? 'bg-amber-500' 
                : 'bg-red-500'
          }`} />
          <span className="text-stone-900">
            {variants.find(v => v.id === selectedVariantId)?.stockQuantity} in stock
          </span>
        </div>
      </div>
    </div>
  );
}
