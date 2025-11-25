// components/Admin/EmployeeDetailModal.js
import React from 'react';
import { X } from 'lucide-react';

const EmployeeDetailModal = ({ isOpen, onClose, employee }) => {
    if (!isOpen || !employee) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Chi tiết nhân viên</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <p className="text-sm text-gray-600">Họ tên</p>
                        <p className="text-lg font-semibold text-gray-900">{employee.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Chức vụ</p>
                        <p className="text-lg font-semibold text-gray-900">{employee.position}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-lg font-medium text-gray-900">{employee.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Số điện thoại</p>
                        <p className="text-lg font-medium text-gray-900">{employee.phone}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Trạng thái</p>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                            employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {employee.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                        </span>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200">
                    <button onClick={onClose}
                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetailModal;
