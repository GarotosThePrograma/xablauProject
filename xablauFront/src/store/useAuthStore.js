import { create } from 'zustand';

function getStoredUser() {
  const usuarioId = localStorage.getItem('usuarioId');

  return {
    usuarioId,
    nome: localStorage.getItem('nome') || '',
    email: localStorage.getItem('email') || '',
    isLoggedIn: Boolean(usuarioId),
  };
}

export const useAuthStore = create((set) => ({
  ...getStoredUser(),

  login: (user) => {
    localStorage.setItem('usuarioId', user.usuarioId);
    localStorage.setItem('nome', user.nome);

    if (user.email) {
      localStorage.setItem('email', user.email);
    }

    set({
      usuarioId: user.usuarioId,
      nome: user.nome,
      email: user.email || '',
      isLoggedIn: true,
    });
  },

  logout: () => {
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('nome');
    localStorage.removeItem('email');
    localStorage.removeItem('favoriteProductIds');

    set({
      usuarioId: null,
      nome: '',
      email: '',
      isLoggedIn: false,
    });
  },
}));
