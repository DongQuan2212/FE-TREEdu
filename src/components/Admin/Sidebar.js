import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    Home,
    UserCog,
    LogOut,
    WholeWord,
    FileQuestion,
    ShieldAlert
} from "lucide-react";
import Lottie from "lottie-react";
import treeAnimation from "../../asset/tree.json";
import Logo from "../../asset/logo1.png";
import { useAuth } from "../../hook/useAuth";

const Sidebar = () => {
    const navigate = useNavigate();
    const { user, loading, isAdmin, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    /* ====== BẢO VỆ ROUTE ADMIN ====== */
    useEffect(() => {
        if (!loading && (!user || !isAdmin())) {
            navigate("/login");
        }
    }, [user, loading, isAdmin, navigate]);

    if (loading || !user) return null;

    const menuItems = [
        { to: "/admin", icon: Home, label: "Tổng quan" },
        { to: "/admin/employee", icon: UserCog, label: "Quản lý người dùng" },
        { to: "/admin/quiz", icon: FileQuestion, label: "Quản lý bài quiz" },
        { to: "/admin/flashcard", icon: WholeWord, label: "Quản lý Flashcard" },
        { to: "/admin/flashcard-reviews", icon: ShieldAlert, label: "Thẩm định Flashcard" },
    ];

    return (
        <>


            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform
                ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">

                    {/* Logo */}
                    <div className="p-6 border-b">
                        <img src={Logo} alt="Logo" className="h-24 mx-auto" />
                    </div>
                    {/* Menu */}
                    <nav className="flex-1 px-4 py-6 space-y-6">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                                        ${isActive
                                            ? "bg-lime-50 text-lime-700 border border-lime-200"
                                            : "text-gray-700 hover:bg-gray-100"}`
                                    }
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </NavLink>
                            );
                        })}

                        {/* Logout */}
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                            text-sm font-medium text-red-600 hover:bg-red-50 mt-6"
                        >
                            <LogOut className="w-5 h-5" />
                            Đăng xuất
                        </button>
                    </nav>

                    {/* Animation */}
                    <div className="p-6 border-t">
                        <Lottie animationData={treeAnimation} loop />
                        <p className="text-xs text-center text-gray-500 mt-2">
                            GreenLife Admin
                        </p>
                    </div>
                </div>
            </aside>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
