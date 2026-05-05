import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar.jsx'

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
