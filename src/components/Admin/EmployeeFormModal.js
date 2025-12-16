import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

const EmployeeFormModal = ({ isOpen, onClose, mode, employee, onSubmit }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: employee?.name || '',
        email: employee?.email || '',
        password: '',
        status: employee?.status || 'active'
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (mode === 'add') {

            onSubmit({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
            });
        } else {

            onSubmit({
                fullName: formData.fullName,
                email: formData.email,
                status: formData.status,
            });
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">
                        {mode === 'add' ? 'Thêm nhân viên hỗ trợ mới' : 'Chỉnh sửa nhân viên'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        type="button"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Họ tên */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Nhập họ và tên"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="example@gmail.com"
                            disabled={mode === 'edit'}
                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none ${
                                mode === 'edit' ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                        />
                    </div>

                    {/* Password - chỉ hiện khi thêm mới */}
                    {mode === 'add' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    required
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mật khẩu"
                                    minLength={6}
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Mật khẩu tối thiểu 6 ký tự</p>
                        </div>
                    )}

                    {/* Loại tài khoản - chỉ hiện info khi thêm mới */}
                    {mode === 'add' && (
                        <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">Loại tài khoản:</span> Nhân viên hỗ trợ (SUPPORTER)
                            </p>
                        </div>
                    )}

                    {/* Trạng thái - chỉ hiện khi edit */}
                    {mode === 'edit' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none"
                            >
                                <option value="active">Đang hoạt động</option>
                                <option value="inactive">Ngưng hoạt động</option>
                            </select>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="flex-1 py-3 bg-lime-600 hover:bg-lime-700 text-white rounded-lg font-medium transition"
                        >
                            {mode === 'add' ? 'Thêm nhân viên' : 'Cập nhật'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeFormModal;
