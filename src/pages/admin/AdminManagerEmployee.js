import React, { useState } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, UserCheck } from 'lucide-react';
import Sidebar from "../../components/Admin/Sidebar";
import EmployeeFormModal from "../../components/Admin/EmployeeFormModal";
import EmployeeDetailModal from "../../components/Admin/EmployeeDetailModal";
const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([
        { id: 1, name: 'Nguyễn Văn A', position: 'Quản lý Quizz', status: 'active', email: 'vana@tredu.com', phone: '0901234567' },
        { id: 2, name: 'Trần Thị B', position: 'Quản lý Quizz', status: 'active', email: 'thib@tredu.com', phone: '0902234567' },
        { id: 3, name: 'Lê Văn C', position: 'Quản lý Flashcard', status: 'inactive', email: 'vanc@tredu.com', phone: '0903234567' },
        { id: 4, name: 'Phạm Thị D', position: 'Hỗ trợ khách hàng', status: 'active', email: 'thid@tredu.com', phone: '0904234567' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

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

    const handleFormSubmit = (formData) => {
        if (modalMode === 'add') {
            const newEmp = {
                ...formData,
                id: employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1
            };
            setEmployees(prev => [...prev, newEmp]);
        } else {
            setEmployees(prev => prev.map(e =>
                e.id === selectedEmployee.id ? { ...formData, id: e.id } : e
            ));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Xác nhận xóa nhân viên này?')) {
            setEmployees(prev => prev.filter(e => e.id !== id));
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <UserCheck className="w-8 h-8 text-lime-600" />
                                Quản lý nhân viên
                            </h1>
                            <p className="text-gray-600 mt-1">Quản lý thông tin và phân quyền nhân viên hệ thống</p>
                        </div>
                        <button onClick={handleOpenAdd} className="bg-lime-600 hover:bg-lime-700 text-white px-5 py-3 rounded-lg font-medium flex items-center gap-2 transition">
                            <Plus className="w-5 h-5" /> Thêm nhân viên
                        </button>
                    </div>
                </header>
                <main className="p-6 max-w-7xl mx-auto space-y-6">
                    {/* Search & Filter */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tên, chức vụ, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none"
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
                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên nhân viên</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Chức vụ</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">{emp.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{emp.position}</td>
                                        <td className="px-6 py-4 text-gray-600">{emp.email}</td>
                                        <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                                    emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {emp.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-3">
                                                <button onClick={() => handleView(emp)} className="p-2.5 hover:bg-blue-50 rounded-lg text-blue-600 transition">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenEdit(emp)} className="p-2.5 hover:bg-yellow-50 rounded-lg text-yellow-600 transition">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(emp.id)} className="p-2.5 hover:bg-red-50 rounded-lg text-red-600 transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {filteredEmployees.length === 0 && (
                                <div className="text-center py-16 text-gray-500 font-medium">
                                    Không tìm thấy nhân viên nào
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Chỉ 2 dòng này là đủ cho toàn bộ modal! */}
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
