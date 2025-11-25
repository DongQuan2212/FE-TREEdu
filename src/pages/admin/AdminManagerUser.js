// src/pages/admin/AdminManagerUser.js
import React, { useState } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, Users } from 'lucide-react';
import Sidebar from "../../components/Admin/Sidebar";
import UserFormModal from "../../components/Admin/UserFormModal";
import UserDetailModal from "../../components/Admin/UserDetailModal";

const AdminManagerUser = () => {
    const [users, setUsers] = useState([
        { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', phone: '0901234567', status: 'active', createdDate: '2024-01-15' },
        { id: 2, name: 'Trần Thị B', email: 'tranthib@gmail.com', phone: '0902234567', status: 'active', createdDate: '2024-02-20' },
        { id: 3, name: 'Lê Văn C', email: 'levanc@gmail.com', phone: '0903234567', status: 'inactive', createdDate: '2024-03-10' },
        { id: 4, name: 'Phạm Thị D', email: 'phamthid@gmail.com', phone: '0904234567', status: 'active', createdDate: '2024-04-05' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedUser, setSelectedUser] = useState(null);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleOpenAdd = () => {
        setModalMode('add');
        setSelectedUser(null);
        setShowFormModal(true);
    };

    const handleOpenEdit = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        setShowFormModal(true);
    };

    const handleView = (user) => {
        setSelectedUser(user);
        setShowDetailModal(true);
    };

    const handleFormSubmit = (formData) => {
        if (modalMode === 'add') {
            const newUser = {
                ...formData,
                id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1
            };
            setUsers(prev => [...prev, newUser]);
        } else {
            setUsers(prev => prev.map(u =>
                u.id === selectedUser.id ? { ...formData, id: u.id } : u
            ));
        }
        setShowFormModal(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Xác nhận xóa người dùng này?')) {
            setUsers(prev => prev.filter(u => u.id !== id));
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <Users className="w-8 h-8 text-purple-600" />
                                Quản lý người dùng
                            </h1>
                            <p className="text-gray-600 mt-1">Quản lý tài khoản khách hàng và trạng thái hoạt động</p>
                        </div>
                        <button onClick={handleOpenAdd}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg font-medium flex items-center gap-2 transition">
                            <Plus className="w-5 h-5" /> Thêm người dùng
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
                                    placeholder="Tìm kiếm tên, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
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
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Số điện thoại</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày tạo</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatDate(user.createdDate)}</td>
                                        <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {user.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-3">
                                                <button onClick={() => handleView(user)} className="p-2.5 hover:bg-blue-50 rounded-lg text-blue-600 transition">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenEdit(user)} className="p-2.5 hover:bg-yellow-50 rounded-lg text-yellow-600 transition">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2.5 hover:bg-red-50 rounded-lg text-red-600 transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-16 text-gray-500 font-medium">
                                    Không tìm thấy người dùng nào
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Chỉ 2 dòng này là đủ! */}
                <UserFormModal
                    isOpen={showFormModal}
                    onClose={() => setShowFormModal(false)}
                    mode={modalMode}
                    user={selectedUser}
                    onSubmit={handleFormSubmit}
                />

                <UserDetailModal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    user={selectedUser}
                />
            </div>
        </div>
    );
};

export default AdminManagerUser;
