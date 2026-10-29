// ==============================================================================
// FILE: hooks/useAsync.ts
// ARCHITECTURE ROLE: Generic React Hook for Asynchronous Operations & State Management
//
// 🎓 BEGINNER'S GUIDE TO ASYNC STATE MACHINES & TYPE NARROWING:
//   Why build a custom `useAsync` hook?
//     Almost every modern web feature involves fetching data from an API, calling an LLM,
//     or submitting a form. In junior code, developers repeatedly write:
//       const [loading, setLoading] = useState(false);
//       const [data, setData] = useState(null);
//       const [error, setError] = useState(null);
//     over and over again across dozens of files!
//
//   This reusable hook solves 3 enterprise-level problems:
//     1. State Synchronization: Coordinates `status`, `data`, and `error` in a single state object.
//     2. Memory Leak Prevention: Uses a cancellation flag so that if a user navigates away
//        before a network request finishes, it will NOT attempt to update unmounted React state.
//     3. TypeScript Type Narrowing:
//        Uses TypeScript Generics `<T>` and type narrowing (`error instanceof Error`) so
//        error messages are always clean strings, and data is strictly typed.
// ==============================================================================

import { useState, useCallback, useRef, useEffect } from "react";

// The 4 formal states of any asynchronous operation
export type AsyncStatus = "idle" | "pending" | "success" | "error";

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * useAsync Custom Hook
 *
 * @param asyncFunction The promise-returning function (e.g. () => fetch('/api/products'))
 * @param immediate If true, runs the async function automatically on mount
 */
export function useAsync<T, Args extends unknown[] = unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  immediate: boolean = false
) {
  // Master state object
  const [state, setState] = useState<AsyncState<T>>({
    status: "idle",
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  // Ref to track if the component is currently mounted to prevent memory leaks
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      // When component unmounts, set to false
      isMountedRef.current = false;
    };
  }, []);

  // ----------------------------------------------------------------------------
  // FUNCTION: execute()
  // Triggers the asynchronous operation, handling transitions between states
  // ----------------------------------------------------------------------------
  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      // 1. Transition to 'pending' loading state
      setState({
        status: "pending",
        data: null,
        error: null,
        isLoading: true,
        isSuccess: false,
        isError: false,
      });

      try {
        // 2. Await the execution of the async promise
        const responseData = await asyncFunction(...args);

        // 3. Only update state if component is still on screen
        if (isMountedRef.current) {
          setState({
            status: "success",
            data: responseData,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          });
        }
        return responseData;
      } catch (err: unknown) {
        // 4. TYPE NARROWING (Crucial TypeScript skill):
        // In JavaScript, anything can be thrown (`throw "error"`, `throw new Error()`).
        // We safely narrow `err` to extract a clean, human-readable string.
        let errorMessage = "An unexpected error occurred.";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === "string") {
          errorMessage = err;
        }

        if (isMountedRef.current) {
          setState({
            status: "error",
            data: null,
            error: errorMessage,
            isLoading: false,
            isSuccess: false,
            isError: true,
          });
        }
        return null;
      }
    },
    [asyncFunction]
  );

  // If immediate execution was requested, invoke on mount
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args));
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
  };
}
