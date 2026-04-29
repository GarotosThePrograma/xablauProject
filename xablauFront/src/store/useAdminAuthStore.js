import { create } from 'zustand';

const STORAGE_KEY = 'adminLoggedIn';
const ADMIN_EMAIL = 'adm@gmail.com';
const ADMIN_PASSWORD = '123456';

export const useAdminAuthStore = create((set) => ({
  isAdminLoggedIn: localStorage.getItem(STORAGE_KEY) === 'true',

  loginAdmin: (email, password) => {
    const isValid = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;

    if (!isValid) {
      return false;
    }

    localStorage.setItem(STORAGE_KEY, 'true');
    set({ isAdminLoggedIn: true });
    return true;
  },

  logoutAdmin: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ isAdminLoggedIn: false });
  },
}));
