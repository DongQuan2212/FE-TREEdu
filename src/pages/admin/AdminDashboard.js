import React from 'react';
import { Users, UserCheck, Menu, Bell, LogOut, TrendingUp, Calendar, DollarSign, Activity } from 'lucide-react';
import Sidebar from "../../components/Admin/Sidebar";
import { useNavigate } from 'react-router-dom';

const AdminHomepage = () => {
    const navigate = useNavigate();

    const stats = [
        { label: "Tổng nhân viên", value: "156", icon: UserCheck, color: "bg-blue-500", trend: "+12%" },
        { label: "Người dùng hoạt động", value: "2,845", icon: Users, color: "bg-purple-500", trend: "+8%" },
        { label: "Doanh thu tháng", value: "₫842M", icon: DollarSign, color: "bg-green-500", trend: "+23%" },
    ];

    const quickActions = [
        { title: "Quản lý nhân viên", desc: "Xem, thêm, sửa, phân quyền nhân viên", icon: UserCheck, color: "from-blue-500 to-blue-600", path: "/admin/employees" },
        { title: "Quản lý người dùng", desc: "Quản lý tài khoản khách hàng", icon: Users, color: "from-purple-500 to-purple-600", path: "/admin/users" },
        { title: "Báo cáo doanh thu", desc: "Thống kê chi tiết theo thời gian", icon: TrendingUp, color: "from-green-500 to-emerald-600", path: "/admin/reports" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
                {/* Top Bar */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>

                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-gray-900">Admin</p>
                                    <p className="text-xs text-gray-500">Quản trị viên</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-500 to-green-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    A
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    {/* Welcome */}
                    <div className="mb-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                            Chào mừng quay trở lại, Admin! 👋
                        </h2>
                        <p className="text-lg text-gray-600">Đây là tổng quan hoạt động hệ thống hôm nay, {new Date().toLocaleDateString('vi-VN')}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`${stat.color} p-3 rounded-lg`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        {stat.trend}
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Hành động nhanh</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => navigate(action.path)}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-lg hover:border-gray-300 transition transform hover:-translate-y-1"
                            >
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} p-3 mb-4 shadow-md`}>
                                    <action.icon className="w-8 h-8 text-white" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{action.desc}</p>
                                <div className="mt-4 flex items-center text-sm font-medium text-lime-600">
                                    Xem chi tiết →
                                </div>
                            </button>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminHomepage;
