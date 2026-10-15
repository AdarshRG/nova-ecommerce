// ==============================================================================
// FILE: components/product/ColorSwatchPicker.tsx
// ARCHITECTURE ROLE: Interactive Hardware Color Finish & Variant Selector
//
// 🎓 BEGINNER'S GUIDE TO THIS COMPONENT:
//   What is a "Color Swatch"?
//     A color swatch is a little colored circle that users can click on to pick their
//     favorite product finish (like Space Black, Titanium Silver, or Midnight Blue).
//   How does state work here?
//     This component is a "Controlled Component":
//       1. It receives `selectedColor` from its parent (telling it which color is currently chosen).
//       2. It receives `onSelectColor` (a callback function).
//       3. When the user clicks a button, it calls `onSelectColor("Titanium Silver")`,
//          which updates the parent component's state!
//     This is a core React pattern called "Lifting State Up".
// ==============================================================================

"use client";

import React from "react";
import { ColorVariant } from "../../types/product";

interface ColorSwatchPickerProps {
  variants?: ColorVariant[];
  selectedColor: string;
  onSelectColor: (colorName: string) => void;
}

export default function ColorSwatchPicker({
  variants,
  selectedColor,
  onSelectColor,
}: ColorSwatchPickerProps) {
  // If the product doesn't have multiple color options, don't render anything
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {/* Label displaying the active chosen color */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-400 uppercase tracking-wider">
          Finish / Color:
        </span>
        <span className="font-extrabold text-white bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-md">
          {selectedColor}
        </span>
      </div>

      {/* Row of interactive circular swatches */}
      <div className="flex items-center gap-2.5">
        {variants.map((variant) => {
          // Check if this circle matches the currently selected color
          const isSelected = variant.name === selectedColor;

          return (
            <button
              key={variant.name}
              type="button"
              onClick={() => onSelectColor(variant.name)}
              className={`group relative w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center ${
                isSelected
                  ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-slate-950 scale-110 shadow-lg shadow-violet-500/20"
                  : "hover:scale-105 opacity-80 hover:opacity-100"
              }`}
              title={variant.name}
              aria-label={`Select ${variant.name} color`}
            >
              {/* The inner colored dot */}
              <span
                className="w-full h-full rounded-full border border-slate-700/80 shadow-inner block"
                style={{ backgroundColor: variant.hex }}
              />

              {/* Small checkmark indicator if active */}
              {isSelected && (
                <span className="absolute text-[10px] text-white font-black drop-shadow">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
