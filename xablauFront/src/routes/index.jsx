// permite o react ler varias paginas
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { UserLayout } from '../layouts/UserLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { Home } from '@/pages/user/Home'
import { Login } from '../pages/user/auth/Login.jsx'
import { Register } from '../pages/user/auth/Register.jsx'
import { Cart } from '../pages/user/Cart'
import { Orders } from '../pages/user/Orders'
import { ProductDetails } from '../pages/user/ProductDetails'
import { Favorites } from '../pages/user/Favorites'
import { AdminProducts } from '../pages/admin/AdminProducts'


export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* USER */}
                <Route element= { <UserLayout /> }>
                    <Route path='/' element= { <Home /> } />
                    <Route path='/product/:id' element= { <ProductDetails /> } />
                    <Route path='/login' element= { <Login /> } />
                    <Route path='/register' element= { <Register /> } />
                    <Route path='/cart' element= { <Cart /> } />
                    <Route path='/orders' element= { <Orders /> } />
                    <Route path='/favorites' element= { <Favorites /> } />
                </Route>

                {/* ADMIN */}
                <Route element= { <AdminLayout /> }>
                    <Route path='/admin/produtos' element= { <AdminProducts /> } />
                </Route>
            </Routes> 

        </BrowserRouter>
    )
}
