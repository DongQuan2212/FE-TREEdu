import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    Home,
    Users,
    UserCog,
    LogOut,
    Menu,
    X
} from "lucide-react";
import Lottie from "lottie-react";
import treeAnimation from "../../asset/tree.json";
import Logo from "../../asset/logo1.png";
import { useAuth, ROLES } from "../../hook/useAuth";

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
        { to: "/admin/employee", icon: UserCog, label: "Quản lý nhân viên" },
        { to: "/admin/user", icon: Users, label: "Quản lý người dùng" },
        { to: "/admin/revenue", icon: Users, label: "Quản lý doanh thu" },
    ];

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white shadow-md"
            >
                {isOpen ? <X /> : <Menu />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform
                ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">

                    {/* Logo */}
                    <div className="p-6 border-b">
                        <img src={Logo} alt="Logo" className="h-12 mx-auto" />
                    </div>

                    {/* ADMIN INFO */}
                    <div className="px-6 py-4 border-b text-center">
                        <p className="text-sm font-semibold text-gray-900">
                            {user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                            {user.email}
                        </p>
                        <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-lime-100 text-lime-700">
                            Admin
                        </span>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
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
