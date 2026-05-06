// permite o react ler varias paginas
import { BrowserRouter, Navigate, Outlet, Routes, Route } from 'react-router-dom'

import { UserLayout } from '../layouts/UserLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { Home } from '@/pages/user/Home'
import { Login } from '../pages/user/auth/Login.jsx'
import { Register } from '../pages/user/auth/Register.jsx'
import { Cart } from '../pages/user/Cart'
import { Orders } from '../pages/user/Orders'
import { ProductDetails } from '../pages/user/ProductDetails'
import { Favorites } from '../pages/user/Favorites'
import { Search } from '../pages/user/Search'
import { AdminProducts } from '../pages/admin/AdminProducts'
import { AdminAddProduct } from '../pages/admin/AdminAddProduct'
import { AdminEditProduct } from '../pages/admin/AdminEditProduct'
import { AdminOrders } from '../pages/admin/AdminOrders'
import { AdminHomeSections } from '../pages/admin/AdminHomeSections'
import { AdminCoupons } from '../pages/admin/AdminCoupons'
import { useAdminAuthStore } from '../store/useAdminAuthStore'
import { AdminAddHomeSection } from '../pages/admin/AdminAddHomeSection.jsx'

function AdminProtectedRoute() {
    const isAdminLoggedIn = useAdminAuthStore((state) => state.isAdminLoggedIn)

    if (!isAdminLoggedIn) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element= { <UserLayout /> }>
                    <Route path='/' element= { <Home /> } />
                    <Route path='/product/:id' element= { <ProductDetails /> } />
                    <Route path='/login' element= { <Login /> } />
                    <Route path='/register' element= { <Register /> } />
                    <Route path='/cart' element= { <Cart /> } />
                    <Route path='/orders' element= { <Orders /> } />
                    <Route path='/favorites' element= { <Favorites /> } />
                    <Route path='/search' element= { <Search /> } />
                </Route>

                <Route element= { <AdminProtectedRoute /> }>
                    <Route element= { <AdminLayout /> }>
                        <Route path='/admin/produtos' element= { <AdminProducts /> } />
                        <Route path='/admin/produtos/novo' element= { <AdminAddProduct /> } />
                        <Route path='/admin/produtos/editar/:id' element= { <AdminEditProduct /> } />
                        <Route path='/admin/pedidos' element= { <AdminOrders /> } />
                        <Route path='/admin/secoes' element= { <AdminHomeSections /> } />
                        <Route path='/admin/secoes/nova' element= { <AdminAddHomeSection /> } />
                        <Route path='/admin/cupons' element= { <AdminCoupons /> } />
                    </Route>
                </Route>
            </Routes> 
        </BrowserRouter>
    )
}
