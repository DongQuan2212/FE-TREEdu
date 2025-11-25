// src/components/Admin/UserDetailModal.js
import React from 'react';
import { X } from 'lucide-react';

const UserDetailModal = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Chi tiết người dùng</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-sm text-gray-500">Họ tên</p>
                        <p className="text-lg font-bold text-gray-900">{user.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-lg text-gray-700">{user.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Số điện thoại</p>
                        <p className="text-lg text-gray-700">{user.phone}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Ngày tạo</p>
                        <p className="text-lg text-gray-700">{formatDate(user.createdDate)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Trạng thái</p>
                        <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium mt-2 ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
              {user.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
            </span>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200">
                    <button onClick={onClose}
                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
