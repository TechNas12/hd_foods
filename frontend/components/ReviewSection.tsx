'use client';

import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewSectionProps {
  reviews: Review[];
}

export default function ReviewSection({ reviews: initialReviews }: ReviewSectionProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [newReview, setNewReview] = useState({ author: '', rating: 5, comment: '' });
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const review: Review = {
      id: Date.now(),
      ...newReview,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
    setReviews([review, ...reviews]);
    setNewReview({ author: '', rating: 5, comment: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between border-b border-stone-200 pb-8">
        <div>
          <h3 className="text-2xl font-serif font-bold text-stone-900">Customer Reviews</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={14} fill={star <= 4.7 ? 'currentColor' : 'none'} />
              ))}
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">
              4.7 Average (based on {reviews.length} reviews)
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-6 py-3 bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-stone-800 transition-all cursor-pointer"
        >
          {isAdding ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-stone-100 p-8 rounded-3xl space-y-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-2">Your Name</label>
                <input
                  required
                  value={newReview.author}
                  onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                  className="w-full bg-white border border-stone-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-red-700 transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-2">Rating</label>
                <div className="flex gap-2 p-2 bg-white border border-stone-200 rounded-2xl justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className={`cursor-pointer transition-colors ${
                        star <= newReview.rating ? 'text-amber-500' : 'text-stone-200'
                      }`}
                    >
                      <Star size={24} fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-2">Your Thoughts</label>
              <textarea
                required
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full bg-white border border-stone-200 rounded-3xl px-6 py-4 text-sm focus:outline-none focus:border-red-700 transition-all min-h-[120px]"
                placeholder="The flavor is authentic and..."
              />
            </div>
            <button className="flex items-center gap-3 px-8 py-4 bg-red-700 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-800 transition-all shadow-lg cursor-pointer">
              <Send size={16} />
              Submit Review
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {reviews.map((review) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={review.id}
            className="p-8 bg-white rounded-[2rem] border border-stone-100 shadow-sm space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-serif font-bold text-lg text-stone-900">{review.author}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{review.date}</p>
              </div>
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={12} fill={star <= review.rating ? 'currentColor' : 'none'} />
                ))}
              </div>
            </div>
            <p className="text-stone-600 leading-relaxed italic">"{review.comment}"</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
