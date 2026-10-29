// ==============================================================================
// FILE: hooks/useDebounce.ts
// ARCHITECTURE ROLE: Generic React Custom Hook for Input Delay & Network Throttling
//
// 🎓 BEGINNER'S GUIDE TO CLOSURES, THE EVENT LOOP & DEBOUNCING:
//   What problem does Debouncing solve?
//     Imagine an e-commerce search bar or an AI chat input.
//     If a user types "wireless headphones" (19 characters) in 1 second:
//       • WITHOUT Debounce: 19 separate network requests are fired to your backend server!
//         This wastes server CPU, exhausts database connections, and can cause "race conditions"
//         where earlier requests finish AFTER later requests, rendering wrong results!
//       • WITH Debounce: The hook waits until the user STOPS typing for e.g. 300ms,
//         and then fires only ONE clean, final request!
//
//   Core JavaScript & React Concepts Taught Here:
//     1. TypeScript Generic `<T>`:
//        Allows this hook to accept ANY data type (string, number, object) and guarantee
//        that the returned debounced value is the exact same type, with 0 `any` types!
//     2. Closures & `setTimeout`:
//        The timer callback remembers the `value` captured at the time it was scheduled.
//     3. `useEffect` Cleanup Function:
//        When the user presses another key before 300ms has elapsed, React runs the
//        cleanup function `clearTimeout(timerId)`, cancelling the previous timer!
// ==============================================================================

import { useState, useEffect } from "react";

/**
 * useDebounce Custom Hook
 *
 * @param value The value to be debounced (e.g. search string, filter object)
 * @param delay Milliseconds to wait after the last change before updating (default: 300ms)
 * @returns The debounced value of type T
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  // 1. Local state holds the debounced value.
  // Notice the generic <T> — if you pass a string, state is string.
  // If you pass a number, state is number.
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 2. Set a timer to update debouncedValue after the specified delay
    const timerId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 3. CLEANUP FUNCTION (Crucial React concept):
    // If `value` or `delay` changes BEFORE the 300ms timer finishes
    // (i.e. the user typed another letter), React automatically calls this cleanup!
    // It clears the pending timer so it never executes.
    return () => {
      clearTimeout(timerId);
    };
  }, [value, delay]); // Only re-run the effect if `value` or `delay` changes

  return debouncedValue;
}
