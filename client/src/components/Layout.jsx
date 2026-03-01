import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
    return (
        <div className="min-h-screen">
            <div className="bg-mesh" />
            <Navbar />
            <main className="page-container animate-fade-in">
                <Outlet />
            </main>
        </div>
    );
}
