import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category_name?: string;
  subcategory_id?: number;
  subcategory_name?: string;
  images: string[];
  video?: string;
  stock: number;
  sizes: string[];
  attributes: Record<string, string>;
  is_new: boolean;
  is_trending: boolean;
  is_featured: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  size: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, size: string) => void;
  removeItem: (id: number, size: string) => void;
  updateQuantity: (id: number, size: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, size) => {
        const items = get().items;
        const existing = items.find(i => i.id === product.id && i.size === size);
        if (existing) {
          set({
            items: items.map(i =>
              i.id === product.id && i.size === size
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1, size }] });
        }
      },
      removeItem: (id, size) => {
        set({ items: get().items.filter(i => !(i.id === id && i.size === size)) });
      },
      updateQuantity: (id, size, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map(i =>
            i.id === id && i.size === size ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);

interface AuthState {
  user: any | null;
  token: string | null;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage' }
  )
);
