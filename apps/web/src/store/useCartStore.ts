import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useMascotStore from './useMascotStore';

export interface CartItem {
  id: string; // product._id + variants hash
  productId: string;
  title: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  userImage?: string;
  customScaleX?: number;
  customScaleY?: number;
  customX?: number;
  customY?: number;
  instructions?: string;
  deliveryCharges?: number;
  freeShippingThreshold?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemData: (id: string, data: Partial<CartItem>) => void;
  clearCart: () => void;
  cartTotal: () => number;
  itemCount: () => number;
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(item => item.id === newItem.id);
          if (existingItem) {
            return {
              items: state.items.map(item => 
                item.id === newItem.id 
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              )
            };
          }
          return { items: [...state.items, newItem] };
        });

        // Trigger Piksy excited mood (3.png Thumbs up or 2.png Cheering)
        useMascotStore.getState().triggerMood(
          3,
          `Awesome pick! 🛍️ "${newItem.title}" was added to your cart!`,
          7000,
          'add_to_cart'
        );
      },
      
      removeItem: (id) => {
        const itemToRemove = get().items.find(i => i.id === id);
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }));

        // Trigger Piksy sad crying mood (9.png)
        useMascotStore.getState().triggerMood(
          9,
          `Oh no! ${itemToRemove ? `"${itemToRemove.title}"` : 'Item'} was removed from your cart... 😢`,
          6000,
          'remove_from_cart'
        );
      },
      
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map(item => 
            item.id === id ? { ...item, quantity } : item
          )
        }));
      },
      
      updateItemData: (id, data) => {
        set((state) => ({
          items: state.items.map(item => 
            item.id === id ? { ...item, ...data } : item
          )
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
        useMascotStore.getState().triggerMood(
          14,
          "Cart cleared! Let's explore more handcrafted collections together! 🖼️",
          6000,
          'clear_cart'
        );
      },
      
      cartTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      itemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'piks-cart-storage',
    }
  )
);

export default useCartStore;
