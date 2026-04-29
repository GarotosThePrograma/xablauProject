import { create } from 'zustand';

const API_URL = 'http://localhost:5002/api';

function getUsuarioId() {
  return localStorage.getItem('usuarioId');
}

function normalizeCart(carrinho) {
  if (!carrinho || !carrinho.itens) {
    return [];
  }

  return carrinho.itens.map((item) => ({
    id: item.produtoId,
    name: item.nome,
    img: item.imagemUrl,
    price: item.preco,
    quantity: item.quantidade,
    subtotal: item.subtotal,
  }));
}

export const useCartStore = create((set, get) => ({
  cart: [],

  loadCart: async () => {
    const usuarioId = getUsuarioId();

    if (!usuarioId) {
      set({ cart: [] });
      return;
    }

    const response = await fetch(`${API_URL}/carrinho/${usuarioId}`);
    const data = await response.json();

    if (!response.ok) {
      set({ cart: [] });
      return;
    }

    set({ cart: normalizeCart(data) });
  },

  addToCart: async (product) => {
    const usuarioId = getUsuarioId();

    if (!usuarioId) {
      throw new Error('Usuário não está logado');
    }

    const response = await fetch(`${API_URL}/carrinho/${usuarioId}/itens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        produtoId: product.id,
        quantidade: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Erro ao adicionar item no carrinho');
    }

    set({ cart: normalizeCart(data) });
  },

  decreaseQuantity: async (productId) => {
    const usuarioId = getUsuarioId();
    const item = get().cart.find((cartItem) => cartItem.id === productId);

    if (!usuarioId || !item) {
      return;
    }

    if (item.quantity === 1) {
      const response = await fetch(`${API_URL}/carrinho/${usuarioId}/itens/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Erro ao remover item do carrinho');
      }

      set({ cart: normalizeCart(data) });
      return;
    }

    const response = await fetch(`${API_URL}/carrinho/${usuarioId}/itens/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quantidade: item.quantity - 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Erro ao atualizar quantidade');
    }

    set({ cart: normalizeCart(data) });
  },

  removeFromCart: async (productId) => {
    const usuarioId = getUsuarioId();

    if (!usuarioId) {
      return;
    }

    const response = await fetch(`${API_URL}/carrinho/${usuarioId}/itens/${productId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Erro ao remover item do carrinho');
    }

    set({ cart: normalizeCart(data) });
  },

  clearCart: async () => {
    const usuarioId = getUsuarioId();

    if (!usuarioId) {
      return;
    }

    const response = await fetch(`${API_URL}/carrinho/${usuarioId}/itens`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Erro ao limpar carrinho');
    }

    set({ cart: normalizeCart(data) });
  },
}));
