import { useCallback, useRef } from 'react';

/**
 * A hook that memoizes a callback function and only updates it when dependencies change.
 * This is useful for preventing unnecessary re-renders of child components.
 */
export function useMemoizedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  dependencies: readonly unknown[]
): T {
  const ref = useRef<T>(callback);
  
  // Update the ref if callback changes
  if (callback !== ref.current) {
    ref.current = callback;
  }
  
  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args);
  }, [...dependencies]) as T;
}

/**
 * A hook that memoizes a value and only updates it when dependencies change.
 * This is useful for expensive computations.
 */
export function useMemoizedValue<T>(
  value: T,
  _dependencies: readonly unknown[]
): T {
  const ref = useRef<T>(value);
  
  // Update the ref if value changes
  if (value !== ref.current) {
    ref.current = value;
  }
  
  return ref.current;
}