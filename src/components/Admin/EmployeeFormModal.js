// components/Admin/EmployeeFormModal.js
import React from 'react';
import { X } from 'lucide-react';

const EmployeeFormModal = ({ isOpen, onClose, mode, employee, onSubmit }) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            name: e.target.name.value,
            position: e.target.position.value,
            email: e.target.email.value,
            phone: e.target.phone.value,
            status: e.target.status.value,
        };
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">
                        {mode === 'add' ? 'Thêm nhân viên mới' : 'Chỉnh sửa nhân viên'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên *</label>
                        <input required name="name" type="text" defaultValue={employee?.name || ''}
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chức vụ *</label>
                        <input required name="position" type="text" defaultValue={employee?.position || ''}
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input required name="email" type="email" defaultValue={employee?.email || ''}
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                        <input required name="phone" type="tel" defaultValue={employee?.phone || ''}
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                        <select name="status" defaultValue={employee?.status || 'active'}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none">
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Ngưng hoạt động</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose}
                                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
                            Hủy
                        </button>
                        <button type="submit"
                                className="flex-1 py-3 bg-lime-600 hover:bg-lime-700 text-white rounded-lg font-medium transition">
                            {mode === 'add' ? 'Thêm mới' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeFormModal;
