'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from '../auth/AuthProvider';

interface OrdersCountContextValue {
  ordersCount: number;
  refreshOrdersCount: () => Promise<void>;
  setOrdersCount: React.Dispatch<React.SetStateAction<number>>;
}

const OrdersCountContext = createContext<OrdersCountContextValue>({
  ordersCount: 0,
  refreshOrdersCount: async () => {},
  setOrdersCount: () => {},
});

function readLocalDraftCartCount(): number {
  try {
    const localCart = window.localStorage.getItem('webzy_draft_cart');
    if (localCart) {
      const parsed: unknown = JSON.parse(localCart);
      if (Array.isArray(parsed)) {
        return parsed.length;
      }
    }
  } catch {
    // Ignore storage errors in strict privacy browsers
  }
  return 0;
}

export function OrdersCountProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const mountedRef = useRef<boolean>(true);

  const refreshOrdersCount = useCallback(async () => {
    // Guests do not have saved paid orders; skip remote network call for instant storefront load
    if (!isAuthenticated) {
      if (mountedRef.current) {
        setOrdersCount(readLocalDraftCartCount());
      }
      return;
    }

    try {
      const res = await fetch('/api/orders/count', {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (!mountedRef.current) return;

      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as { count?: number };
        if (typeof data.count === 'number' && Number.isFinite(data.count)) {
          setOrdersCount(Math.max(0, Math.floor(data.count)));
          return;
        }
      }

      if (res.status === 401 || res.status === 403) {
        setOrdersCount(readLocalDraftCartCount());
        return;
      }
    } catch {
      // Fallback gracefully on network error
    }

    if (!mountedRef.current) return;
    const localCount = readLocalDraftCartCount();
    if (localCount > 0) {
      setOrdersCount(localCount);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    mountedRef.current = true;
    if (!authLoading) {
      void refreshOrdersCount();
    }

    const handleUpdate = () => {
      void refreshOrdersCount();
    };
    window.addEventListener('webzy_orders_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      mountedRef.current = false;
      window.removeEventListener('webzy_orders_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [authLoading, refreshOrdersCount]);

  const value = useMemo<OrdersCountContextValue>(
    () => ({ ordersCount, refreshOrdersCount, setOrdersCount }),
    [ordersCount, refreshOrdersCount],
  );

  return <OrdersCountContext.Provider value={value}>{children}</OrdersCountContext.Provider>;
}

export function useOrdersCount(): OrdersCountContextValue {
  return useContext(OrdersCountContext);
}
