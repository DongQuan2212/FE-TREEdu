// src/pages/admin/EmployeeManagement.js
import React, { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, UserCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw, X } from 'lucide-react';

// Components
import Sidebar from "../../components/Admin/Sidebar";
import EmployeeFormModal from "../../components/Admin/EmployeeFormModal";
import EmployeeDetailModal from "../../components/Admin/EmployeeDetailModal";

// Config & Utils
import axiosInstance from "../../config/axiosConfig";
import { notify } from '../../utils/toastNotify';

// --- DESIGN HELPERS ---
// Deterministic accent color per person, derived from their name so every
// avatar reads consistently across reloads without storing a color field.
const AVATAR_PALETTE = [
    { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100' },
    { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
    { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-100' },
    { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-100' },
    { bg: 'bg-sky-50', text: 'text-sky-600', ring: 'ring-sky-100' },
    { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', ring: 'ring-fuchsia-100' },
];

const getAvatarStyle = (name = '') => {
    const code = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
};

const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ROLE_STYLES = {
    Admin: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    Supporter: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    Member: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
};

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
                rawStatus: user.status,
                canPublishFlashcard: user.canPublishFlashcard,
                canReportFlashcard: user.canReportFlashcard,
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
                notify.success('Thêm tài khoản nhân viên mới thành công!');
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

    const handleTogglePermission = async (emp, field) => {
        const newValue = !emp[field];
        const label = field === 'canPublishFlashcard' ? 'công khai flashcard' : 'báo cáo flashcard';
        const action = newValue ? 'mở lại' : 'khoá';

        if (!window.confirm(`Bạn có chắc muốn ${action} quyền ${label} của "${emp.name}"?`)) return;

        try {
            await axiosInstance.put(`/users/${emp.id}`, { [field]: newValue });
            notify.success(`Đã ${action} quyền ${label}!`);
            fetchEmployees();
        } catch (error) {
            notify.error(error.response?.data?.message || "Có lỗi xảy ra!");
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
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300 flex flex-col">

                {/* --- HEADER --- */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                    <div className="px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-lime-600 flex items-center justify-center text-white shadow-sm shadow-lime-600/20">
                                <UserCheck className="w-5 h-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Quản lý nhân viên</h1>
                                <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                                    <span className="font-medium text-slate-700 tabular-nums">{totalElements}</span>
                                    <span>nhân sự trong hệ thống</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchEmployees}
                                disabled={loading}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Làm mới dữ liệu"
                            >
                                <RefreshCw className={`w-4.5 h-4.5 ${loading ? "animate-spin" : ""}`} />
                            </button>

                            <button
                                onClick={handleOpenAdd}
                                className="bg-lime-600 hover:bg-lime-700 text-white pl-4 pr-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm shadow-sm active:scale-[0.98]"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Thêm nhân viên</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="p-6 max-w-7xl mx-auto w-full space-y-5">
                    {/* SEARCH & FILTER */}
                    <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm tên, email, chức vụ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-lime-500/40 focus:border-lime-500 outline-none transition placeholder:text-slate-400"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Role filter */}
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 px-3 py-2.5 focus:ring-2 focus:ring-lime-500/40 focus:border-lime-500 outline-none cursor-pointer"
                            >
                                <option value="all">Tất cả vai trò</option>
                                <option value="Admin">Quản trị viên</option>
                                <option value="Supporter">Nhân viên hỗ trợ</option>
                                <option value="Member">Thành viên</option>
                            </select>

                            {/* Status segmented control */}
                            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 gap-0.5">
                                {[
                                    { key: 'all', label: 'Tất cả' },
                                    { key: 'active', label: 'Hoạt động' },
                                    { key: 'inactive', label: 'Ngưng' },
                                ].map(opt => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setFilterStatus(opt.key)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                                            filterStatus === opt.key
                                                ? 'bg-slate-900 text-white'
                                                : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[400px]">
                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap">
                                <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Họ và tên</th>
                                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Chức vụ</th>
                                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3.5 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3.5 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quyền hạn</th>
                                    <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Thao tác</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-24">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-lime-600"></div>
                                                <span className="text-slate-400 text-sm">Đang tải dữ liệu...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : employees.length > 0 ? (
                                    employees.map(emp => {
                                        const avatar = getAvatarStyle(emp.name);
                                        return (
                                        <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors group">
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ring-1 ${avatar.bg} ${avatar.text} ${avatar.ring} shrink-0`}>
                                                        {getInitials(emp.name)}
                                                    </div>
                                                    <span className="font-medium text-slate-900 text-sm">{emp.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${ROLE_STYLES[emp.rawRole] || ROLE_STYLES.Member}`}>
                                                    {emp.position}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 text-slate-500 text-sm">{emp.email}</td>
                                            <td className="px-6 py-3.5 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                                                    emp.status === "active"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-rose-50 text-rose-600"}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${emp.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                                                    {emp.status === "active" ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 text-center">
                                                {emp.rawRole === 'Member' ? (
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => handleTogglePermission(emp, 'canPublishFlashcard')}
                                                            title={emp.canPublishFlashcard ? "Đang được phép công khai — bấm để khoá" : "Đang bị khoá — bấm để mở"}
                                                            className="flex items-center gap-1.5 text-xs group/toggle"
                                                        >
                                                            <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${emp.canPublishFlashcard ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${emp.canPublishFlashcard ? 'translate-x-4.5' : 'translate-x-1'}`}></span>
                                                            </span>
                                                            <span className="text-slate-500 group-hover/toggle:text-slate-700">Công khai</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleTogglePermission(emp, 'canReportFlashcard')}
                                                            title={emp.canReportFlashcard ? "Đang được phép report — bấm để khoá" : "Đang bị khoá — bấm để mở"}
                                                            className="flex items-center gap-1.5 text-xs group/toggle"
                                                        >
                                                            <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${emp.canReportFlashcard ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${emp.canReportFlashcard ? 'translate-x-4.5' : 'translate-x-1'}`}></span>
                                                            </span>
                                                            <span className="text-slate-500 group-hover/toggle:text-slate-700">Báo cáo</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    {emp.status === "inactive" && (
                                                        <button
                                                            onClick={() => handleActivate(emp.id)}
                                                            className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                                            title="Kích hoạt tài khoản"
                                                        >
                                                            <UserCheck className="w-4 h-4"/>
                                                        </button>
                                                    )}

                                                    <button onClick={() => handleView(emp)} className="p-2 hover:bg-sky-50 text-sky-600 rounded-lg transition-colors" title="Xem chi tiết">
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {emp.status === "active" && (
                                                        <button onClick={() => handleOpenEdit(emp)} className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors" title="Chỉnh sửa">
                                                            <Edit2 className="w-4 h-4"/>
                                                        </button>
                                                    )}

                                                    <button onClick={() => handleDelete(emp.id)} className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors" title="Xóa">
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )})
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-20">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="w-8 h-8 text-slate-200" />
                                                <span className="text-slate-400 text-sm font-medium">Không tìm thấy nhân viên nào phù hợp</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {!loading && totalElements > 0 && (
                            <div className="px-6 py-3.5 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-slate-500">
                                        <span className="font-medium text-slate-700 tabular-nums">{startIndex}-{endIndex}</span> trên <span className="font-medium text-slate-700 tabular-nums">{totalElements}</span>
                                    </span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
                                        className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-lime-500/40 outline-none"
                                    >
                                        <option value={5}>5 / trang</option>
                                        <option value={10}>10 / trang</option>
                                        <option value={20}>20 / trang</option>
                                        <option value={50}>50 / trang</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button onClick={() => setCurrentPage(0)} disabled={currentPage === 0} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-500">
                                        <ChevronsLeft className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-500">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    <div className="flex gap-1 mx-1">
                                        {Array.from({ length: totalPages }, (_, i) => i)
                                            .filter(page => page === 0 || page === totalPages - 1 || (page >= currentPage - 1 && page <= currentPage + 1))
                                            .map((page, idx, arr) => (
                                                <React.Fragment key={page}>
                                                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-1.5 text-slate-300 text-sm">···</span>}
                                                    <button
                                                        onClick={() => handlePageChange(page)}
                                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                                            currentPage === page ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-500'
                                                        }`}
                                                    >
                                                        {page + 1}
                                                    </button>
                                                </React.Fragment>
                                            ))}
                                    </div>

                                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-500">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage === totalPages - 1} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-500">
                                        <ChevronsRight className="w-4 h-4" />
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