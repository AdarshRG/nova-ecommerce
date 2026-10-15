// ==============================================================================
// FILE: components/auth/AuthModal.tsx
// ARCHITECTURE ROLE: Customer Sign In & Registration Modal Component
//
// 🎓 BEGINNER'S GUIDE TO THIS COMPONENT:
//   What is this component?
//     This is the popup modal where users can either "Sign In" to an existing account
//     or "Create Account" as a new customer.
//   How does it work?
//     1. It uses a `tab` state ("signin" or "register") to switch between login and signup forms.
//     2. It includes a convenient "✨ 1-Click Quick Demo Sign In" button so anyone testing
//        the site can log in immediately without having to type!
//     3. Once submitted, it calls `login(email, name)` from `useAuthStore`, which updates
//        the user session globally.
// ==============================================================================

"use client";

import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";

export default function AuthModal() {
  // Extract values and actions from the Auth store
  const { isAuthModalOpen, closeAuthModal, login } = useAuthStore();

  // Local Component State
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Guard Clause: If modal is closed, render nothing
  if (!isAuthModalOpen) return null;

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic email format validation
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Call login action from our Zustand store
    login(email, tab === "register" ? name : undefined);

    // Reset local form fields
    setEmail("");
    setName("");
    setPassword("");
  };

  // Quick Demo Login Handler (1-click testing)
  const handleDemoLogin = () => {
    login("alex.chen@nova.com", "Alex Chen");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Dimmed Background Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-slate-50 z-10 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl mx-auto mb-3 shadow-lg shadow-violet-600/30">
            N
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {tab === "signin" ? "Welcome Back" : "Join NOVA Membership"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {tab === "signin"
              ? "Access your saved bag, order history, and VIP perks."
              : "Create an account for expedited checkout and warranty tracking."}
          </p>
        </div>

        {/* 1-Click Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full mb-4 py-2.5 px-4 bg-violet-950/60 hover:bg-violet-900/60 border border-violet-500/40 text-violet-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
        >
          <span>✨ 1-Click Demo Sign In (Alex Chen)</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-950 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider absolute">
            Or continue with email
          </span>
        </div>

        {/* Sign In vs Register Tabs Toggle */}
        <div className="flex bg-slate-900 p-1 rounded-xl mb-4 border border-slate-800">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === "signin"
                ? "bg-violet-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === "register"
                ? "bg-violet-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name field (Only shown when registering) */}
          {tab === "register" && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-[11px] text-rose-400 font-semibold">{error}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/30 transition-all active:scale-95 mt-2"
          >
            {tab === "signin" ? "Sign In →" : "Create Account →"}
          </button>
        </form>
      </div>
    </div>
  );
}
