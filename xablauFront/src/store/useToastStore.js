import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  showToast: ({ title, message, duration = 3200 }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id,
          title,
          message,
          duration,
        },
      ],
    }));

    return id;
  },
  removeToast: (toastId) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== toastId),
    }));
  },
}));
