import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, X } from 'lucide-react';
import Sidebar from "../../components/Admin/sidebar";
import '../../styles/admin/UserManagement.css';

const AdminManagerUser = () => {
    const [users, setUsers] = useState([
        { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', phone: '0901234567', status: 'active', createdDate: '2024-01-15' },
        { id: 2, name: 'Trần Thị B', email: 'tranthib@gmail.com', phone: '0902234567', status: 'active', createdDate: '2024-02-20' },
        { id: 3, name: 'Lê Văn C', email: 'levanc@gmail.com', phone: '0903234567', status: 'inactive', createdDate: '2024-03-10' },
        { id: 4, name: 'Phạm Thị D', email: 'phamthid@gmail.com', phone: '0904234567', status: 'active', createdDate: '2024-04-05' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        status: 'active',
        createdDate: ''
    });

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleAdd = () => {
        setModalMode('add');
        const today = new Date().toISOString().split('T')[0];
        setFormData({ name: '', email: '', phone: '', status: 'active', createdDate: today });
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        setFormData(user);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            setUsers(users.filter(user => user.id !== id));
        }
    };

    const handleViewDetail = (user) => {
        setSelectedUser(user);
        setShowDetailModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalMode === 'add') {
            const newUser = {
                ...formData,
                id: Math.max(...users.map(u => u.id)) + 1
            };
            setUsers([...users, newUser]);
        } else {
            setUsers(users.map(user =>
                user.id === selectedUser.id ? { ...formData, id: user.id } : user
            ));
        }
        setShowModal(false);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="admin-wrapper">
            <Sidebar />
            <div className="admin-content">
                <div className="user-management">
                    <div className="user-container">
                        {/* Header */}
                        <div className="user-header">
                            <h1 className="user-title">Quản lý người dùng</h1>
                            <p className="user-subtitle">Quản lý tài khoản và thông tin người dùng</p>
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="user-toolbar">
                            <div className="toolbar-content">
                                {/* Search */}
                                <div className="search-wrapper">
                                    <Search size={20} className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm người dùng..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                </div>

                                {/* Filter */}
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="active">Đang hoạt động</option>
                                    <option value="inactive">Ngưng hoạt động</option>
                                </select>

                                {/* Add Button */}
                                <button onClick={handleAdd} className="btn-add">
                                    <Plus size={18} />
                                    Thêm người dùng
                                </button>
                            </div>
                        </div>

                        {/* User Table */}
                        <div className="user-table-wrapper">
                            <table className="user-table">
                                <thead>
                                <tr>
                                    <th>Tên người dùng</th>
                                    <th>Email</th>
                                    <th>Trạng thái</th>
                                    <th className="text-center">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="user-name">{user.name}</td>
                                        <td className="user-email">{user.email}</td>
                                        <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                        </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleViewDetail(user)}
                                                    className="btn-action btn-view"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="btn-action btn-edit"
                                                    title="Sửa"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="btn-action btn-delete"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {filteredUsers.length === 0 && (
                                <div className="empty-state">
                                    Không tìm thấy người dùng nào
                                </div>
                            )}
                        </div>

                        {/* Add/Edit Modal */}
                        {showModal && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h2 className="modal-title">
                                            {modalMode === 'add' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
                                        </h2>
                                        <button onClick={() => setShowModal(false)} className="btn-close">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label className="form-label">Tên người dùng *</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Email *</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Số điện thoại *</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Ngày tạo *</label>
                                            <input
                                                type="date"
                                                value={formData.createdDate}
                                                onChange={(e) => setFormData({ ...formData, createdDate: e.target.value })}
                                                required
                                                className="form-input"
                                                disabled={modalMode === 'edit'}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Trạng thái *</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="form-input"
                                            >
                                                <option value="active">Đang hoạt động</option>
                                                <option value="inactive">Ngưng hoạt động</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button onClick={() => setShowModal(false)} className="btn-cancel">
                                            Hủy
                                        </button>
                                        <button onClick={handleSubmit} className="btn-submit">
                                            {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detail Modal */}
                        {showDetailModal && selectedUser && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h2 className="modal-title">Chi tiết người dùng</h2>
                                        <button onClick={() => setShowDetailModal(false)} className="btn-close">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="modal-body">
                                        <div className="detail-group">
                                            <div className="detail-label">Tên người dùng</div>
                                            <div className="detail-value">{selectedUser.name}</div>
                                        </div>
                                        <div className="detail-group">
                                            <div className="detail-label">Email</div>
                                            <div className="detail-value">{selectedUser.email}</div>
                                        </div>
                                        <div className="detail-group">
                                            <div className="detail-label">Số điện thoại</div>
                                            <div className="detail-value">{selectedUser.phone}</div>
                                        </div>
                                        <div className="detail-group">
                                            <div className="detail-label">Ngày tạo</div>
                                            <div className="detail-value">{formatDate(selectedUser.createdDate)}</div>
                                        </div>
                                        <div className="detail-group">
                                            <div className="detail-label">Trạng thái</div>
                                            <span className={`status-badge ${selectedUser.status}`}>
                        {selectedUser.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                      </span>
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button onClick={() => setShowDetailModal(false)} className="btn-close-detail">
                                            Đóng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminManagerUser;
