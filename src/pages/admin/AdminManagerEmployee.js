import React, { useEffect, useState } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, UserCheck } from 'lucide-react';
import Sidebar from "../../components/Admin/Sidebar";
import EmployeeFormModal from "../../components/Admin/EmployeeFormModal";
import EmployeeDetailModal from "../../components/Admin/EmployeeDetailModal";
import axiosInstance from "../../config/axiosConfig";

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    /* ================= FETCH USERS ================= */
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/users");

            const mappedUsers = response.data.data.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                position: mapRole(user.role),
                status: mapStatus(user.status),
            }));

            setEmployees(mappedUsers);
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

    /* ================= FILTER ================= */
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch =
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            filterStatus === 'all' || emp.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

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

    const handleFormSubmit = () => {
        setShowFormModal(false);
        fetchUsers(); // reload lại danh sách sau khi add/edit
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xác nhận xóa người dùng này?")) return;

        try {
            // nếu backend có endpoint delete thì dùng
            // await axiosInstance.delete(`/users/${id}`);
            setEmployees(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            alert("Không thể xóa người dùng!");
        }
    };

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
                                            Đang tải danh sách người dùng...
                                        </td>
                                    </tr>
                                )}

                                {!loading && filteredEmployees.map(emp => (
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
                                                <button onClick={() => handleView(emp)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenEdit(emp)} className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(emp.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {!loading && filteredEmployees.length === 0 && (
                                <div className="text-center py-16 text-gray-500 font-medium">
                                    Không tìm thấy người dùng
                                </div>
                            )}
                        </div>
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
