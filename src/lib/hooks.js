'use client';
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for fetching data from Supabase via API routes.
 * Handles loading, error, and refetch states.
 */
export function useSupabase(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (isRefetch = false) => {
    try {
      if (!isRefetch) setLoading(true);
      setError(null);
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
      console.error(`[useSupabase] ${url}:`, err);
    } finally {
      if (!isRefetch) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { data, loading, error, refetch };
}

/**
 * Format currency in Indian notation (Cr / L)
 */
export function formatCurrency(amount) {
  const num = Number(amount);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(1)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)} L`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

export function formatLargeCurrency(amount) {
  const num = Number(amount);
  if (num >= 10000000000000) {
    return `₹${(num / 10000000000000).toFixed(0)} L Cr`;
  } else if (num >= 10000000000) {
    return `₹${(num / 10000000).toLocaleString('en-IN')} Cr`;
  } else if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(0)} Cr`;
  }
  return formatCurrency(num);
}

/**
 * Format a timestamp into a readable date/time
 */
export function formatTimestamp(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function timeAgo(ts) {
  if (!ts) return '';
  const now = new Date();
  const then = new Date(ts);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}
