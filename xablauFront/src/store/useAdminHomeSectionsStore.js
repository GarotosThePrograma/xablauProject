import { create } from 'zustand';
import { useProductSectionsStore } from './useProductSectionsStore';
import { useToastStore } from './useToastStore';

const emptyForm = {
  label: '',
};

export const useAdminHomeSectionsStore = create((set, get) => ({
  form: emptyForm,
  message: '',
  isSubmitting: false,

  setField: (field, value) => {
    set((state) => ({
      form: { ...state.form, [field]: value },
    }));
  },

  resetForm: () => {
    set({ form: emptyForm, message: '' });
  },

  submitSection: () => {
    const label = get().form.label.trim();

    set({ isSubmitting: true, message: '' });

    try {
      const createdSection = useProductSectionsStore.getState().addSectionDefinition(label);
      useToastStore.getState().showToast({
        title: 'Seção criada',
        message: createdSection.label,
      });
      set({
        form: emptyForm,
        message: 'Seção adicionada com sucesso.',
        isSubmitting: false,
      });
      return createdSection;
    } catch (error) {
      set({
        message: error.message || 'Não foi possível adicionar a seção.',
        isSubmitting: false,
      });
      throw error;
    }
  },
}));
