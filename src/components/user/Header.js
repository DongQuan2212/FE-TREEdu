import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../asset/logo1.png';
import { useAuth } from '../../hook/useAuth';

const Header = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout, loading } = useAuth();

    const handleLogoClick = () => navigate("/home");
    const handleQuiz = () => navigate("/quiz");
    const handleFlashcard = () => navigate("/flashcard");
    const handleIntro = () => navigate("/intro");
    const handleAi = () => navigate("/pronunciation-practice");

    const handleProfile = () => {
        navigate("/profile");
        setIsMenuOpen(false);
    };

    const handleHistory = () => {
        navigate("/history");
        setIsMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            setIsMenuOpen(false);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // Hiển thị role badge
    const getRoleBadge = () => {
        if (!user) return null;

        const roleConfig = {
            'ROLE_ADMIN': {
                label: '👑 Admin',
                bgColor: 'bg-red-100',
                textColor: 'text-red-700'
            },
            'ROLE_SUPPORTER': {
                label: '🛠️ Supporter',
                bgColor: 'bg-blue-100',
                textColor: 'text-blue-700'
            },
            'ROLE_MEMBER': {
                label: '👤 Member',
                bgColor: 'bg-green-100',
                textColor: 'text-green-700'
            }
        };

        const config = roleConfig[user.role] || roleConfig['ROLE_MEMBER'];

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
                {config.label}
            </span>
        );
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-20 xl:px-52 py-4 bg-white backdrop-blur-md border-b border-gray-200 shadow-sm">
            {/* Logo */}
            <div className="cursor-pointer" onClick={handleLogoClick}>
                <img src={Logo} alt="TREEdu Logo" className="h-14 lg:h-16 w-auto object-contain" />
            </div>

            {/* Nav + Avatar */}
            <div className="flex items-center gap-8 lg:gap-12">
                {/* Navigation */}
                <nav className="hidden lg:block">
                    <ul className="flex items-center gap-8 text-gray-700 font-medium">
                        <li onClick={handleQuiz} className="cursor-pointer hover:text-lime-600 transition">
                            Bài quiz
                        </li>
                        <li onClick={handleFlashcard} className="cursor-pointer hover:text-lime-600 transition">
                            Flashcard
                        </li>
                        <li onClick={handleAi} className="cursor-pointer hover:text-lime-600 transition">
                            Phòng luyện phát âm
                        </li>
                        <li onClick={handleIntro} className="cursor-pointer hover:text-lime-600 transition">
                            Giới thiệu
                        </li>
                        <li className="cursor-pointer hover:text-lime-600 transition">
                            Liên lạc
                        </li>
                    </ul>
                </nav>

                {/* Avatar + Dropdown Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-10 h-10 lg:w-11 lg:h-11 rounded-full overflow-hidden border-2 border-gray-300 hover:border-lime-500 transition-all duration-200 hover:scale-105 shadow-md"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="w-full h-full bg-gray-200 animate-pulse" />
                        ) : (
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </button>

                    {isMenuOpen && !loading && (
                        <>
                            {/* Overlay để click ngoài sẽ tắt */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* User Info Section */}
                                {user && (
                                    <div className="px-5 py-3 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-lime-100 flex items-center justify-center">
                                                <span className="text-lime-700 font-bold text-lg">
                                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800 truncate">
                                                    {user.name || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            {getRoleBadge()}
                                        </div>
                                    </div>
                                )}

                                {/* Menu Items */}
                                <button
                                    onClick={handleProfile}
                                    className="w-full px-5 py-3 text-left text-gray-700 hover:bg-lime-50 hover:text-lime-700 transition flex items-center gap-3"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Thông tin cá nhân</span>
                                </button>

                                <button
                                    onClick={handleHistory}
                                    className="w-full px-5 py-3 text-left text-gray-700 hover:bg-lime-50 hover:text-lime-700 transition flex items-center gap-3"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Lịch sử học tập</span>
                                </button>

                                {/* Admin/Supporter Panel */}
                                {user && (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_SUPPORTER') && (
                                    <>
                                        <hr className="my-2 border-gray-200" />
                                        <button
                                            onClick={() => {
                                                navigate(user.role === 'ROLE_ADMIN' ? '/admin/dashboard' : '/supporter/dashboard');
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full px-5 py-3 text-left text-purple-600 hover:bg-purple-50 transition flex items-center gap-3 font-medium"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>
                                                {user.role === 'ROLE_ADMIN' ? 'Admin Panel' : 'Supporter Panel'}
                                            </span>
                                        </button>
                                    </>
                                )}

                                <hr className="my-2 border-gray-200" />

                                <button
                                    onClick={handleLogout}
                                    className="w-full px-5 py-3 text-left text-red-600 hover:bg-red-50 transition flex items-center gap-3 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
