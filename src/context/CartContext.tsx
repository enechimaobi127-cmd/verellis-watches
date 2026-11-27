import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { WATCH_EDITIONS, type WatchEditionId } from '../watch/catalog';

export interface CartItem {
  editionId: WatchEditionId;
  quantity: number;
  note?: string;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (editionId: WatchEditionId, quantity?: number, note?: string) => void;
  updateQuantity: (editionId: WatchEditionId, delta: number) => void;
  removeItem: (editionId: WatchEditionId) => void;
  clearCart: () => void;
}

const STORAGE_KEY = 'verellis_bag_v1';

const CartContext = createContext<CartContextValue | null>(null);

function readInitialCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is CartItem =>
        entry &&
        typeof entry === 'object' &&
        (entry.editionId === 'argent' ||
          entry.editionId === 'aurum' ||
          entry.editionId === 'noir') &&
        typeof entry.quantity === 'number' &&
        entry.quantity >= 1 &&
        entry.quantity <= 20,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readInitialCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((editionId: WatchEditionId, quantity = 1, note?: string) => {
    const safeQty = Math.max(1, Math.min(10, Math.round(quantity)));
    setItems((prev) => {
      const existing = prev.find((i) => i.editionId === editionId);
      if (existing) {
        return prev.map((i) =>
          i.editionId === editionId
            ? {
                ...i,
                quantity: Math.min(10, i.quantity + safeQty),
                note: note?.trim() ? note.trim() : i.note,
              }
            : i,
        );
      }
      return [...prev, { editionId, quantity: safeQty, note: note?.trim() || undefined }];
    });
    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback((editionId: WatchEditionId, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.editionId === editionId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((editionId: WatchEditionId) => {
    setItems((prev) => prev.filter((item) => item.editionId !== editionId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const spec = WATCH_EDITIONS.find((e) => e.id === item.editionId);
        return sum + (spec?.numericPrice ?? 0) * item.quantity;
      }, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, itemCount, subtotal, isOpen, openCart, closeCart, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
