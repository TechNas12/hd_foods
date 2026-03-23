'use client';
import Navbar from '@/components/Navbar';
import ReactMarkdown from 'react-markdown';
import Footer from '@/components/Footer';
import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Loader2,
  Star,
  ChevronDown,
  BookMarked
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VariantSelector from '@/components/VariantSelector';
import ReviewSection from '@/components/ReviewSection';
import { useCart } from '@/lib/cart';
import { fetchProduct, fetchProductReviews } from '@/lib/api';
import type { Product, ProductVariant, Review } from '@/lib/types';
import ProductCarousel from '@/components/ProductCarousel';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      const data = await fetchProduct(slug);
      setProduct(data);
      if (data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
      // Load reviews
      const reviewData = await fetchProductReviews(data.id);
      setReviews(reviewData);
    } catch (err: any) {
      setError(err.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-red-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-4">{error || 'Product not found'}</h1>
          <Link href="/products" className="text-red-600 font-bold uppercase text-[10px] tracking-widest hover:text-red-700 cursor-pointer">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const price = selectedVariant?.price_override || product.base_price;

  const getVariantImages = () => {
    if (selectedVariant) {
      // Get images associated with this variant or fall back to product images
      const variantImages = product.images.filter(
        img => img.variant_id === selectedVariant.id
      );
      if (variantImages.length > 0) {
        return variantImages.map(img => img.image_url);
      }
    }
    return product.images.map(img => img.image_url);
  };

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}_${selectedVariant?.id || 0}`,
      productId: product.id,
      variantId: selectedVariant?.id || 0,
      name: product.name,
      variantName: selectedVariant?.name || 'Default',
      price: price,
      quantity: quantity,
      image: product.images?.[0]?.image_url || '',
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    setQuantity(1);
  };

  const handleBuyItNow = () => {
    addToCart({
      id: `${product.id}_${selectedVariant?.id || 0}`,
      productId: product.id,
      variantId: selectedVariant?.id || 0,
      name: product.name,
      variantName: selectedVariant?.name || 'Default',
      price: price,
      quantity: quantity,
      image: product.images?.[0]?.image_url || '',
    });
    router.push('/cart');
  };

  // Map variants to the format VariantSelector expects
  const variantsForSelector = product.variants.map(v => ({
    id: v.id,
    flavour: v.name,
    priceOverride: v.price_override,
    stockQuantity: v.stock_quantity,
    images: product.images
      .filter(img => img.variant_id === v.id || (!img.variant_id && v.id === product.variants[0]?.id))
      .map(img => img.image_url),
  }));

  // Map reviews for ReviewSection
  const reviewsForSection = reviews.map(r => ({
    id: r.id,
    author: r.user?.full_name || 'Anonymous',
    rating: r.rating,
    comment: r.comment || '',
    date: new Date(r.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
  }));

  return (<>
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header / Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link
          href="/products"
          className="flex items-center gap-2 text-stone-400 hover:text-red-600 transition-colors font-bold text-[10px] uppercase tracking-widest group cursor-pointer"
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
        {/* Left Column: Image Carousel & Description */}
        <div className="space-y-8">
          <ProductCarousel images={product.images} />

          {/* Description Accordion */}
          {product.description && (
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600 transition-transform group-hover:scale-110">
                    <BookMarked size={16} fill="currentColor" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-stone-900">Product Description</h3>
                </div>
                <motion.div
                  animate={{ rotate: isDescriptionOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-stone-400"
                >
                  <ChevronDown size={20} />
                </motion.div>
              </button>
              <motion.div
                initial={false}
                animate={{ height: isDescriptionOpen ? 'auto' : 0, opacity: isDescriptionOpen ? 1 : 0 }}
                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                className="overflow-hidden"
              >
                <div className="px-8 pb-8 pt-2">
                  <div className="h-px bg-stone-100 mb-6" />
                  <div className="prose prose-stone max-w-none prose-p:leading-[1.8] prose-p:text-lg prose-p:font-medium text-stone-600">
                    <ReactMarkdown>{product.description}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Right Column: Product Details */}
        <div className="space-y-12">
          {/* Title & Price */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  {product.category_rel?.name || 'Product'}
                </span>
                <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm">
                  <Star size={12} fill="currentColor" className="text-amber-500" /> {Number(product.rating).toFixed(1)} ({product.reviews_count} reviews)
                </span>
                {product.original_price && product.original_price > product.base_price && (
                  <span className="bg-yellow-500 text-stone-900 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {Math.round(((Number(product.original_price) - Number(product.base_price)) / Number(product.original_price)) * 100)}% OFF
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl md:text-6xl font-serif font-black text-stone-900 leading-[1.1]">
                  {product.name}
                </h1>
                {product.subtitle && (
                  <p className="text-lg font-medium text-stone-500 italic">
                    {product.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-black text-red-700">₹{price}</span>
              {product.original_price && Number(product.original_price) > Number(price) && (
                <span className="text-2xl text-stone-300 line-through decoration-stone-200/60 font-bold">
                  ₹{product.original_price}
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-stone-200" />

          {/* Variant Selector */}
          {variantsForSelector.length > 0 && (
            <VariantSelector
              variants={variantsForSelector}
              selectedVariantId={selectedVariant?.id}
              onSelect={(v) => {
                const realVariant = product.variants.find(pv => pv.id === v.id);
                setSelectedVariant(realVariant || v);
              }}
            />
          )}

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
                  onClick={() => setQuantity(Math.min(selectedVariant?.stock_quantity || 99, quantity + 1))}
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
                className={`flex-1 text-white h-[66px] rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer group ${isAdded ? 'bg-emerald-600 shadow-emerald-900/20' : 'bg-stone-900 shadow-stone-900/10 hover:shadow-stone-900/20'
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
                onClick={handleBuyItNow}
                whileHover={{ scale: 1.02, backgroundColor: "#B91C1C" }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-red-600 text-white h-[66px] rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl shadow-red-600/20 transition-all cursor-pointer"
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
                <feature.icon size={20} className="text-red-600" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-900">{feature.text}</p>
                  <p className="text-[9px] font-bold text-stone-400 capitalize">{feature.sub}</p>
                </div>
              </div>
            ))}
          </div>


          <div className="h-px bg-stone-200" />

          {/* Reviews Section */}
          <ReviewSection reviews={reviewsForSection} />
        </div>
      </main>

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
          background: #DC2626;
        }
      `}</style>
    </div>
    <Footer />
  </>
  );
}
