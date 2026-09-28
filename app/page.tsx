import React from "react";

// Types for NOVA E-Commerce
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  imageBg: string;
  tag?: string;
}

interface Category {
  id: string;
  name: string;
  itemCount: number;
  gradient: string;
}

const FEATURED_CATEGORIES: Category[] = [
  { id: "1", name: "Audio & Tech", itemCount: 24, gradient: "from-blue-600 to-indigo-700" },
  { id: "2", name: "Wearables", itemCount: 18, gradient: "from-purple-600 to-pink-600" },
  { id: "3", name: "Smart Home", itemCount: 32, gradient: "from-emerald-600 to-teal-700" },
  { id: "4", name: "Accessories", itemCount: 45, gradient: "from-amber-500 to-orange-600" },
];

const FEATURED_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "NOVA Sonic Wireless Headphones",
    category: "Audio & Tech",
    price: 249.99,
    rating: 4.9,
    imageBg: "bg-slate-800",
    tag: "Best Seller",
  },
  {
    id: "p2",
    name: "NOVA Pulse Smartwatch Pro",
    category: "Wearables",
    price: 199.50,
    rating: 4.8,
    imageBg: "bg-indigo-900",
    tag: "New Arrival",
  },
  {
    id: "p3",
    name: "NOVA Lumina Ambient Light Bar",
    category: "Smart Home",
    price: 89.00,
    rating: 4.7,
    imageBg: "bg-zinc-800",
  },
  {
    id: "p4",
    name: "NOVA Core Ergonomic Backpack",
    category: "Accessories",
    price: 119.99,
    rating: 4.9,
    imageBg: "bg-stone-800",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 py-2 px-4 text-center text-xs sm:text-sm font-medium tracking-wide">
        🚀 Launch Special: Free Worldwide Express Shipping on Orders Over $99 | Use Code <span className="font-bold underline">NOVANEXT</span>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/30">
              N
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              NOVA
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#" className="hover:text-white transition-colors">Shop</a>
            <a href="#categories" className="hover:text-white transition-colors">Categories</a>
            <a href="#featured" className="hover:text-white transition-colors">Featured</a>
            <a href="#" className="hover:text-white transition-colors">Deals</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-2 text-sm text-slate-400 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 hover:border-slate-700 transition-colors">
              <span>🔍 Search products...</span>
              <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">⌘K</kbd>
            </button>
            <button className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors text-slate-200">
              🛒
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-violet-600 text-[10px] font-bold text-white flex items-center justify-center">
                2
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 bg-radial from-slate-900 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
              NOVA 2026 Next-Gen Hardware Series
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              Premium Gear Built For The <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">Future</span>.
            </h1>

            <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
              Experience pinnacle engineering and minimal elegance. Designed for high performance, built to seamlessly integrate with modern life.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button className="px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02]">
                Explore Collection →
              </button>
              <button className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-semibold text-slate-300 transition-all">
                View Launch Event
              </button>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="relative flex justify-center">
            <div className="w-full max-w-md aspect-square rounded-3xl bg-gradient-to-br from-violet-900/30 via-slate-900 to-indigo-950 border border-slate-800/80 p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
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
                <h3 className="text-xl font-bold text-white">NOVA Sonic Wireless</h3>
                <p className="text-xs text-slate-400 mt-1">Active Noise Cancellation • 40h Battery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section id="categories" className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Browse Categories</h2>
            <p className="text-slate-400 text-sm mt-1">Handcrafted ecosystems for every requirement</p>
          </div>
          <a href="#" className="text-sm font-semibold text-violet-400 hover:text-violet-300">View All Categories →</a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 overflow-hidden hover:border-slate-700 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${cat.gradient} flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg`}>
                {cat.name[0]}
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{cat.itemCount} Products</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-16 px-6 max-w-7xl mx-auto w-full border-t border-slate-900">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Trending Hardware</h2>
            <p className="text-slate-400 text-sm mt-1">Top rated flagship devices this season</p>
          </div>
          <button className="text-sm font-semibold text-violet-400 hover:text-violet-300">Explore Catalog →</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all duration-300 group"
            >
              <div>
                <div className={`h-48 ${product.imageBg} relative p-4 flex items-center justify-center`}>
                  {product.tag && (
                    <span className="absolute top-3 left-3 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                      {product.tag}
                    </span>
                  )}
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">⚡</span>
                </div>

                <div className="p-5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-white text-base mt-1 line-clamp-1 group-hover:text-violet-400 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-amber-400 text-xs">★</span>
                    <span className="text-xs font-semibold text-slate-300">{product.rating}</span>
                    <span className="text-xs text-slate-500">(128 reviews)</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-800/50 mt-2">
                <span className="text-lg font-extrabold text-white">${product.price.toFixed(2)}</span>
                <button className="px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Features Banner */}
      <section className="border-t border-slate-900 bg-slate-900/30 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl mb-2">🚚</div>
            <h4 className="font-bold text-white text-sm">Free Express Delivery</h4>
            <p className="text-xs text-slate-400 mt-0.5">On all orders over $99</p>
          </div>
          <div>
            <div className="text-2xl mb-2">🛡️</div>
            <h4 className="font-bold text-white text-sm">2-Year Warranty</h4>
            <p className="text-xs text-slate-400 mt-0.5">Full coverage guarantee</p>
          </div>
          <div>
            <div className="text-2xl mb-2">🔄</div>
            <h4 className="font-bold text-white text-sm">30-Day Easy Return</h4>
            <p className="text-xs text-slate-400 mt-0.5">Hassle-free refunds</p>
          </div>
          <div>
            <div className="text-2xl mb-2">💬</div>
            <h4 className="font-bold text-white text-sm">24/7 Expert Support</h4>
            <p className="text-xs text-slate-400 mt-0.5">Dedicated tech support</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-white text-xs">N</div>
            <span className="font-bold text-slate-300 text-sm">NOVA E-Commerce</span>
          </div>
          <p>© 2026 NOVA Inc. All rights reserved. Built with Next.js App Router & Tailwind CSS.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
