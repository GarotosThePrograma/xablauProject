import { Home } from '../pages/user/Home.jsx';
import { Outlet } from 'react-router-dom';
import { NavBar } from '../layout/NavBar.jsx'

export function UserLayout() {
    return (
        <>
            <NavBar />

            <main>
                <Outlet />
            </main>
        </>
    )
}