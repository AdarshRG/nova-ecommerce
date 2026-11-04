// ==============================================================================
// FILE: app/error.tsx
// ARCHITECTURE ROLE: Enterprise Segment-Level Error Boundary & Crash Recovery UI
//
// 🎓 BEGINNER'S GUIDE TO REACT ERROR BOUNDARIES:
//   1. What is an Error Boundary?
//      In traditional React, an uncaught error inside a single button or component
//      would unmount the ENTIRE DOM tree, leaving the user with a blank white screen!
//      Next.js App Router's `error.tsx` creates an automatic Error Boundary around pages.
//      If an unhandled exception occurs, this fallback UI renders gracefully instead.
//
//   2. What is the `reset()` function?
//      Next.js passes a `reset()` callback to `error.tsx`. Calling `reset()` tells React
//      to re-attempt rendering the failing segment without forcing a full page reload!
// ==============================================================================

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  const [referenceId] = useState(() => `err_${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    // Log crash to console or external APM telemetry (Sentry/Datadog)
    console.error(`[CRASH TELEMETRY] Ref: ${referenceId} | Message: ${error.message}`, error);
  }, [error, referenceId]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center text-3xl mx-auto">
          ⚠️
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-800/40">
            System Anomaly Detected
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-3">
            Something Went Wrong
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            An unexpected error occurred while processing this page. Our telemetry service has logged this incident.
          </p>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-left">
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>Incident Reference:</span>
            <span className="font-mono text-violet-400 font-bold">{referenceId}</span>
          </div>
          {error.digest && (
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
              <span>Next.js Digest:</span>
              <span className="font-mono">{error.digest}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/30 transition-all active:scale-95"
          >
            ↻ Try Again
          </button>
          <Link
            href="/"
            className="flex-1 py-3 px-4 border border-slate-800 hover:bg-slate-800/60 text-slate-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center"
          >
            ← Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
