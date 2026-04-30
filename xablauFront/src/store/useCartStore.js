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
    stock: item.estoque,
    quantity: item.quantidade,
    subtotal: item.subtotal,
  }));
}

export const useCartStore = create((set, get) => ({
  cart: [],
  isLoading: false,

  loadCart: async () => {
    const usuarioId = getUsuarioId();

    if (!usuarioId) {
      set({ cart: [], isLoading: false });
      return;
    }

    set({ isLoading: true });

    try {
      const response = await fetch(`${API_URL}/carrinho/${usuarioId}`);
      const data = await response.json();

      if (!response.ok) {
        set({ cart: [], isLoading: false });
        return;
      }

      set({ cart: normalizeCart(data), isLoading: false });
    } catch {
      set({ cart: [], isLoading: false });
    }
  },

  addToCart: async (product) => {
    const usuarioId = getUsuarioId();

    if (!usuarioId) {
      throw new Error('Usuário não está logado');
    }

    const item = get().cart.find((cartItem) => cartItem.id === product.id);

    if (item && product.stock !== undefined && item.quantity >= product.stock) {
      throw new Error('Quantidade máxima em estoque atingida');
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
      throw new Error('Quantidade indisponível em estoque');
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

  finishPurchase: async (checkoutData) => {
    const usuarioId = getUsuarioId();

    if (!usuarioId) {
      throw new Error('Usuário não está logado');
    }

    const response = await fetch(`${API_URL}/carrinho/${usuarioId}/finalizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metodoPagamento: checkoutData.paymentMethod,
        cep: checkoutData.cep,
        freteLabel: checkoutData.shipping.label,
        freteValor: checkoutData.shipping.value,
        cupomCodigo: checkoutData.couponCode,
        desconto: checkoutData.discount,
        parcelas: checkoutData.installments,
        juros: checkoutData.interest,
        total: checkoutData.total,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(responseText || 'Não foi possível finalizar a compra. Verifique o estoque dos itens.');
    }

    const data = responseText ? JSON.parse(responseText) : null;

    set({ cart: [] });
    return data;
  },
}));
