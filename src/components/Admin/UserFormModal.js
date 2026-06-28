// src/components/Admin/UserFormModal.js
import React from 'react';
import { X } from 'lucide-react';

const UserFormModal = ({ isOpen, onClose, mode, user, onSubmit }) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            name: e.target.name.value.trim(),
            email: e.target.email.value.trim(),
            phone: e.target.phone.value.trim(),
            status: e.target.status.value,
            createdDate: e.target.createdDate.value,
        };
        onSubmit(formData);
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-screen overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {mode === 'add' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Họ tên *</label>
                        <input required name="name" type="text" defaultValue={user?.name || ''}
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                        <input required name="email" type="email" defaultValue={user?.email || ''}
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại *</label>
                        <input required name="phone" type="tel" defaultValue={user?.phone || ''}
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày tạo</label>
                        <input
                            name="createdDate"
                            type="date"
                            defaultValue={mode === 'add' ? today : user?.createdDate || today}
                            disabled={mode === 'edit'}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
                        <select name="status" defaultValue={user?.status || 'active'}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Ngưng hoạt động</option>
                        </select>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="button" onClick={onClose}
                                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                            Hủy
                        </button>
                        <button type="submit"
                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition shadow-md">
                            {mode === 'add' ? 'Thêm mới' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;
