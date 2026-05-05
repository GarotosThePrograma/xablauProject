import { create } from 'zustand';
import { createProduct } from '../services/productsApi';
import { useProductSectionsStore } from './useProductSectionsStore';
import { useToastStore } from './useToastStore';

export const emptyProductForm = {
  name: '',
  price: '',
  stock: '',
  img: '',
  section: 'hardware',
};

export const useAdminProductFormStore = create((set, get) => ({
  form: emptyProductForm,
  isSubmitting: false,
  message: '',

  setField: (field, value) => {
    set((state) => ({
      form: { ...state.form, [field]: value },
    }));
  },

  resetForm: () => {
    set({ form: emptyProductForm, message: '' });
  },

  clearMessage: () => {
    set({ message: '' });
  },

  submitProduct: async () => {
    const { form } = get();

    set({ isSubmitting: true, message: '' });

    try {
      const createdProduct = await createProduct(form);
      useProductSectionsStore.getState().setProductSection(createdProduct.id, form.section);
      useToastStore.getState().showToast({
        title: 'Produto criado',
        message: createdProduct.name,
      });
      set({
        form: emptyProductForm,
        isSubmitting: false,
        message: 'Produto adicionado com sucesso.',
      });
      return createdProduct;
    } catch (error) {
      const message = error.message || 'Não foi possível adicionar o produto.';
      set({ isSubmitting: false, message });
      throw error;
    }
  },
}));
