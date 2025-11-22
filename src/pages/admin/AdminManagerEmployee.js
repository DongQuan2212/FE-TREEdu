import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, X } from 'lucide-react';
import Sidebar from "../../components/Admin/sidebar";
import '../../styles/admin/EmployeeManagement.css';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([
        { id: 1, name: 'Nguyễn Văn A', position: 'Quản lý Quizz', status: 'active', email: 'vana@tredu.com', phone: '0901234567' },
        { id: 2, name: 'Trần Thị B', position: 'Quản lý Quizz', status: 'active', email: 'thib@tredu.com', phone: '0902234567' },
        { id: 3, name: 'Lê Văn C', position: 'Quản lý Flashcard', status: 'inactive', email: 'vanc@tredu.com', phone: '0903234567' },
        { id: 4, name: 'Phạm Thị D', position: 'Hỗ trợ khách hàng', status: 'active', email: 'thid@tredu.com', phone: '0904234567' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        status: 'active',
        email: '',
        phone: ''
    });

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.position.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleAdd = () => {
        setModalMode('add');
        setFormData({ name: '', position: '', status: 'active', email: '', phone: '' });
        setShowModal(true);
    };

    const handleEdit = (employee) => {
        setModalMode('edit');
        setSelectedEmployee(employee);
        setFormData(employee);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
            setEmployees(employees.filter(emp => emp.id !== id));
        }
    };

    const handleViewDetail = (employee) => {
        setSelectedEmployee(employee);
        setShowDetailModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalMode === 'add') {
            const newEmployee = {
                ...formData,
                id: Math.max(...employees.map(e => e.id)) + 1
            };
            setEmployees([...employees, newEmployee]);
        } else {
            setEmployees(employees.map(emp =>
                emp.id === selectedEmployee.id ? { ...formData, id: emp.id } : emp
            ));
        }
        setShowModal(false);
    };

    return (
        <div className="admin-wrapper">
            <Sidebar />
            <div className="admin-content">
                <div className="employee-management">
                    <div className="employee-container">
                        {/* Header */}
                        <div className="employee-header">
                            <h1 className="employee-title">Quản lý nhân viên</h1>
                            <p className="employee-subtitle">Quản lý thông tin và trạng thái nhân viên</p>
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="employee-toolbar">
                            <div className="toolbar-content">
                                {/* Search */}
                                <div className="search-wrapper">
                                    <Search size={20} className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm nhân viên..."
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
                                    Thêm nhân viên
                                </button>
                            </div>
                        </div>

                        {/* Employee Table */}
                        <div className="employee-table-wrapper">
                            <table className="employee-table">
                                <thead>
                                <tr>
                                    <th>Tên nhân viên</th>
                                    <th>Chức vụ</th>
                                    <th>Trạng thái</th>
                                    <th className="text-center">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredEmployees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td className="employee-name">{employee.name}</td>
                                        <td className="employee-position">{employee.position}</td>
                                        <td>
                    <span className={`status-badge ${employee.status}`}>
                      {employee.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                    </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleViewDetail(employee)}
                                                    className="btn-action btn-view"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(employee)}
                                                    className="btn-action btn-edit"
                                                    title="Sửa"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee.id)}
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

                            {filteredEmployees.length === 0 && (
                                <div className="empty-state">
                                    Không tìm thấy nhân viên nào
                                </div>
                            )}
                        </div>

                        {/* Add/Edit Modal */}
                        {showModal && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h2 className="modal-title">
                                            {modalMode === 'add' ? 'Thêm nhân viên mới' : 'Chỉnh sửa nhân viên'}
                                        </h2>
                                        <button onClick={() => setShowModal(false)} className="btn-close">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label className="form-label">Tên nhân viên *</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Chức vụ *</label>
                                            <input
                                                type="text"
                                                value={formData.position}
                                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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
                        {showDetailModal && selectedEmployee && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h2 className="modal-title">Chi tiết nhân viên</h2>
                                        <button onClick={() => setShowDetailModal(false)} className="btn-close">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="modal-body">
                                        <div className="detail-group">
                                            <div className="detail-label">Tên nhân viên</div>
                                            <div className="detail-value">{selectedEmployee.name}</div>
                                        </div>
                                        <div className="detail-group">
                                            <div className="detail-label">Chức vụ</div>
                                            <div className="detail-value">{selectedEmployee.position}</div>
                                        </div>
                                        <div className="detail-group">
                                            <div className="detail-label">Email</div>
                                            <div className="detail-value">{selectedEmployee.email}</div>
                                        </div>
                                        <div className="detail-group">
                                            <div className="detail-label">Số điện thoại</div>
                                            <div className="detail-value">{selectedEmployee.phone}</div>
                                        </div>
                                        <div className="detail-group">
                                            <div className="detail-label">Trạng thái</div>
                                            <span className={`status-badge ${selectedEmployee.status}`}>
                    {selectedEmployee.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
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

                export default EmployeeManagement;
