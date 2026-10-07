// ==============================================================================
// FILE: components/checkout/CheckoutModal.tsx
// ARCHITECTURE ROLE: Enterprise Shipping Address & Checkout Validation Modal
//
// ROUTE MAP & COMPONENT FLOW:
//   1. Triggered by clicking "Proceed to Checkout" inside `<CartDrawer />`.
//   2. Manages `AddressFormData` state and real-time field error validation (`FormErrors`).
//   3. Displays dynamic order summary details extracted from `useCartStore`.
//   4. Simulates clean order placement, dispatches success toast notification, and clears cart.
// ==============================================================================

"use client";

import React, { useState } from "react";
import { AddressFormData, FormErrors } from "../../types/product";
import { useCartStore } from "../../store/useCartStore";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const {
    items,
    getSubtotalPrice,
    getShippingFee,
    getFinalPrice,
    discountAmount,
    appliedPromo,
    clearCart,
    showToast,
  } = useCartStore();

  // Local State: Form Input Values
  const [formData, setFormData] = useState<AddressFormData>({
    fullName: "",
    email: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    phoneNumber: "",
  });

  // Local State: Validation Error Messages per field
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  if (!isOpen) return null;

  // Real-time Field Validation Function
  const validateField = (name: keyof AddressFormData, value: string): string => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Full name is required.";
        if (value.trim().length < 2) return "Name must be at least 2 characters.";
        return "";
      case "email":
        if (!value.trim()) return "Email address is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
          return "Please enter a valid email address.";
        return "";
      case "streetAddress":
        if (!value.trim()) return "Street address is required.";
        return "";
      case "city":
        if (!value.trim()) return "City is required.";
        return "";
      case "postalCode":
        if (!value.trim()) return "Postal code is required.";
        if (value.trim().length < 4) return "Enter a valid postal code.";
        return "";
      case "phoneNumber":
        if (!value.trim()) return "Phone number is required.";
        if (value.trim().length < 8) return "Enter a valid phone number.";
        return "";
      default:
        return "";
    }
  };

  // Change Handler: Update input and validate field dynamically
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof AddressFormData;

    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    const errorMsg = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: errorMsg }));
  };

  // Submit Handler: Validate all fields before placing order
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Run validation across all form fields
    const newErrors: FormErrors = {};
    (Object.keys(formData) as Array<keyof AddressFormData>).forEach((field) => {
      const msg = validateField(field, formData[field]);
      if (msg) newErrors[field] = msg;
    });

    setErrors(newErrors);

    // Halt submission if any validation errors exist
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    // Simulate server response network delay (1200ms)
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderComplete(true);
      clearCart();
      showToast(
        `Order confirmed! Receipt sent to ${formData.email}`,
        undefined,
        "success"
      );
    }, 1200);
  };

  const subtotal = getSubtotalPrice();
  const shipping = getShippingFee();
  const finalTotal = getFinalPrice();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      {/* Dimmed Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-slate-50 z-10 overflow-hidden">
        {orderComplete ? (
          /* Order Confirmation View */
          <div className="py-8 text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center text-4xl mx-auto animate-bounce">
              ✓
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Order Confirmed!
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-white">{formData.fullName}</strong>. Your order has been placed successfully. A confirmation receipt has been dispatched to <span className="text-violet-400 font-semibold">{formData.email}</span>.
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs max-w-md mx-auto text-left space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Shipping Address:</span>
                <span className="font-bold text-white">{formData.streetAddress}, {formData.city}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span>Total Paid:</span>
                <span className="font-black text-violet-400">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setOrderComplete(false);
                onClose();
              }}
              className="mt-6 px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/30 transition-all"
            >
              Back to Storefront
            </button>
          </div>
        ) : (
          /* Checkout Form View */
          <div>
            {/* Header */}
            <div className="flex justify-between items-center pb-5 border-b border-slate-800/80 mb-6">
              <div>
                <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">
                  Secure Enterprise Checkout
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
                  Shipping Information
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                      errors.fullName
                        ? "border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30"
                        : "border-slate-800 focus:border-violet-500"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                      errors.email
                        ? "border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30"
                        : "border-slate-800 focus:border-violet-500"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Street Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder="123 Tech Boulevard, Suite 400"
                  className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                    errors.streetAddress
                      ? "border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30"
                      : "border-slate-800 focus:border-violet-500"
                  }`}
                />
                {errors.streetAddress && (
                  <p className="text-[10px] text-rose-400 mt-1 font-semibold">
                    {errors.streetAddress}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    City <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="San Francisco"
                    className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                      errors.city
                        ? "border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30"
                        : "border-slate-800 focus:border-violet-500"
                    }`}
                  />
                  {errors.city && (
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold">
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Postal Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="94107"
                    className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                      errors.postalCode
                        ? "border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30"
                        : "border-slate-800 focus:border-violet-500"
                    }`}
                  />
                  {errors.postalCode && (
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold">
                      {errors.postalCode}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+1 (555) 019-2834"
                    className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                      errors.phoneNumber
                        ? "border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/30"
                        : "border-slate-800 focus:border-violet-500"
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Pricing Summary */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 mt-6 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({items.length} items):</span>
                  <span className="text-slate-200 font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({appliedPromo}):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Express Shipping:</span>
                  <span className={shipping === 0 ? "text-emerald-400 font-bold" : "text-slate-200 font-semibold"}>
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>Total Amount:</span>
                  <span className="text-violet-400">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3.5 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-black rounded-xl shadow-lg shadow-violet-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing Order...
                    </span>
                  ) : (
                    <span>Confirm Order & Pay ${finalTotal.toFixed(2)} →</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
