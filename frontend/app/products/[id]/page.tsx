'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, use } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus
} from 'lucide-react';
import Link from 'next/link';
import ImageCarousel from '@/components/ImageCarousel';
import VariantSelector from '@/components/VariantSelector';
import ReviewSection from '@/components/ReviewSection';
import { useCart } from '@/lib/cart';

// Mock Product Data (Matching products/page.tsx but with more details)
const productsData: Record<number, any> = {
  1: {
    id: 1,
    name: "Methi Thepla",
    subtitle: "Soft, spiced & ready-to-eat fenugreek flatbread",
    description: "Our signature Methi Thepla is a nutritional powerhouse made with fresh fenugreek leaves, whole wheat flour, and a secret blend of hand-ground spices. Perfectly soft and slightly tangy, these are vacuum-sealed to preserve freshness for your travels or daily breakfast.\n\nTraditionally served with mango pickle or spicy garlic chutney, these theplas bring the authentic taste of a Gujarati household right to your table. No preservatives added, 100% natural ingredients.",
    category: "Theplas",
    basePrice: 149,
    compareAtPrice: 199,
    isAd: true,
    variants: [
      {
        id: 101,
        flavour: "Traditional Methi",
        priceOverride: null,
        stockQuantity: 45,
        images: [
          "https://picsum.photos/seed/thepla1/800/800",
          "https://picsum.photos/seed/thepla2/800/800",
          "https://picsum.photos/seed/thepla3/800/800"
        ]
      },
      {
        id: 102,
        flavour: "Garlic & Chilli",
        priceOverride: 169,
        stockQuantity: 12,
        images: [
          "https://picsum.photos/seed/thepla_g1/800/800",
          "https://picsum.photos/seed/thepla_g2/800/800"
        ]
      }
    ],
    reviews: [
      { id: 1, author: "Priya Shah", rating: 5, comment: "Exactly like my grandmother makes! Very soft even after 3 days.", date: "March 2024" },
      { id: 2, author: "Rahul V.", rating: 4, comment: "Great for office lunch. Packaging is very high quality.", date: "February 2024" }
    ]
  },
  2: {
    id: 2,
    name: "Authentic Garam Masala",
    subtitle: "Heritage blend of 12 whole spices, stone-ground",
    description: "Elevate your cooking with our stone-ground Garam Masala. Unlike factory-processed powders, our spices are roasted at low temperatures to retain their essential oils and aroma.\n\nThis heritage blend includes premium black cardamom, cinnamon sticks, cloves, and mace, balanced perfectly for curries, biryanis, and everyday vegetables.",
    category: "Pure Spices",
    basePrice: 199,
    compareAtPrice: 299,
    isAd: false,
    variants: [
      {
        id: 201,
        flavour: "Mild & Aromatic",
        priceOverride: null,
        stockQuantity: 88,
        images: [
          "https://picsum.photos/seed/masala1/800/800",
          "https://picsum.photos/seed/masala2/800/800"
        ]
      },
      {
        id: 202,
        flavour: "Extra Spicy (Teja)",
        priceOverride: 229,
        stockQuantity: 5,
        images: [
          "https://picsum.photos/seed/masala_s1/800/800"
        ]
      }
    ],
    reviews: [
      { id: 3, author: "Amit K.", rating: 5, comment: "The aroma is incredible. Just a pinch is enough.", date: "March 2024" }
    ]
  }
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  <Navbar />
  const { id } = use(params);
  const product = productsData[parseInt(id)] || productsData[1]; // Fallback for demo

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

  const price = selectedVariant.priceOverride || product.basePrice;

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}_${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      variantName: selectedVariant.flavour,
      price: price,
      quantity: quantity,
      image: selectedVariant.images[0]
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    setQuantity(1); // Reset quantity
  };

  return (<>

    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header / Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link
          href="/products"
          className="flex items-center gap-2 text-stone-400 hover:text-red-700 transition-colors font-bold text-[10px] uppercase tracking-widest group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </Link>
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-stone-900 border border-stone-100">
            <ShoppingBag size={18} />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Left Column: Image Carousel */}
        <div className="lg:sticky lg:top-8 h-fit">
          <ImageCarousel images={selectedVariant.images} />
        </div>

        {/* Right Column: Product Details */}
        <div className="space-y-12">
          {/* Title & Price */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {product.isAd && (
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                    Featured
                  </span>
                )}
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  {product.category}
                </span>
              </div>
              <h1 className="text-5xl font-serif font-black text-stone-900 leading-[1.1]">
                {product.name}
              </h1>
              <p className="text-xl text-stone-500 font-medium leading-relaxed max-w-lg">
                {product.subtitle}
              </p>
            </div>

            <div className="flex items-end gap-5">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Premium Quality</p>
                <p className="text-4xl font-black text-red-700">₹{price}</p>
              </div>
              <p className="text-xl text-stone-300 line-through font-medium translate-y-[-4px]">₹{product.compareAtPrice}</p>
              <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-xl text-[11px] font-black translate-y-[-6px]">
                SAVE {Math.round(((product.compareAtPrice - price) / product.compareAtPrice) * 100)}%
              </div>
            </div>
          </div>

          <div className="h-px bg-stone-200" />

          {/* Variant Selector */}
          <VariantSelector
            variants={product.variants}
            selectedVariantId={selectedVariant.id}
            onSelect={(v) => setSelectedVariant(v)}
          />

          <div className="h-px bg-stone-200" />

          {/* Quantity & Add to Cart */}
          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-stone-900">Quantity</h3>
              <div className="flex items-center bg-white border border-stone-200 rounded-2xl p-1 shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-black text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant.stockQuantity, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex gap-4 min-w-[300px]">
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 text-white h-[66px] rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer group ${
                  isAdded ? 'bg-emerald-600 shadow-emerald-900/20' : 'bg-stone-900 shadow-stone-900/10 hover:shadow-stone-900/20'
                }`}
              >
                {isAdded ? (
                  <>Added to Cart!</>
                ) : (
                  <>
                    <ShoppingBag size={20} className="group-hover:-rotate-12 transition-transform" />
                    Add to Cart
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-red-700 text-white h-[66px] rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl shadow-red-900/20 hover:bg-red-800 transition-all cursor-pointer"
              >
                <Zap size={20} fill="currentColor" />
                Buy It Now
              </motion.button>
            </div>
          </div>

          {/* Features / Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, text: "Fast Shipping", sub: "2-4 Days" },
              { icon: ShieldCheck, text: "Authentic", sub: "100% Pure" },
              { icon: RotateCcw, text: "Easy Return", sub: "7 Day window" },
              { icon: Zap, text: "Fresh Stock", sub: "Ground Weekly" }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center gap-2 shadow-sm">
                <feature.icon size={20} className="text-red-700" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-900">{feature.text}</p>
                  <p className="text-[9px] font-bold text-stone-400 capitalize">{feature.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-stone-900">The Story Behind</h3>
            <div className="max-h-60 overflow-y-auto pr-6 custom-scrollbar">
              <p className="text-stone-600 leading-[1.8] text-lg font-medium whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          </div>

          <div className="h-px bg-stone-200" />

          {/* Reviews Section */}
          <ReviewSection reviews={product.reviews} />
        </div>
      </main>

      {/* Styled scrollbar for description */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #B91C1C;
        }
      `}</style>
    </div>
    <Footer />
  </>

  );
}
