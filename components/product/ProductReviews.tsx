// ==============================================================================
// FILE: components/product/ProductReviews.tsx
// ARCHITECTURE ROLE: Interactive Customer Reviews, Ratings & Review Submission Component
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Mounted on dynamic Product Detail Pages (`app/products/[slug]/page.tsx`).
//   2. Calculates rating breakdown bar distribution (5-star, 4-star, 3-star percentages).
//   3. Displays verified customer reviews (`Review[]`) with helpful upvote buttons.
//   4. Provides an interactive "Write a Review" modal form allowing users to submit new ratings.
//   5. Triggers global Toast alerts upon successful review submission.
// ==============================================================================

"use client";

import React, { useState } from "react";
import { Product, Review, NewReviewFormData } from "../../types/product";
import { useCartStore } from "../../store/useCartStore";

interface ProductReviewsProps {
  product: Product;
}

export default function ProductReviews({ product }: ProductReviewsProps) {
  const { showToast } = useCartStore();

  // Local State: Array of reviews (initialized from product.reviews or default mock reviews)
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});

  // Local State: New Review Submission Form Data
  const [formData, setFormData] = useState<NewReviewFormData>({
    author: "",
    rating: 5,
    title: "",
    comment: "",
  });

  // Calculate rating breakdown distribution (count of 5-star, 4-star reviews)
  const totalReviews = reviewsList.length;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviewsList.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });

  // Handler: Upvote a review as helpful
  const handleHelpfulClick = (reviewId: string) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
  };

  // Handler: Submit new customer review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.author.trim() || !formData.comment.trim()) {
      showToast("Please fill in your name and review comment.", undefined, "warning");
      return;
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author: formData.author.trim(),
      avatar: formData.author.trim().slice(0, 2).toUpperCase(),
      rating: formData.rating,
      date: new Date().toISOString().split("T")[0],
      title: formData.title.trim() || "Great hardware purchase",
      comment: formData.comment.trim(),
      verifiedPurchase: true,
      helpfulCount: 0,
    };

    setReviewsList((prev) => [newReview, ...prev]);
    setIsModalOpen(false);
    setFormData({ author: "", rating: 5, title: "", comment: "" });
    showToast("Review submitted successfully! Thank you for your feedback.", undefined, "success");
  };

  return (
    <section className="mt-16 pt-12 border-t border-slate-900">
      {/* Section Title & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <span className="text-xs font-bold text-violet-400 uppercase tracking-widest bg-violet-950/60 px-3 py-1 rounded-full border border-violet-800/50">
            Customer Feedback
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight mt-2">
            Ratings & Customer Reviews
          </h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/30 active:scale-95"
        >
          + Write a Review
        </button>
      </div>

      {/* Ratings Score Summary & Distribution Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
        {/* Left Column: Overall Score Card */}
        <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
          <span className="text-5xl font-black text-white tracking-tight">
            {product.rating.toFixed(1)}
          </span>
          <div className="flex items-center gap-1 my-2 text-amber-400 text-lg">
            ★ ★ ★ ★ ★
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Based on {totalReviews} verified reviews
          </span>
        </div>

        {/* Right 2 Columns: Rating Distribution Bar Chart */}
        <div className="md:col-span-2 space-y-2 justify-center flex flex-col">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars as keyof typeof ratingCounts] || 0;
            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-slate-300 shrink-0">
                  {stars} Stars
                </span>
                <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-8 text-right font-bold text-slate-400 shrink-0">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewsList.map((review) => {
          const upvotes = (helpfulVotes[review.id] || 0) + review.helpfulCount;

          return (
            <div
              key={review.id}
              className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-3"
            >
              {/* Header: Author Avatar & Rating */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 font-bold border border-violet-500/30 flex items-center justify-center text-xs">
                    {review.avatar || review.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">
                        {review.author}
                      </h4>
                      {review.verifiedPurchase && (
                        <span className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ✓ Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">{review.date}</span>
                  </div>
                </div>

                <div className="text-amber-400 text-xs font-bold">
                  {"★".repeat(review.rating)}
                  <span className="text-slate-700">
                    {"★".repeat(5 - review.rating)}
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <div>
                <h5 className="font-bold text-white text-sm">{review.title}</h5>
                <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
                  {review.comment}
                </p>
              </div>

              {/* Upvote Helpful Bar */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleHelpfulClick(review.id)}
                  className="text-slate-400 hover:text-white text-xs font-semibold bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 hover:border-slate-700 transition-colors"
                >
                  <span>👍 Helpful ({upvotes})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Write a Review Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-slate-50 z-10">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-xl font-bold text-white">Write a Review</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Rating Score
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`text-2xl transition-transform ${
                        star <= formData.rating
                          ? "text-amber-400 scale-110"
                          : "text-slate-700"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-400 ml-2">
                    {formData.rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Author Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Your Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder="e.g. Alex Johnson"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Headline Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. Incredible sound quality!"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Review Content */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Review Details <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  placeholder="Share details about performance, battery life, or build quality..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 border border-slate-800 hover:bg-slate-900 text-slate-400 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/30"
                >
                  Submit Review →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
