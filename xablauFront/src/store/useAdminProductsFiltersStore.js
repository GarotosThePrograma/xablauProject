import { create } from 'zustand';

const STORAGE_KEY = 'adminProductsFilters';

const DEFAULT_FILTERS = {
  search: '',
  stock: 'all',
  section: 'all',
};

function loadFilters() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return DEFAULT_FILTERS;
  }

  try {
    return {
      ...DEFAULT_FILTERS,
      ...JSON.parse(saved),
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

function saveFilters(filters) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
}

export const useAdminProductsFiltersStore = create((set, get) => ({
  ...loadFilters(),

  setSearch: (search) => {
    const nextState = { ...get(), search };
    saveFilters({ search: nextState.search, stock: nextState.stock, section: nextState.section });
    set({ search });
  },

  setStock: (stock) => {
    const nextState = { ...get(), stock };
    saveFilters({ search: nextState.search, stock: nextState.stock, section: nextState.section });
    set({ stock });
  },

  setSection: (section) => {
    const nextState = { ...get(), section };
    saveFilters({ search: nextState.search, stock: nextState.stock, section: nextState.section });
    set({ section });
  },

  clearFilters: () => {
    localStorage.removeItem(STORAGE_KEY);
    set(DEFAULT_FILTERS);
  },
}));
