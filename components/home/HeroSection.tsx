import React from "react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 px-6 bg-radial from-slate-900 via-slate-950 to-slate-950">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            NOVA 2026 Next-Gen Hardware Series
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Premium Gear Built For The{" "}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Future
            </span>
            .
          </h1>

          <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
            Experience pinnacle engineering and minimal elegance. Designed for
            high performance, built to seamlessly integrate with modern life.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#featured"
              className="px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02]"
            >
              Explore Collection →
            </a>
            <button className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-semibold text-slate-300 transition-all">
              View Launch Event
            </button>
          </div>
        </div>

        {/* Hero Product Spotlight Card */}
        <div className="relative flex justify-center">
          <Link
            href="/products/nova-sonic-wireless"
            className="w-full max-w-md aspect-square rounded-3xl bg-gradient-to-br from-violet-900/30 via-slate-900 to-indigo-950 border border-slate-800/80 p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-violet-500/50 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -z-10 group-hover:bg-violet-500/20 transition-all" />
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400 bg-violet-950/60 px-3 py-1 rounded-full border border-violet-800/50">
                Featured Release
              </span>
              <span className="text-2xl font-bold text-white">$249.99</span>
            </div>

            <div className="my-auto py-8 text-center">
              <div className="w-36 h-36 mx-auto rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-5xl shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                🎧
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors">
                NOVA Sonic Wireless
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Active Noise Cancellation • 40h Battery
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
