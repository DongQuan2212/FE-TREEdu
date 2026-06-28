import React, { useState } from 'react';
import { TrendingUp, DollarSign, Users, Calendar, Filter, Download, ChevronDown } from 'lucide-react';
import Sidebar from "../../components/Admin/Sidebar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueReport = () => {
    // Dữ liệu giả lập (sau này thay bằng API)
    const [selectedRange, setSelectedRange] = useState('30days');

    const totalRevenue = 128540000; // VNĐ
    const thisMonthRevenue = 42800000;
    const upgradesThisMonth = 142;
    const conversionRate = 8.7; // %

    // Doanh thu theo ngày (30 ngày gần nhất)
    const dailyData = [
        { date: '01/11', revenue: 3200000, upgrades: 11 },
        { date: '02/11', revenue: 4800000, upgrades: 16 },
        { date: '05/11', revenue: 6200000, upgrades: 21 },
        { date: '08/11', revenue: 8500000, upgrades: 28 },
        { date: '12/11', revenue: 9800000, upgrades: 33 },
        { date: '15/11', revenue: 12500000, upgrades: 42 },
        { date: '18/11', revenue: 15200000, upgrades: 51 },
        { date: '22/11', revenue: 18900000, upgrades: 63 },
        { date: '25/11', revenue: 21400000, upgrades: 71 },
        { date: '28/11', revenue: 24800000, upgrades: 82 },
        { date: '30/11', revenue: 28500000, upgrades: 95 },
    ];

    // Giao dịch gần đây
    const recentTransactions = [
        { id: 1001, user: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', package: 'Premium 1 năm', amount: 1190000, date: '30/11/2025 14:32' },
        { id: 1002, user: 'Trần Minh Đức', email: 'duc.tm@gmail.com', package: 'Premium 6 tháng', amount: 690000, date: '30/11/2025 13:15' },
        { id: 1003, user: 'Phạm Lan Anh', email: 'lananh.pham@outlook.com', package: 'Premium 1 tháng', amount: 149000, date: '30/11/2025 11:47' },
        { id: 1004, user: 'Lê Hoàng Nam', email: 'nam.le@gmail.com', package: 'Premium 1 năm', amount: 1190000, date: '29/11/2025 22:19' },
        { id: 1005, user: 'Vũ Thị Mai', email: 'mai.vu@yahoo.com', package: 'Premium 3 tháng', amount: 399000, date: '29/11/2025 19:05' },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <TrendingUp className="w-8 h-8 text-emerald-600" />
                                Báo cáo doanh thu
                            </h1>
                            <p className="text-gray-600 mt-1">Theo dõi doanh thu từ nâng cấp gói Premium</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={selectedRange}
                                onChange={(e) => setSelectedRange(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="7days">7 ngày qua</option>
                                <option value="30days">30 ngày qua</option>
                                <option value="90days">90 ngày qua</option>
                                <option value="custom">Tùy chỉnh</option>
                            </select>

                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition">
                                <Download className="w-4 h-4" />
                                Xuất báo cáo
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-6 max-w-7xl mx-auto space-y-6">
                    {/* Tổng quan 4 ô */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-100 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-emerald-600" />
                                </div>
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+28.5%</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(thisMonthRevenue)}</p>
                            <p className="text-sm text-gray-500 mt-1">Doanh thu tháng này</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{upgradesThisMonth}</p>
                            <p className="text-sm text-gray-500 mt-1">Lượt nâng cấp tháng này</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
                            <p className="text-sm text-gray-500 mt-1">Tỷ lệ chuyển đổi FREE → PREMIUM</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                            <p className="text-sm text-gray-500 mt-1">Tổng doanh thu tất cả thời gian</p>
                        </div>
                    </div>

                    {/* Biểu đồ */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Doanh thu theo ngày (30 ngày gần nhất)</h3>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value / 1000000}tr`} />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        dot={{ fill: '#10b981', r: 6 }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bảng giao dịch gần đây */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Giao dịch nâng cấp gần đây</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Mã GD</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Người dùng</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Gói</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Số tiền</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Thời gian</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {recentTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-emerald-600">#{tx.id}</td>
                                        <td className="px-6 py-4 text-gray-900">{tx.user}</td>
                                        <td className="px-6 py-4 text-gray-600">{tx.email}</td>
                                        <td className="px-6 py-4">
                                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    {tx.package}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(tx.amount)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{tx.date}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RevenueReport;
