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
        <nav className="glass sticky top-0 z-50 px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <NavLink to="/dashboard" className="flex items-center gap-3 no-underline">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-emerald-500 flex items-center justify-center text-lg font-bold">
                        R
                    </div>
                    <span className="text-xl font-bold gradient-text-accent font-[var(--font-display)]" style={{ fontFamily: 'var(--font-display)' }}>
                        Reclaim
                    </span>
                </NavLink>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium no-underline transition-all duration-200 ${isActive
                                    ? 'bg-accent-primary/15 text-accent-secondary'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                }`
                            }
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-4">
                    <span className="text-sm text-text-secondary hidden sm:block">
                        {user.displayName}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-text-muted hover:text-rose-400 transition-colors cursor-pointer bg-transparent border-none"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <div className="flex md:hidden items-center gap-1 mt-3 overflow-x-auto pb-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium no-underline whitespace-nowrap transition-all ${isActive
                                ? 'bg-accent-primary/15 text-accent-secondary'
                                : 'text-text-secondary hover:text-text-primary'
                            }`
                        }
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
