import React, { useEffect, useState } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, UserCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Sidebar from "../../components/Admin/Sidebar";
import EmployeeFormModal from "../../components/Admin/EmployeeFormModal";
import EmployeeDetailModal from "../../components/Admin/EmployeeDetailModal";
import axiosInstance from "../../config/axiosConfig";

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterRole, setFilterRole] = useState('all');

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const handleActivate = async (userId) => {
        if (!window.confirm("Bạn có chắc muốn kích hoạt tài khoản này?")) return;

        try {
            await axiosInstance.post(`/users/activate/${userId}`);

            alert("Kích hoạt tài khoản thành công!");
            fetchUsers(); // Reload lại danh sách để cập nhật trạng thái
        } catch (error) {
            console.error("Activate error:", error);
            alert(error.response?.data?.message || "Không thể kích hoạt tài khoản!");
        }
    };
    /* ================= FETCH USERS ================= */
    useEffect(() => {
        fetchUsers();
    }, [currentPage, pageSize, filterStatus, filterRole]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage === 0) {
                fetchUsers();
            } else {
                setCurrentPage(0); // Reset về trang đầu khi search
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            // Build query params
            const params = {
                page: currentPage,
                size: pageSize
            };

            // Thêm search term nếu có
            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }

            // Thêm filter status nếu không phải "all"
            if (filterStatus !== 'all') {
                params.status = filterStatus === 'active' ? 'Active' : 'Inactive';
            }

            // Thêm filter role nếu không phải "all"
            if (filterRole !== 'all') {
                params.role = filterRole;
            }

            const response = await axiosInstance.get("/users/", { params });

            // Map dữ liệu từ API
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

            // Cập nhật thông tin phân trang
            setTotalPages(response.data.totalPages || 0);
            setTotalElements(response.data.totalElements || 0);

        } catch (error) {
            console.error("Fetch users error:", error);
            alert("Không thể tải danh sách người dùng!");
        } finally {
            setLoading(false);
        }
    };

    /* ================= MAPPING ================= */
    const mapRole = (role) => {
        switch (role) {
            case "Admin":
                return "Quản trị viên";
            case "Supporter":
                return "Nhân viên hỗ trợ";
            default:
                return "Thành viên";
        }
    };

    const mapStatus = (status) => {
        return status === "Active" ? "active" : "inactive";
    };

    /* ================= PAGINATION HANDLERS ================= */
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleFirstPage = () => {
        setCurrentPage(0);
    };

    const handleLastPage = () => {
        setCurrentPage(totalPages - 1);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(0); // Reset về trang đầu
    };

    /* ================= ACTIONS ================= */
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

    const handleFormSubmit = async (formData) => {
        try {
            if (modalMode === 'add') {
                // Gọi API thêm mới supporter
                await axiosInstance.post('/users/newSupporter', {
                    userType: 'SUPPORTER',
                    email: formData.email,
                    fullName: formData.fullName,
                    password: formData.password
                });
                alert('Thêm nhân viên thành công!');
            } else {
                // Gọi API cập nhật (nếu có)
                await axiosInstance.put(`/users/${selectedEmployee.id}`, formData);
                alert('Cập nhật nhân viên thành công!');
            }

            setShowFormModal(false);
            fetchUsers(); // Reload lại danh sách
        } catch (error) {
            console.error('Submit error:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xác nhận xóa người dùng này?")) return;

        try {
            await axiosInstance.delete(`/users/${id}`);

            // Nếu xóa phần tử cuối cùng của trang và không phải trang đầu
            if (employees.length === 1 && currentPage > 0) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchUsers();
            }

            alert("Xóa người dùng thành công!");
        } catch (error) {
            console.error("Delete error:", error);
            alert("Không thể xóa người dùng!");
        }
    };

    /* ================= PAGINATION INFO ================= */
    const startIndex = currentPage * pageSize + 1;
    const endIndex = Math.min((currentPage + 1) * pageSize, totalElements);

    /* ================= UI ================= */
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
                {/* HEADER */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <UserCheck className="w-8 h-8 text-lime-600" />
                                Quản lý nhân viên
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Quản lý thông tin và phân quyền nhân viên hệ thống
                            </p>
                        </div>
                        <button
                            onClick={handleOpenAdd}
                            className="bg-lime-600 hover:bg-lime-700 text-white px-5 py-3 rounded-lg font-medium flex items-center gap-2 transition"
                        >
                            <Plus className="w-5 h-5" />
                            Thêm nhân viên
                        </button>
                    </div>
                </header>

                <main className="p-6 max-w-7xl mx-auto space-y-6">
                    {/* SEARCH & FILTER */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tên, chức vụ, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none"
                                />
                            </div>

                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none"
                            >
                                <option value="all">Tất cả vai trò</option>
                                <option value="Admin">Quản trị viên</option>
                                <option value="Supporter">Nhân viên hỗ trợ</option>
                                <option value="Member">Thành viên</option>
                            </select>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="inactive">Ngưng hoạt động</option>
                            </select>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tên</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Chức vụ</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                {loading && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-16 text-gray-500">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-lime-600 border-t-transparent rounded-full animate-spin"></div>
                                                Đang tải danh sách người dùng...
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loading && employees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{emp.name}</td>
                                        <td className="px-6 py-4">{emp.position}</td>
                                        <td className="px-6 py-4">{emp.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium
                                                ${emp.status === "active"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"}`}>
                                                {emp.status === "active" ? "Đang hoạt động" : "Ngưng hoạt động"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-3">
                                                {/* Nút Kích hoạt - Chỉ hiển thị khi tài khoản đang "inactive" */}
                                                {emp.status === "inactive" && (
                                                    <button
                                                        onClick={() => handleActivate(emp.id)}
                                                        className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition group"
                                                        title="Kích hoạt tài khoản"
                                                    >
                                                        <UserCheck
                                                            className="w-4 h-4 group-hover:scale-110 transition"/>
                                                    </button>
                                                )}


                                                {/* Nút Sửa - Chỉ hiện nếu đang hoạt động (hoặc bạn có thể giữ luôn nếu muốn) */}
                                                {emp.status === "active" && (
                                                    <button
                                                        onClick={() => handleOpenEdit(emp)}
                                                        className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg transition"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit2 className="w-4 h-4"/>
                                                    </button>
                                                )}

                                                {/* Nút Xóa - Có thể giữ hoặc ẩn nếu không muốn xóa tài khoản inactive */}
                                                <button
                                                    onClick={() => handleDelete(emp.id)}
                                                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                                                    title="Xóa người dùng"
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {!loading && employees.length === 0 && (
                                <div className="text-center py-16 text-gray-500 font-medium">
                                    Không tìm thấy người dùng
                                </div>
                            )}
                        </div>

                        {/* PAGINATION */}
                        {!loading && totalElements > 0 && (
                            <div
                                className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-700">
                                        Hiển thị <span className="font-medium">{startIndex}</span> đến{' '}
                                        <span className="font-medium">{endIndex}</span> trong tổng số{' '}
                                        <span className="font-medium">{totalElements}</span> người dùng
                                    </span>

                                    <select
                                        value={pageSize}
                                        onChange={handlePageSizeChange}
                                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 outline-none"
                                    >
                                    <option value={5}>5 / trang</option>
                                        <option value={10}>10 / trang</option>
                                        <option value={20}>20 / trang</option>
                                        <option value={50}>50 / trang</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* First Page Button */}
                                    <button
                                        onClick={handleFirstPage}
                                        disabled={currentPage === 0}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        title="Trang đầu"
                                    >
                                        <ChevronsLeft className="w-5 h-5" />
                                    </button>

                                    {/* Previous Page Button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        title="Trang trước"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="flex gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i)
                                            .filter(page => {
                                                // Hiển thị: trang đầu, trang cuối, trang hiện tại và 2 trang xung quanh
                                                return (
                                                    page === 0 ||
                                                    page === totalPages - 1 ||
                                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                                );
                                            })
                                            .map((page, idx, arr) => (
                                                <React.Fragment key={page}>
                                                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                                                        <span className="px-3 py-2 text-gray-500">...</span>
                                                    )}
                                                    <button
                                                        onClick={() => handlePageChange(page)}
                                                        className={`px-4 py-2 rounded-lg font-medium transition ${
                                                            currentPage === page
                                                                ? 'bg-lime-600 text-white'
                                                                : 'border border-gray-300 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        {page + 1}
                                                    </button>
                                                </React.Fragment>
                                            ))}
                                    </div>

                                    {/* Next Page Button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages - 1}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        title="Trang sau"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    {/* Last Page Button */}
                                    <button
                                        onClick={handleLastPage}
                                        disabled={currentPage === totalPages - 1}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        title="Trang cuối"
                                    >
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
