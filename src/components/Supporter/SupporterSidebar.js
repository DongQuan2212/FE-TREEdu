// src/components/Supporter/SupporterSidebar.js
import React, { useEffect } from 'react';
import { Home, BookOpen, CreditCard, LogOut, User, AlertTriangle, Headphones } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import Lottie from "lottie-react";
import treeAnimation from "../../asset/tree.json"; // Import animation cái cây
import Logo from "../../asset/logo1.png"; // Import logo hệ thống
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
            navigate('/403'); 
        }
    }, [loading, isAuthenticated, isSupporter, navigate]);

    // Đang load user
    if (loading || !user) return null;

    return (
        <div className="w-72 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-50 flex flex-col">
            {/* Header chứa Logo (Thay thế text Supporter cũ bằng Logo của bạn) */}
            <div className="p-6 border-b border-gray-100 flex flex-col items-center">
                <img src={Logo} alt="Logo" className="h-24 mx-auto object-contain" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">
                    Supporter
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 py-6 space-y-3 overflow-y-auto chunk-scrollbar">
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
                
                <NavLink
                    to="/supporter/dictations"
                    className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                            isActive
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`
                    }
                >
                    <Headphones className="w-5 h-5" />
                    Nghe chép chính tả
                </NavLink>

                {/* Phần Đăng xuất được lồng trực tiếp bên dưới Menu theo cấu trúc mới */}
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 mt-6 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                </button>
            </nav>

            {/* Footer chứa Lottie Animation cái cây dưới đáy Sidebar */}
            <div className="p-6 border-t border-gray-100 bg-white">
                <div className="w-full max-w-[130px] mx-auto">
                    <Lottie animationData={treeAnimation} loop />
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">
                    GreenLife Supporter
                </p>
            </div>
        </div>
    );
};

export default SupporterSidebar;