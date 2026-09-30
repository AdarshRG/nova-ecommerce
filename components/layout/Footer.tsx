import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-white text-xs">
            N
          </div>
          <span className="font-bold text-slate-300 text-sm">
            NOVA E-Commerce
          </span>
        </div>
        <p>
          © 2026 NOVA Inc. All rights reserved. Built with Next.js App Router,
          TypeScript & Tailwind CSS.
        </p>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-slate-400">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-slate-400">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-slate-400">
            System Status
          </Link>
        </div>
      </div>
    </footer>
  );
}
