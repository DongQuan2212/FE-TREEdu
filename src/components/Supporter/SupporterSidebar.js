// src/components/Supporter/SupporterSidebar.js
import React, { useEffect } from 'react';
import { Home, BookOpen, CreditCard, LogOut, User, AlertTriangle } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hook/useAuth';

const SupporterSidebar = () => {
    const {
        user,
        loading,
        isAuthenticated,
        isSupporter,
        logout,
    } = useAuth();

    const navigate = useNavigate();

    // Chặn truy cập nếu không đúng role
    useEffect(() => {
        if (loading) return;

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!isSupporter()) {
            navigate('/403'); // hoặc '/'
        }
    }, [loading, isAuthenticated, isSupporter, navigate]);

    // Đang load user
    if (loading) return null;

    return (
        <div className="w-72 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-50 flex flex-col">
            {/* Header */}
            <div className="px-8 py-7 border-b border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Supporter</h1>
                    <p className="text-xs text-gray-500 mt-1">Content Management</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 py-6 space-y-3">
                <NavLink
                    to="/supporter"
                    end
                    className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                            isActive
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`
                    }
                >
                    <Home className="w-5 h-5" />
                    Tổng quan
                </NavLink>

                <NavLink
                    to="/supporter/quizzes"
                    className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                            isActive
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`
                    }
                >
                    <BookOpen className="w-5 h-5" />
                    Quản lý Quiz
                </NavLink>

                <NavLink
                    to="/supporter/flashcards"
                    className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                            isActive
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`
                    }
                >
                    <CreditCard className="w-5 h-5" />
                    Quản lý Flashcard
                </NavLink>
                <NavLink
                    to="/supporter/flashcard-reports"
                    className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                            isActive
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`
                    }
                >
                    <AlertTriangle className="w-5 h-5" />
                    Báo cáo Flashcard
                </NavLink>
            </nav>

            {/* Footer - User info */}
            <div className="px-6 py-6 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="truncate">
                        <p className="font-semibold text-gray-900 truncate">
                            {user?.name || 'Supporter'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                            {user?.email}
                        </p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition"
                >
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default SupporterSidebar;
