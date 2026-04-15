import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch {
      return [];
    }
  });

  const persist = (nextItems) => {
    setItems(nextItems);
    localStorage.setItem('cart', JSON.stringify(nextItems));
  };

  const addItem = (product) => {
    const existing = items.find((item) => item.id === product.id);
    if (existing) {
      persist(
        items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        )
      );
      return;
    }

    persist([
      ...items,
      {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        stock: product.stock,
        quantity: 1,
      },
    ]);
  };

  const updateQuantity = (id, quantity) => {
    const nextQuantity = Math.max(1, quantity);
    persist(
      items.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(nextQuantity, item.stock) } : item
      )
    );
  };

  const removeItem = (id) => {
    persist(items.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    persist([]);
  };

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
