import { create } from 'zustand';

export const DEFAULT_PRODUCT_SECTIONS = [
  { id: 'monitors', label: 'Monitores' },
  { id: 'hardware', label: 'Hardware' },
  { id: 'peripherals', label: 'Periféricos' },
  { id: 'consoles', label: 'Consoles' },
  { id: 'others', label: 'Outros' },
];

const PRODUCT_SECTION_ASSIGNMENTS_KEY = 'productSections';
const PRODUCT_SECTION_DEFINITIONS_KEY = 'productSectionDefinitions';

function loadProductSections() {
  const saved = localStorage.getItem(PRODUCT_SECTION_ASSIGNMENTS_KEY);

  if (!saved) {
    return {};
  }

  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

function saveProductSections(sectionsByProductId) {
  localStorage.setItem(PRODUCT_SECTION_ASSIGNMENTS_KEY, JSON.stringify(sectionsByProductId));
}

function loadSectionDefinitions() {
  const saved = localStorage.getItem(PRODUCT_SECTION_DEFINITIONS_KEY);

  if (!saved) {
    return DEFAULT_PRODUCT_SECTIONS;
  }

  try {
    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_PRODUCT_SECTIONS;
    }

    return parsed.filter((section) => section?.id && section?.label);
  } catch {
    return DEFAULT_PRODUCT_SECTIONS;
  }
}

function saveSectionDefinitions(sections) {
  localStorage.setItem(PRODUCT_SECTION_DEFINITIONS_KEY, JSON.stringify(sections));
}

function normalizeSectionId(value) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getDefaultProductSection(product, sections = DEFAULT_PRODUCT_SECTIONS) {
  const name = product.name.toLowerCase();
  const availableIds = new Set(sections.map((section) => section.id));

  if (name.includes('monitor') && availableIds.has('monitors')) {
    return 'monitors';
  }

  if ((name.includes('teclado') || name.includes('mouse') || name.includes('headset') || name.includes('fone') || name.includes('controle')) && availableIds.has('peripherals')) {
    return 'peripherals';
  }

  if ((name.includes('console') || name.includes('xbox') || name.includes('playstation') || name.includes('ps4') || name.includes('nintendo')) && availableIds.has('consoles')) {
    return 'consoles';
  }

  if ((name.includes('placa') || name.includes('vídeo') || name.includes('video') || name.includes('processador') || name.includes('memória') || name.includes('memoria') || name.includes('ssd')) && availableIds.has('hardware')) {
    return 'hardware';
  }

  if (availableIds.has('others')) {
    return 'others';
  }

  return sections[0]?.id || 'others';
}

export const useProductSectionsStore = create((set, get) => ({
  sections: loadSectionDefinitions(),
  sectionsByProductId: loadProductSections(),

  getSections: () => get().sections,

  getProductSection: (product) => {
    const sections = get().sections;
    const validSectionIds = new Set(sections.map((section) => section.id));
    const savedSection = get().sectionsByProductId[product.id];

    if (validSectionIds.has(savedSection)) {
      return savedSection;
    }

    return getDefaultProductSection(product, sections);
  },

  setProductSection: (productId, sectionId) => {
    const nextSections = {
      ...get().sectionsByProductId,
      [productId]: sectionId,
    };

    saveProductSections(nextSections);
    set({ sectionsByProductId: nextSections });
  },

  removeProductSection: (productId) => {
    const nextSections = { ...get().sectionsByProductId };
    delete nextSections[productId];

    saveProductSections(nextSections);
    set({ sectionsByProductId: nextSections });
  },

  addSectionDefinition: (label) => {
    const normalizedLabel = label.trim();

    if (!normalizedLabel) {
      throw new Error('Informe o nome da seção.');
    }

    const nextId = normalizeSectionId(normalizedLabel);

    if (!nextId) {
      throw new Error('Não foi possível gerar um identificador para essa seção.');
    }

    const currentSections = get().sections;
    const alreadyExists = currentSections.some((section) => section.id === nextId || section.label.toLowerCase() == normalizedLabel.toLowerCase());

    if (alreadyExists) {
      throw new Error('Essa seção já existe.');
    }

    const nextSections = [...currentSections, { id: nextId, label: normalizedLabel }];
    saveSectionDefinitions(nextSections);
    set({ sections: nextSections });
    return { id: nextId, label: normalizedLabel };
  },

  moveSection: (sectionId, direction) => {
    const currentSections = [...get().sections];
    const currentIndex = currentSections.findIndex((section) => section.id === sectionId);

    if (currentIndex === -1) {
      return false;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= currentSections.length) {
      return false;
    }

    const [sectionToMove] = currentSections.splice(currentIndex, 1);
    currentSections.splice(targetIndex, 0, sectionToMove);

    saveSectionDefinitions(currentSections);
    set({ sections: currentSections });
    return true;
  },
}));
