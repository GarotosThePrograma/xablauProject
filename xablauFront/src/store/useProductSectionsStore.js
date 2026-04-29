import { create } from 'zustand';

export const PRODUCT_SECTIONS = [
  { id: 'monitors', label: 'Monitores' },
  { id: 'hardware', label: 'Hardware' },
  { id: 'peripherals', label: 'Periféricos' },
  { id: 'consoles', label: 'Consoles' },
  { id: 'others', label: 'Outros' },
];

const VALID_SECTION_IDS = PRODUCT_SECTIONS.map((section) => section.id);

const STORAGE_KEY = 'productSections';

function loadSections() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return {};
  }

  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

function saveSections(sectionsByProductId) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sectionsByProductId));
}

export function getDefaultProductSection(product) {
  const name = product.name.toLowerCase();

  if (name.includes('monitor')) {
    return 'monitors';
  }

  if (name.includes('teclado') || name.includes('mouse') || name.includes('headset') || name.includes('fone') || name.includes('controle')) {
    return 'peripherals';
  }

  if (name.includes('console') || name.includes('xbox') || name.includes('playstation') || name.includes('ps4') || name.includes('nintendo')) {
    return 'consoles';
  }

  if (name.includes('placa') || name.includes('vídeo') || name.includes('video') || name.includes('processador') || name.includes('memória') || name.includes('memoria') || name.includes('ssd')) {
    return 'hardware';
  }

  return 'others';
}

export const useProductSectionsStore = create((set, get) => ({
  sectionsByProductId: loadSections(),

  getProductSection: (product) => {
    const savedSection = get().sectionsByProductId[product.id];

    if (VALID_SECTION_IDS.includes(savedSection)) {
      return savedSection;
    }

    return getDefaultProductSection(product);
  },

  setProductSection: (productId, sectionId) => {
    const nextSections = {
      ...get().sectionsByProductId,
      [productId]: sectionId,
    };

    saveSections(nextSections);
    set({ sectionsByProductId: nextSections });
  },

  removeProductSection: (productId) => {
    const nextSections = { ...get().sectionsByProductId };
    delete nextSections[productId];

    saveSections(nextSections);
    set({ sectionsByProductId: nextSections });
  },
}));
