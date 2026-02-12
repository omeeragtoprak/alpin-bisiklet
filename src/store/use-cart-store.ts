import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string; // Product ID
    variantId?: string; // Variant ID if applicable
    name: string;
    price: number;
    image: string;
    quantity: number;
    slug: string;
    category: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string, variantId?: string) => void;
    updateQuantity: (id: string, quantity: number, variantId?: string) => void;
    clearCart: () => void;
    isOpen: boolean;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    getCartTotal: () => number;
    getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (item) => {
                set((state) => {
                    const existingItemIndex = state.items.findIndex(
                        (i) => i.id === item.id && i.variantId === item.variantId
                    );

                    if (existingItemIndex > -1) {
                        const newItems = [...state.items];
                        newItems[existingItemIndex].quantity += 1;
                        return { items: newItems, isOpen: true };
                    }

                    return {
                        items: [...state.items, { ...item, quantity: 1 }],
                        isOpen: true
                    };
                });
            },

            removeItem: (id, variantId) => {
                set((state) => ({
                    items: state.items.filter(
                        (i) => !(i.id === id && i.variantId === variantId)
                    ),
                }));
            },

            updateQuantity: (id, quantity, variantId) => {
                set((state) => {
                    if (quantity <= 0) {
                        return {
                            items: state.items.filter(
                                (i) => !(i.id === id && i.variantId === variantId)
                            ),
                        };
                    }

                    return {
                        items: state.items.map((i) =>
                            i.id === id && i.variantId === variantId
                                ? { ...i, quantity }
                                : i
                        ),
                    };
                });
            },

            clearCart: () => set({ items: [] }),

            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            getCartTotal: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            getCartCount: () => {
                const { items } = get();
                return items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);
