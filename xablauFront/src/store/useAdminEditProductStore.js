import { create } from 'zustand';
import { deleteProduct, getProductById, updateProduct } from '../services/productsApi';
import { useProductSectionsStore } from './useProductSectionsStore';
import { useToastStore } from './useToastStore';

const emptyForm = {
  id: null,
  name: '',
  price: '',
  stock: '',
  img: '',
  section: 'hardware',
};

export const useAdminEditProductStore = create((set, get) => ({
  form: emptyForm,
  isLoading: true,
  isSubmitting: false,
  message: '',

  setField: (field, value) => {
    set((state) => ({
      form: { ...state.form, [field]: value },
    }));
  },

  reset: () => {
    set({ form: emptyForm, isLoading: true, isSubmitting: false, message: '' });
  },

  loadProduct: async (productId) => {
    set({ isLoading: true, message: '' });

    try {
      const product = await getProductById(productId);
      const section = useProductSectionsStore.getState().getProductSection(product);
      set({
        form: {
          id: product.id,
          name: product.name,
          price: String(product.price),
          stock: String(product.stock),
          img: product.img,
          section,
        },
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, message: 'Não foi possível carregar o produto.' });
    }
  },

  updateCurrentProduct: async () => {
    const { form } = get();
    const name = form.name.trim();
    const img = form.img.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!name) {
      set({ message: 'Informe o nome do produto.' });
      return null;
    }

    if (!img) {
      set({ message: 'Informe a URL da imagem.' });
      return null;
    }

    if (Number.isNaN(price) || price < 0) {
      set({ message: 'Informe um preço válido.' });
      return null;
    }

    if (Number.isNaN(stock) || stock < 0) {
      set({ message: 'Informe um estoque válido.' });
      return null;
    }

    set({ isSubmitting: true, message: '' });

    try {
      const updatedProduct = await updateProduct(form.id, {
        name,
        img,
        price,
        stock,
      });
      useProductSectionsStore.getState().setProductSection(form.id, form.section);
      useToastStore.getState().showToast({
        title: 'Produto atualizado',
        message: updatedProduct.name,
      });
      set({
        form: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          price: String(updatedProduct.price),
          stock: String(updatedProduct.stock),
          img: updatedProduct.img,
          section: form.section,
        },
        isSubmitting: false,
        message: 'Produto atualizado.',
      });
      return updatedProduct;
    } catch (error) {
      set({
        isSubmitting: false,
        message: error.message || 'Não foi possível atualizar o produto.',
      });
      return null;
    }
  },

  deleteCurrentProduct: async () => {
    const { form } = get();

    if (!form.id) {
      set({ message: 'Produto não encontrado.' });
      return false;
    }

    set({ isSubmitting: true, message: '' });

    try {
      await deleteProduct(form.id);
      useProductSectionsStore.getState().removeProductSection(form.id);
      useToastStore.getState().showToast({
        title: 'Produto removido',
        message: form.name,
      });
      set({ form: emptyForm, isSubmitting: false, message: 'Produto removido.' });
      return true;
    } catch (error) {
      set({
        isSubmitting: false,
        message: error.message || 'Não foi possível remover o produto.',
      });
      return false;
    }
  },
}));
