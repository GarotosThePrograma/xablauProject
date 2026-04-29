import { create } from 'zustand';

const STORAGE_KEY = 'favoriteProductIds';

function loadFavorites() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveFavorites(productIds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
}

export const useFavoritesStore = create((set, get) => ({
  productIds: loadFavorites(),

  isFavorite: (productId) => get().productIds.includes(Number(productId)),

  toggleFavorite: (productId) => {
    const normalizedId = Number(productId);
    const currentIds = get().productIds;
    const nextIds = currentIds.includes(normalizedId)
      ? currentIds.filter((id) => id !== normalizedId)
      : [...currentIds, normalizedId];

    saveFavorites(nextIds);
    set({ productIds: nextIds });
  },

  clearFavorites: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ productIds: [] });
  },
}));
