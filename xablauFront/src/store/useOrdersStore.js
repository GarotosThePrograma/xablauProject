import { create } from 'zustand';

const API_URL = 'http://localhost:5002/api';

function getUsuarioId() {
  return localStorage.getItem('usuarioId');
}

function normalizeOrder(order) {
  return {
    id: order.id,
    usuarioId: order.usuarioId,
    usuarioNome: order.usuarioNome,
    usuarioEmail: order.usuarioEmail,
    date: order.data,
    paymentMethod: order.metodoPagamento,
    cep: order.cep,
    shipping: {
      label: order.freteLabel,
      value: order.freteValor,
    },
    coupon: order.cupomCodigo ? { code: order.cupomCodigo } : null,
    discount: order.desconto,
    installments: order.parcelas,
    interest: order.juros,
    subtotal: order.subtotal,
    total: order.total,
    status: order.status,
    items: (order.itens ?? []).map((item) => ({
      id: item.produtoId,
      name: item.nome,
      img: item.imagemUrl,
      price: item.precoUnitario,
      quantity: item.quantidade,
      subtotal: item.subtotal,
    })),
  };
}

async function readResponse(response) {
  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || 'Não foi possível carregar os pedidos.');
  }

  return text ? JSON.parse(text) : null;
}

async function fetchOrders(path) {
  const response = await fetch(`${API_URL}${path}`);
  const data = await readResponse(response);
  return (data ?? []).map(normalizeOrder);
}

export const useOrdersStore = create((set) => ({
  orders: [],
  isLoading: false,
  error: '',

  loadOrders: async () => {
    const usuarioId = getUsuarioId();

    if (!usuarioId) {
      set({ orders: [], isLoading: false, error: '' });
      return;
    }

    set({ isLoading: true, error: '' });

    try {
      const orders = await fetchOrders(`/pedidos/usuario/${usuarioId}`);
      set({ orders, isLoading: false });
    } catch (error) {
      set({ orders: [], isLoading: false, error: error.message });
    }
  },

  loadAdminOrders: async () => {
    set({ isLoading: true, error: '' });

    try {
      const orders = await fetchOrders('/pedidos');
      set({ orders, isLoading: false });
    } catch (error) {
      set({ orders: [], isLoading: false, error: error.message });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await fetch(`${API_URL}/pedidos/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    const data = await readResponse(response);
    const updatedOrder = normalizeOrder(data);

    set((current) => ({
      orders: current.orders.map((order) => order.id === updatedOrder.id ? updatedOrder : order),
    }));

    return updatedOrder;
  },
}));
