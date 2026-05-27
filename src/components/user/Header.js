import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../../asset/logo1.png';
import { useAuth } from '../../hook/useAuth';
import { userAPI } from '../../config/api';
import {
    User,
    Clock,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    X,
    LogIn,
    UserPlus,
    Flame,
    Award
} from 'lucide-react';

const NAV_ITEMS = [
    { id: 'quiz',         label: 'Bài quiz',          path: '/quiz' },
    { id: 'flashcard',    label: 'Flashcard',          path: '/flashcard' },
    { id: 'dictation',    label: 'Nghe chính tả',      path: '/dictation' },
    { id: 'pronunciation',label: 'Luyện phát âm',      path: '/pronunciation-practice' },
    { id: 'intro',        label: 'Giới thiệu',         path: '/intro' },
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

const UserAvatar = ({ user, profile, loading, onClick }) => {
    const finalAvatar = profile?.avatarUrl || user?.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-neutral-200 hover:border-emerald-500 transition-all duration-200 hover:scale-105 focus:outline-none"
        >
            {loading ? (
                <div className="w-full h-full bg-neutral-200 animate-pulse" />
            ) : (
                <img src={finalAvatar} alt="Avatar" className="w-full h-full object-cover" />
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
        </button>
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

const UserDropdown = ({ user, profile, onClose }) => {
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

    const handleNavigation = (path) => { navigate(path); onClose(); };
    const handleLogout = async () => { try { await logout(); onClose(); } catch (error) { console.error(error); } };

    const roleConfig = ROLE_CONFIG[user?.role];
    const hasPanel = roleConfig?.panelPath;

    const displayName = profile?.fullName || user?.fullName || user?.name || 'User';
    const displayAvatar = profile?.avatarUrl || user?.avatarUrl;

    return (
        <div ref={dropdownRef} className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-neutral-100">
                <div className="flex items-start gap-3 mb-3">
                    {displayAvatar ? (
                        <img src={displayAvatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-neutral-100" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                            {displayName?.[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 truncate">{displayName}</p>
                        <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <RoleBadge role={user?.role} />

                    {/* Hiển thị ngọn lửa Streak học tập */}
                    {profile && (
                        <div className="flex items-center gap-1 text-orange-500 text-xs font-bold bg-orange-50 px-2 py-1 rounded-lg border border-orange-100 animate-pulse">
                            <Flame size={14} className="fill-current"/>
                            <span>{profile.streakCount} Ngày</span>
                        </div>
                    )}
                </div>

                {/* Thanh hiển thị Level & XP */}
                {profile && (
                    <div className="mt-4 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                        <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-bold text-emerald-700 flex items-center gap-1">
                                <Award size={14}/> Cấp độ {profile.level}
                            </span>
                            <span className="text-neutral-500 font-medium">{profile.xp} XP</span>
                        </div>
                        <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-emerald-500 h-full transition-all duration-500"
                                style={{ width: `${profile.progressPercentage || 0}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-1 text-right">Còn {profile.xpNeededForNextLevel} XP để lên cấp</p>
                    </div>
                )}
            </div>

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

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // 🌟 ĐÃ CẬP NHẬT: Gọi API thông qua userAPI xịn vừa cấu hình
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) {
                setProfile(null);
                return;
            }
            setProfileLoading(true);
            try {
                // Sử dụng hàm getProfile() từ config/api.js
                const res = await userAPI.getProfile();
                if (res && res.data) {
                    setProfile(res.data);
                }
            } catch (error) {
                console.error("❌ Lỗi khi lấy thông tin chi tiết qua userAPI:", error);
            } finally {
                setProfileLoading(false);
            }
        };

        fetchUserProfile();
    }, [user]);

    const handleLogoClick = () => navigate('/home');
    const handleNavigate = (path) => navigate(path);

    const isTotalLoading = authLoading || (user && profileLoading && !profile);

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

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        {/* AUTH LOGIC */}
                        {isTotalLoading ? (
                            <div className="w-10 h-10 rounded-full bg-neutral-200 animate-pulse" />
                        ) : user ? (
                            <div className="relative">
                                <UserAvatar
                                    user={user}
                                    profile={profile}
                                    loading={isTotalLoading}
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                />
                                {isMenuOpen && (
                                    <UserDropdown
                                        user={user}
                                        profile={profile}
                                        onClose={() => setIsMenuOpen(false)}
                                    />
                                )}
                            </div>
                        ) : (
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
