// ==============================================================================
// FILE: app/global-error.tsx
// ARCHITECTURE ROLE: Root Global Error Boundary (Catches Root Layout Crashes)
//
// 🎓 BEGINNER'S GUIDE TO GLOBAL ERROR BOUNDARIES:
//   Why do we need `global-error.tsx` in addition to `error.tsx`?
//   `app/error.tsx` catches errors inside pages and sub-layouts, but it DOES NOT catch
//   errors inside the root `app/layout.tsx`.
//   `global-error.tsx` is the absolute last line of defense in Next.js App Router.
//   It replaces the entire HTML document if the root layout crashes, guaranteeing
//   that even a catastrophic root failure renders a clean recovery screen!
// ==============================================================================

"use client";

import React, { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[CRITICAL ROOT CRASH TELEMETRY]:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-50 min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center text-3xl mx-auto">
            ⚡
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-800/40">
              Critical Root Exception
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-3">
              Storefront Unavailable
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              A critical root-level error occurred. The application was halted to protect data integrity.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-left">
            <span className="text-[10px] text-slate-500 block">Root Error Digest:</span>
            <span className="font-mono text-xs text-rose-400 font-bold break-all">
              {error.digest || "ERR_ROOT_LAYOUT_HALT"}
            </span>
          </div>

          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/30 transition-all active:scale-95"
          >
            ↻ Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
