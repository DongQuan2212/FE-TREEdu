// components/Admin/Sidebar.tsx
import React, { useState } from "react";
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

const Sidebar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false); // cho mobile

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

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
                className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white shadow-md hover:bg-gray-50 transition"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-200">
                        <img src={Logo} alt="Logo" className="h-12 w-auto mx-auto" />
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                                            isActive
                                                ? "bg-lime-50 text-lime-700 shadow-sm border border-lime-200"
                                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        }`
                                    }
                                    onClick={() => setIsOpen(false)} // đóng menu khi click trên mobile
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                    {/* Hiệu ứng active indicator */}
                                    <div className="ml-auto w-1 h-8 bg-lime-600 rounded-l-full opacity-0 transition-opacity group-hover:opacity-100" />
                                </NavLink>
                            );
                        })}

                        {/* Đăng xuất */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 mt-8 border border-transparent hover:border-red-200"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Đăng xuất</span>
                        </button>
                    </nav>

                    {/* Lottie Animation - đẹp lung linh */}
                    <div className="p-6 border-t border-gray-200 bg-gradient-to-t from-gray-50 to-white">
                        <div className="max-w-[120px] mx-auto opacity-90">
                            <Lottie animationData={treeAnimation} loop={true} />
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-3 font-medium">
                            GreenLife Admin
                        </p>
                    </div>
                </div>
            </aside>

            {/* Overlay khi mở menu mobile */}
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
