// src/components/Admin/EmployeeFormModal.js
import React, { useEffect, useState } from 'react';
import { X, Save, User, Mail, Lock, Shield } from 'lucide-react';

const EmployeeFormModal = ({ isOpen, onClose, mode, employee, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'Member' // Giá trị mặc định
    });

    // Reset form khi mở modal
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && employee) {
                setFormData({
                    fullName: employee.name || '',
                    email: employee.email || '',
                    password: '', // Không hiển thị password cũ
                    // Lấy role gốc từ API (cần đảm bảo API trả về rawRole ví dụ: "Admin", "Supporter", "Member")
                    role: employee.rawRole || 'Member'
                });
            } else {
                // Mode Add
                setFormData({
                    fullName: '',
                    email: '',
                    password: '',
                    role: 'Supporter' // Mặc định khi thêm mới là Supporter
                });
            }
        }
    }, [isOpen, mode, employee]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">
                        {mode === 'add' ? 'Thêm nhân viên mới' : 'Cập nhật thông tin'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* 1. Full Name */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <User className="w-4 h-4 text-lime-600" />
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Nhập họ tên đầy đủ"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition"
                        />
                    </div>

                    {/* 2. Email (Read-only khi Edit) */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-lime-600" />
                            Email đăng nhập
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            disabled={mode === 'edit'} // Không cho sửa email khi edit
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@domain.com"
                            className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none transition ${
                                mode === 'edit' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-lime-500'
                            }`}
                        />
                    </div>

                    {/* 3. Password (Chỉ hiện khi Add) */}
                    {mode === 'add' && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-lime-600" />
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-lime-500 outline-none transition"
                            />
                        </div>
                    )}

                    {/* 4. Role Selection (QUAN TRỌNG: Để chuyển Member <-> Supporter) */}
                    {mode === 'edit' && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-lime-600" />
                                Vai trò hệ thống
                            </label>
                            <div className="relative">
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-lime-500 outline-none appearance-none bg-white cursor-pointer"
                                >
                                    <option value="Member">Thành viên (Member)</option>
                                    <option value="Supporter">Nhân viên hỗ trợ (Supporter)</option>
                                    <option value="Admin">Quản trị viên (Admin)</option>
                                </select>
                                {/* Custom arrow icon */}
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                *Thay đổi vai trò sẽ cập nhật quyền truy cập ngay lập tức.
                            </p>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-lime-600 text-white rounded-lg hover:bg-lime-700 font-medium shadow-sm active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {mode === 'add' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeFormModal;
