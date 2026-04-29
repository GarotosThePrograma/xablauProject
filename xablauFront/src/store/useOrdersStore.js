import { create } from 'zustand';

function getStorageKey() {
  const usuarioId = localStorage.getItem('usuarioId');
  return `orders_${usuarioId || 'guest'}`;
}

function loadStoredOrders() {
  const saved = localStorage.getItem(getStorageKey());

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(getStorageKey(), JSON.stringify(orders));
}

export const useOrdersStore = create((set) => ({
  orders: loadStoredOrders(),

  loadOrders: () => {
    set({ orders: loadStoredOrders() });
  },

  addOrder: (order) => {
    const nextOrders = [order, ...loadStoredOrders()];
    saveOrders(nextOrders);
    set({ orders: nextOrders });
  },
}));
