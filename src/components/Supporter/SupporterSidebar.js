// src/components/Supporter/SupporterSidebar.js
import React, { useEffect } from 'react';
import { Home, BookOpen, CreditCard, LogOut, AlertTriangle, Headphones, Mic } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import Lottie from "lottie-react";
import treeAnimation from "../../asset/tree.json";
import Logo from "../../asset/logo1.png";
import { useAuth } from '../../hook/useAuth';

const SupporterSidebar = () => {
    const { user, loading, isAuthenticated, isSupporter, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated) { navigate('/login'); return; }
        if (!isSupporter()) { navigate('/403'); }
    }, [loading, isAuthenticated, isSupporter, navigate]);

    if (loading || !user) return null;

    const navItem = (to, Icon, label, end = false) => (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                    isActive
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`
            }
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
        </NavLink>
    );

    return (
        <div className="w-72 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-50 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-100 flex flex-col items-center">
                <img src={Logo} alt="Logo" className="h-24 mx-auto object-contain" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">
                    Supporter
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 py-6 space-y-1 overflow-y-auto">
                {navItem('/supporter', Home, 'Tổng quan', true)}
                {navItem('/supporter/quizzes', BookOpen, 'Quản lý Quiz')}
                {navItem('/supporter/flashcards', CreditCard, 'Quản lý Flashcard')}
                {navItem('/supporter/flashcard-reports', AlertTriangle, 'Báo cáo Flashcard')}
                {navItem('/supporter/dictations', Headphones, 'Nghe chép chính tả')}
                {navItem('/supporter/pronunciation', Mic, 'Quản lý Phát âm')}

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 mt-4 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                </button>
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-white">
                <div className="w-full max-w-[130px] mx-auto">
                    <Lottie animationData={treeAnimation} loop />
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">GreenLife Supporter</p>
            </div>
        </div>
    );
};

export default SupporterSidebar;
