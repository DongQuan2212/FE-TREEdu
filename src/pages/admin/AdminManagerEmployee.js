// src/pages/admin/EmployeeManagement.js
import React, { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, UserCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw, Filter } from 'lucide-react';

// Components
import Sidebar from "../../components/Admin/Sidebar";
import EmployeeFormModal from "../../components/Admin/EmployeeFormModal";
import EmployeeDetailModal from "../../components/Admin/EmployeeDetailModal";

// Config & Utils
import axiosInstance from "../../config/axiosConfig";
import { notify } from '../../utils/toastNotify';

const EmployeeManagement = () => {
    // --- STATE ---
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterRole, setFilterRole] = useState('all');

    // Modal state
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // --- API HANDLERS ---

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);

            const params = {
                page: currentPage,
                size: pageSize,
                ...(searchTerm.trim() && { search: searchTerm.trim() }),
                ...(filterStatus !== 'all' && { status: filterStatus === 'active' ? 'Active' : 'Inactive' }),
                ...(filterRole !== 'all' && { role: filterRole })
            };

            const response = await axiosInstance.get("/users/", { params });

            // Map data
            const mappedUsers = response.data.data.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                position: mapRole(user.role),
                status: mapStatus(user.status),
                rawRole: user.role,
                rawStatus: user.status
            }));

            setEmployees(mappedUsers);
            setTotalPages(response.data.totalPages || 0);
            setTotalElements(response.data.totalElements || 0);

        } catch (error) {
            console.error("Fetch error:", error);
            notify.error("Không thể tải danh sách nhân viên!");
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filterStatus, filterRole, searchTerm]);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage === 0) {
                fetchEmployees();
            } else {
                setCurrentPage(0);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, filterStatus, filterRole, pageSize]); // Xóa fetchEmployees khỏi dep array của useEffect này để tránh loop, xử lý logic page change riêng

    // Effect riêng cho page change để tránh conflict với debounce
    useEffect(() => {
        fetchEmployees();
    }, [currentPage]);

    // Actions
    const handleActivate = async (userId) => {
        if (!window.confirm("Bạn có chắc muốn kích hoạt tài khoản này?")) return;

        try {
            await axiosInstance.post(`/users/activate/${userId}`);
            notify.success("Kích hoạt tài khoản thành công!");
            fetchEmployees();
        } catch (error) {
            notify.error(error.response?.data?.message || "Lỗi kích hoạt tài khoản!");
        }
    };

    const handleFormSubmit = async (formData) => {
        setProcessing(true);
        try {
            if (modalMode === 'add') {
                await axiosInstance.post('/users/newSupporter', {
                    userType: 'SUPPORTER',
                    email: formData.email,
                    fullName: formData.fullName,
                    password: formData.password
                });
                notify.success('Thêm nhân viên mới thành công!');
            } else {
                await axiosInstance.put(`/users/${selectedEmployee.id}`, formData);
                notify.success('Cập nhật thông tin thành công!');
            }

            setShowFormModal(false);
            fetchEmployees();
        } catch (error) {
            notify.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xác nhận xóa nhân viên này?")) return;

        try {
            await axiosInstance.delete(`/users/${id}`);
            notify.success("Đã xóa nhân viên thành công!");

            // Logic lùi trang nếu xóa phần tử cuối
            if (employees.length === 1 && currentPage > 0) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchEmployees();
            }
        } catch (error) {
            notify.error("Không thể xóa nhân viên!");
        }
    };

    // --- UTILS ---
    const mapRole = (role) => {
        switch (role) {
            case "Admin": return "Quản trị viên";
            case "Supporter": return "Nhân viên hỗ trợ";
            default: return "Thành viên";
        }
    };

    const mapStatus = (status) => status === "Active" ? "active" : "inactive";

    // --- PAGINATION HELPERS ---
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) setCurrentPage(newPage);
    };

    const startIndex = currentPage * pageSize + 1;
    const endIndex = Math.min((currentPage + 1) * pageSize, totalElements);

    // --- UI HANDLERS ---
    const handleOpenAdd = () => {
        setModalMode('add');
        setSelectedEmployee(null);
        setShowFormModal(true);
    };

    const handleOpenEdit = (emp) => {
        setModalMode('edit');
        setSelectedEmployee(emp);
        setShowFormModal(true);
    };

    const handleView = (emp) => {
        setSelectedEmployee(emp);
        setShowDetailModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300 flex flex-col">

                {/* --- HEADER ĐỒNG BỘ (STYLE LIME) --- */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Icon đại diện */}
                            <div className="w-10 h-10 rounded-full bg-lime-50 flex items-center justify-center text-lime-600 shadow-sm border border-lime-100">
                                <UserCheck className="w-6 h-6" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Quản lý nhân viên</h1>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                    <span>Tổng số:</span>
                                    <span className="bg-gray-100 text-gray-900 px-2 py-0.5 rounded font-mono font-bold text-xs border border-gray-200">
                                        {totalElements}
                                    </span>
                                    <span>nhân sự</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Nút Refresh */}
                            <button
                                onClick={fetchEmployees}
                                disabled={loading}
                                className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                title="Làm mới dữ liệu"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                            </button>

                            {/* Nút Thêm mới (Màu Lime) */}
                            <button
                                onClick={handleOpenAdd}
                                className="bg-lime-600 hover:bg-lime-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition text-sm shadow-sm active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Thêm nhân viên</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
                    {/* SEARCH & FILTER */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tên, email, chức vụ..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <select
                                        value={filterRole}
                                        onChange={(e) => setFilterRole(e.target.value)}
                                        className="bg-transparent text-sm focus:outline-none cursor-pointer text-gray-700 font-medium"
                                    >
                                        <option value="all">Tất cả vai trò</option>
                                        <option value="Admin">Quản trị viên</option>
                                        <option value="Supporter">Nhân viên hỗ trợ</option>
                                        <option value="Member">Thành viên</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                    <div className={`w-2 h-2 rounded-full ${filterStatus === 'active' ? 'bg-green-500' : filterStatus === 'inactive' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="bg-transparent text-sm focus:outline-none cursor-pointer text-gray-700 font-medium"
                                    >
                                        <option value="all">Tất cả trạng thái</option>
                                        <option value="active">Đang hoạt động</option>
                                        <option value="inactive">Ngưng hoạt động</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Họ và Tên</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Chức vụ</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-lime-600"></div>
                                                <span className="text-gray-500 text-sm font-medium">Đang tải dữ liệu...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : employees.length > 0 ? (
                                    employees.map(emp => (
                                        <tr key={emp.id} className="hover:bg-lime-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{emp.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                                                    emp.rawRole === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        emp.rawRole === 'Supporter' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-gray-50 text-gray-600 border-gray-200'
                                                }`}>
                                                    {emp.position}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">{emp.email}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border
                                                    ${emp.status === "active"
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : "bg-red-50 text-red-700 border-red-200"}`}>
                                                    {emp.status === "active" ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {emp.status === "inactive" && (
                                                        <button
                                                            onClick={() => handleActivate(emp.id)}
                                                            className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition"
                                                            title="Kích hoạt tài khoản"
                                                        >
                                                            <UserCheck className="w-4 h-4"/>
                                                        </button>
                                                    )}

                                                    <button onClick={() => handleView(emp)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition" title="Xem chi tiết">
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {emp.status === "active" && (
                                                        <button onClick={() => handleOpenEdit(emp)} className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg transition" title="Chỉnh sửa">
                                                            <Edit2 className="w-4 h-4"/>
                                                        </button>
                                                    )}

                                                    <button onClick={() => handleDelete(emp.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition" title="Xóa">
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-16 text-gray-500 font-medium">
                                            Không tìm thấy nhân viên nào phù hợp
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {!loading && totalElements > 0 && (
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-700">
                                        <span className="font-medium">{startIndex}-{endIndex}</span> của <span className="font-medium">{totalElements}</span>
                                    </span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-lime-500 outline-none"
                                    >
                                        <option value={5}>5 / trang</option>
                                        <option value={10}>10 / trang</option>
                                        <option value={20}>20 / trang</option>
                                        <option value={50}>50 / trang</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button onClick={() => setCurrentPage(0)} disabled={currentPage === 0} className="p-2 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition">
                                        <ChevronsLeft className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} className="p-2 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    {/* Page Numbers Logic Preserved */}
                                    <div className="flex gap-1 mx-2">
                                        {Array.from({ length: totalPages }, (_, i) => i)
                                            .filter(page => page === 0 || page === totalPages - 1 || (page >= currentPage - 1 && page <= currentPage + 1))
                                            .map((page, idx, arr) => (
                                                <React.Fragment key={page}>
                                                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-2 text-gray-400">...</span>}
                                                    <button
                                                        onClick={() => handlePageChange(page)}
                                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                                                            currentPage === page ? 'bg-lime-600 text-white shadow-sm' : 'hover:bg-gray-200 text-gray-600'
                                                        }`}
                                                    >
                                                        {page + 1}
                                                    </button>
                                                </React.Fragment>
                                            ))}
                                    </div>

                                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage === totalPages - 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition">
                                        <ChevronsRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* MODALS */}
                <EmployeeFormModal
                    isOpen={showFormModal}
                    onClose={() => setShowFormModal(false)}
                    mode={modalMode}
                    employee={selectedEmployee}
                    onSubmit={handleFormSubmit}
                    isLoading={processing}
                />

                <EmployeeDetailModal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    employee={selectedEmployee}
                />
            </div>
        </div>
    );
};

export default EmployeeManagement;
