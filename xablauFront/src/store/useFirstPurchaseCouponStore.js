import { create } from 'zustand';

export const FIRST_PURCHASE_COUPON_CODE = 'PRIMEIRACOMPRA';
export const FIRST_PURCHASE_COUPON_DISCOUNT_PERCENT = 15;
export const FIRST_PURCHASE_COUPON_DURATION_DAYS = 7;
export const FIRST_PURCHASE_COUPON_DURATION_MINUTES = FIRST_PURCHASE_COUPON_DURATION_DAYS * 24 * 60;

const STORAGE_KEY = 'firstPurchaseCouponsByEmail';

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function loadCouponsByEmail() {
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

function saveCouponsByEmail(couponsByEmail) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(couponsByEmail));
}

export function isFirstPurchaseCouponExpired(coupon) {
  if (!coupon?.expiresAt) {
    return true;
  }

  return Date.now() > new Date(coupon.expiresAt).getTime();
}

export const useFirstPurchaseCouponStore = create((set, get) => ({
  couponsByEmail: loadCouponsByEmail(),

  ensureCouponForEmail: (email) => {
    const normalizedEmail = normalizeEmail(email || '');

    if (!normalizedEmail) {
      return null;
    }

    const existingCoupon = get().couponsByEmail[normalizedEmail];

    if (existingCoupon) {
      return existingCoupon;
    }

    const createdAt = new Date();
    const coupon = {
      code: FIRST_PURCHASE_COUPON_CODE,
      discountPercent: FIRST_PURCHASE_COUPON_DISCOUNT_PERCENT,
      durationMinutes: FIRST_PURCHASE_COUPON_DURATION_MINUTES,
      createdAt: createdAt.toISOString(),
      expiresAt: new Date(createdAt.getTime() + FIRST_PURCHASE_COUPON_DURATION_MINUTES * 60 * 1000).toISOString(),
      usedAt: null,
    };

    const nextCouponsByEmail = {
      ...get().couponsByEmail,
      [normalizedEmail]: coupon,
    };

    saveCouponsByEmail(nextCouponsByEmail);
    set({ couponsByEmail: nextCouponsByEmail });
    return coupon;
  },

  getCouponByEmail: (email) => {
    const normalizedEmail = normalizeEmail(email || '');

    if (!normalizedEmail) {
      return null;
    }

    return get().couponsByEmail[normalizedEmail] || null;
  },

  getActiveCouponByEmail: (email) => {
    const coupon = get().getCouponByEmail(email);

    if (!coupon || coupon.usedAt || isFirstPurchaseCouponExpired(coupon)) {
      return null;
    }

    return coupon;
  },

  markCouponAsUsed: (email) => {
    const normalizedEmail = normalizeEmail(email || '');

    if (!normalizedEmail) {
      return null;
    }

    const currentCoupon = get().couponsByEmail[normalizedEmail];

    if (!currentCoupon) {
      return null;
    }

    const nextCoupon = {
      ...currentCoupon,
      usedAt: new Date().toISOString(),
    };

    const nextCouponsByEmail = {
      ...get().couponsByEmail,
      [normalizedEmail]: nextCoupon,
    };

    saveCouponsByEmail(nextCouponsByEmail);
    set({ couponsByEmail: nextCouponsByEmail });
    return nextCoupon;
  },
}));
