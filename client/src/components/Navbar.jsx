import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: '📊' },
        { to: '/emergency', label: 'Emergency', icon: '🛡️' },
        { to: '/partners', label: 'Partners', icon: '🤝' },
        { to: '/analytics', label: 'Analytics', icon: '📈' },
    ];

    return (
        <nav className="app-nav glass">
            <div className="app-nav-inner">
                {/* Logo */}
                <NavLink to="/dashboard" className="brand">
                    <div className="logo">R</div>
                    <span className="gradient-text-accent">Reclaim</span>
                </NavLink>

                {/* Desktop Nav Links */}
                <div className="nav-links">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                {/* User Menu */}
                <div className="nav-user">
                    <span className="username">{user.displayName}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <div className="mobile-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
