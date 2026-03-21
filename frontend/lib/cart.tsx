'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;      // Unique identifier (e.g., productID_variantID)
  productId: number;
  variantId: number;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('hd_foods_cart');
    if (savedCart) {
      try {
         setItems(JSON.parse(savedCart));
      } catch (e) {
         console.error('Failed to parse cart data');
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isInitialized) {
       localStorage.setItem('hd_foods_cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = (newItem: CartItem) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex((item) => item.id === newItem.id);
      
      if (existingItemIndex > -1) {
        // Update quantity if already exists
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      }
      
      // Add new item
      return [...currentItems, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((current) => current.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setItems((current) =>
      current.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
