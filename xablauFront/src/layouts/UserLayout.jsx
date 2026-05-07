import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FirstPurchaseCouponModal } from '../components/common/FirstPurchaseCouponModal.jsx';
import { useFirstPurchaseCouponStore } from '../store/useFirstPurchaseCouponStore';
import { useAuthStore } from '../store/useAuthStore';
import { NavBar } from './NavBar.jsx';

export function UserLayout() {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const email = useAuthStore((state) => state.email);
    const getActiveCouponByEmail = useFirstPurchaseCouponStore((state) => state.getActiveCouponByEmail);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

    const activeCoupon = isLoggedIn && email ? getActiveCouponByEmail(email) : null;

    useEffect(() => {
        if (!activeCoupon) {
            setIsCouponModalOpen(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            setIsCouponModalOpen(true);
        }, 10000);

        return () => clearTimeout(timeoutId);
    }, [activeCoupon?.code, activeCoupon?.expiresAt, activeCoupon?.usedAt, email, isLoggedIn]);

    return (
        <>
            <NavBar />

            <main>
                <Outlet />
            </main>

            <FirstPurchaseCouponModal
                coupon={activeCoupon}
                isOpen={isCouponModalOpen}
                onClose={() => setIsCouponModalOpen(false)}
            />
        </>
    )
}
