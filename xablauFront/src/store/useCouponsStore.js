import { create } from 'zustand';

const STORAGE_KEY = 'adminCoupons';

function loadCoupons() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveCoupons(coupons) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
}

export function normalizeCouponCode(value) {
  return value.replace(/\s/g, '').toUpperCase();
}

export function isCouponExpired(coupon) {
  if (!coupon.expiresAt) {
    return false;
  }

  return Date.now() > new Date(coupon.expiresAt).getTime();
}

export function formatCouponEndDate(date) {
  const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${formattedDate} às ${formattedTime}`;
}

export function getCouponEndText(durationMinutes, expiresAt) {
  const minutes = Number(durationMinutes);

  if (!minutes || !expiresAt) {
    return 'Sem data de término';
  }

  const endDate = new Date(expiresAt);

  if (minutes > 1440) {
    return `Acaba em ${formatCouponEndDate(endDate)}`;
  }

  return `Expira às ${endDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export function getCouponDurationPreview(durationMinutes) {
  const minutes = Number(durationMinutes);

  if (!minutes || minutes <= 1440) {
    return '';
  }

  return `Acabará em ${formatCouponEndDate(new Date(Date.now() + minutes * 60 * 1000))}`;
}

export const useCouponsStore = create((set, get) => ({
  coupons: loadCoupons(),

  addCoupon: (coupon) => {
    const code = normalizeCouponCode(coupon.code);

    if (!code) {
      throw new Error('Código obrigatório');
    }

    const currentCoupons = get().coupons;
    const alreadyExists = currentCoupons.some((item) => item.code === code);

    if (alreadyExists) {
      throw new Error('Cupom já cadastrado');
    }

    if (Number(coupon.durationMinutes) <= 0) {
      throw new Error('A duração precisa ser maior que zero');
    }

    if (Number(coupon.discountPercent) <= 0 || Number(coupon.discountPercent) > 100) {
      throw new Error('O desconto precisa estar entre 1% e 100%');
    }

    const nextCoupons = [
      ...currentCoupons,
      {
        id: crypto.randomUUID(),
        code,
        durationMinutes: Number(coupon.durationMinutes),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + Number(coupon.durationMinutes) * 60 * 1000).toISOString(),
        discountPercent: Number(coupon.discountPercent),
      },
    ];

    saveCoupons(nextCoupons);
    set({ coupons: nextCoupons });
  },

  removeCoupon: (couponId) => {
    const nextCoupons = get().coupons.filter((coupon) => coupon.id !== couponId);

    saveCoupons(nextCoupons);
    set({ coupons: nextCoupons });
  },
}));
