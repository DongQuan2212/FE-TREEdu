import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../../asset/logo1.png';
import { useAuth } from '../../hook/useAuth';
import {
    User,
    Clock,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    X,
    LogIn,
    UserPlus
} from 'lucide-react';

// ... (Giữ nguyên phần CONSTANTS & CONFIG, RoleBadge, NavItem, DropdownMenuItem, UserAvatar, UserDropdown) ...
// Để ngắn gọn, tôi sẽ không paste lại các component con không thay đổi bên trên.
// Hãy giữ nguyên code từ đầu file cho đến hết component UserDropdown.

const NAV_ITEMS = [
    { id: 'quiz', label: 'Bài quiz', path: '/quiz' },
    { id: 'flashcard', label: 'Flashcard', path: '/flashcard' },
    { id: 'pronunciation', label: 'Luyện phát âm', path: '/pronunciation-practice' },
    { id: 'intro', label: 'Giới thiệu', path: '/intro' },
];

const ROLE_CONFIG = {
    ROLE_ADMIN: {
        label: 'Admin',
        icon: '👑',
        className: 'bg-red-50 text-red-700 border border-red-200',
        panelPath: '/admin/dashboard',
        panelLabel: 'Admin Panel'
    },
    ROLE_SUPPORTER: {
        label: 'Supporter',
        icon: '🛠️',
        className: 'bg-blue-50 text-blue-700 border border-blue-200',
        panelPath: '/supporter/dashboard',
        panelLabel: 'Supporter Panel'
    },
    ROLE_MEMBER: {
        label: 'Member',
        icon: '👤',
        className: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    }
};

const RoleBadge = ({ role }) => {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.ROLE_MEMBER;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${config.className}`}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
};

const NavItem = ({ item, isActive, onClick }) => (
    <li>
        <button
            onClick={onClick}
            className={`relative px-4 py-2 text-base font-medium transition-colors ${isActive ? 'text-emerald-600' : 'text-neutral-700 hover:text-emerald-600'}`}
        >
            {item.label}
            {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"></span>}
        </button>
    </li>
);

const UserAvatar = ({ loading, onClick }) => (
    <button
        onClick={onClick}
        disabled={loading}
        className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-neutral-200 hover:border-emerald-500 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
    >
        {loading ? (
            <div className="w-full h-full bg-neutral-200 animate-pulse" />
        ) : (
            <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Avatar" className="w-full h-full object-cover" />
        )}
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
    </button>
);

const DropdownMenuItem = ({ icon: Icon, label, onClick, variant = 'default' }) => {
    const variantClasses = {
        default: 'text-neutral-700 hover:bg-neutral-50',
        danger: 'text-red-600 hover:bg-red-50',
        primary: 'text-emerald-600 hover:bg-emerald-50 font-medium'
    };
    return (
        <button onClick={onClick} className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3 ${variantClasses[variant]}`}>
            <Icon size={18} className="flex-shrink-0" />
            <span>{label}</span>
        </button>
    );
};

const UserDropdown = ({ user, onClose }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) onClose();
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    useEffect(() => {
        const handleEscape = (event) => { if (event.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleNavigation = (path) => { navigate(path); onClose(); };
    const handleLogout = async () => { try { await logout(); onClose(); } catch (error) { console.error(error); } };

    const roleConfig = ROLE_CONFIG[user?.role];
    const hasPanel = roleConfig?.panelPath;

    return (
        <div ref={dropdownRef} className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {user && (
                <div className="px-4 py-3 border-b border-neutral-100">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-neutral-900 truncate">{user.name || 'User'}</p>
                            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <RoleBadge role={user.role} />
                </div>
            )}
            <div className="py-1">
                <DropdownMenuItem icon={User} label="Thông tin cá nhân" onClick={() => handleNavigation('/profile')} />
                <DropdownMenuItem icon={Clock} label="Lịch sử học tập" onClick={() => handleNavigation('/history')} />
                <DropdownMenuItem icon={CreditCard} label="Lịch sử Flashcard" onClick={() => handleNavigation('/flashcard/history')} />
            </div>
            {hasPanel && (
                <>
                    <div className="h-px bg-neutral-100 my-2" />
                    <div className="py-2">
                        <DropdownMenuItem icon={Settings} label={roleConfig.panelLabel} onClick={() => handleNavigation(roleConfig.panelPath)} variant="primary" />
                    </div>
                </>
            )}
            <div className="h-px bg-neutral-200 my-2" />
            <div className="py-2">
                <DropdownMenuItem icon={LogOut} label="Đăng xuất" onClick={handleLogout} variant="danger" />
            </div>
        </div>
    );
};

// ============================================
// MOBILE MENU (Đã Cập Nhật Logic User)
// ============================================
const MobileMenu = ({ isOpen, onClose, navItems, currentPath, onNavigate, user }) => {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
            <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl lg:hidden animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <h2 className="text-lg font-semibold text-neutral-900">Menu</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <nav className="p-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = currentPath === item.path;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => { onNavigate(item.path); onClose(); }}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-neutral-700 hover:bg-neutral-50'}`}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            );
                        })}

                        {/* Mobile Auth Buttons if NOT logged in */}
                        {!user && (
                            <>
                                <div className="h-px bg-neutral-200 my-4" />
                                <li>
                                    <button
                                        onClick={() => { onNavigate('/login'); onClose(); }}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg"
                                    >
                                        <LogIn size={18} /> Đăng nhập
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => { onNavigate('/register'); onClose(); }}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                    >
                                        <UserPlus size={18} /> Đăng ký
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </>
    );
};

// ============================================
// HEADER MAIN COMPONENT (Đã Cập Nhật)
// ============================================

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogoClick = () => navigate('/home');
    const handleNavigate = (path) => navigate(path);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20 lg:h-24">

                    {/* Logo */}
                    <button
                        onClick={handleLogoClick}
                        className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg"
                    >
                        <img src={Logo} alt="TREEdu" className="h-24 lg:h-24 w-auto object-contain" />
                    </button>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:block">
                        <ul className="flex items-center gap-5 text-black">
                            {NAV_ITEMS.map((item) => (
                                <NavItem
                                    key={item.id}
                                    item={item}
                                    isActive={location.pathname === item.path}
                                    onClick={() => handleNavigate(item.path)}
                                />
                            ))}
                        </ul>
                    </nav>

                    {/* Right Section - LOGIC THAY ĐỔI Ở ĐÂY */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        {/* AUTH LOGIC */}
                        {loading ? (
                            // 1. Trường hợp đang load: Giữ khung tròn loading để tránh layout shift
                            <div className="w-10 h-10 rounded-full bg-neutral-200 animate-pulse" />
                        ) : user ? (
                            // 2. Trường hợp ĐÃ ĐĂNG NHẬP: Giữ nguyên Avatar & Dropdown
                            <div className="relative">
                                <UserAvatar
                                    loading={loading}
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                />
                                {isMenuOpen && !loading && (
                                    <UserDropdown
                                        user={user}
                                        onClose={() => setIsMenuOpen(false)}
                                    />
                                )}
                            </div>
                        ) : (
                            // 3. Trường hợp CHƯA ĐĂNG NHẬP: Hiện nút Đăng nhập / Đăng ký
                            <div className="hidden lg:flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="px-5 py-2.5 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors"
                                >
                                    Đăng ký
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu - Truyền thêm prop user */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                navItems={NAV_ITEMS}
                currentPath={location.pathname}
                onNavigate={handleNavigate}
                user={user}
            />
        </header>
    );
};

export default Header;
