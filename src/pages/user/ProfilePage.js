import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import { useAuth } from "../../hook/useAuth";

import {
    User, Mail, Shield, Edit2, Lock, X, Check,
    Phone, Calendar, MapPin, Flame, Zap, Award, BookOpen, Upload
} from "lucide-react";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { refetchUser } = useAuth();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        fullname: "", phoneNumber: "", birthYear: "",
        address: "", gender: "MALE", avatarUrl: ""
    });

    const fetchCurrentUser = async () => {
        try {
            setLoading(true);
            const [authRes, meRes] = await Promise.all([
                axiosInstance.post("/auth/current-user"),
                axiosInstance.get("/users/me")
            ]);
            const authData = authRes.data.data;
            const meData = meRes.data?.data || meRes.data;

            const fullUser = { ...meData, role: authData.role };
            setUser(fullUser);

            setFormData({
                fullname: fullUser.fullName || "",
                phoneNumber: fullUser.phoneNumber || "",
                birthYear: fullUser.birthYear || "",
                address: fullUser.address || "",
                gender: fullUser.gender || "MALE",
                avatarUrl: fullUser.avatarUrl || ""
            });
        } catch (err) {
            console.error("Fetch profile error:", err);
            setError("Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCurrentUser(); }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "birthYear" ? (value ? parseInt(value, 10) : "") : value
        });
    };

    const handleAvatarFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh hợp lệ!');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước ảnh không được vượt quá 5MB!');
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatarPreview(event.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setAvatarFile(null);
        setAvatarPreview("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setFormData({
            fullname: user.fullName || "",
            phoneNumber: user.phoneNumber || "",
            birthYear: user.birthYear || "",
            address: user.address || "",
            gender: user.gender || "MALE",
            avatarUrl: user.avatarUrl || ""
        });
    };

    const handleSaveProfile = async () => {
        if (!formData.fullname.trim()) {
            alert("Họ và tên không được để trống!");
            return;
        }

        setSaving(true);
        try {
            const formDataSubmit = new FormData();
            formDataSubmit.append('fullname', formData.fullname.trim());
            formDataSubmit.append('phoneNumber', formData.phoneNumber ? formData.phoneNumber.trim() : '');
            formDataSubmit.append('birthYear', formData.birthYear || '');
            formDataSubmit.append('address', formData.address ? formData.address.trim() : '');
            formDataSubmit.append('gender', formData.gender);

            if (avatarFile) {
                formDataSubmit.append('avatarFile', avatarFile);
            }

            const response = await axiosInstance.put(`/users/update-my-profile/${user.id}`, formDataSubmit, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const updatedData = response.data.data;

            setUser({ ...user, ...updatedData });
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview("");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            if (refetchUser) {
                await refetchUser();
            }
            alert("Cập nhật hồ sơ thành công!");
        } catch (err) {
            console.error("Update profile error:", err);
            alert("Không thể cập nhật hồ sơ. Vui lòng kiểm tra dữ liệu thử lại!");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = () => navigate("/change-password");

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
            <div className="text-center">
                <div className="w-9 h-9 border-2 border-[#e0e0e0] border-t-[#3d7a5c] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#888] text-sm">Đang tải hồ sơ…</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
            <div className="bg-white border border-[#ebebeb] rounded-[20px] p-8 text-center max-w-[380px]">
                <p className="text-[#c0392b] text-sm mb-5">{error}</p>
                <button
                    className="text-[13px] font-medium text-white bg-[#1c1c1c] rounded-xl px-5 py-[11px] hover:bg-[#333] transition-all"
                    onClick={() => navigate("/login")}
                >
                    Đăng nhập lại
                </button>
            </div>
        </div>
    );

    const xpProgress = user.progressPercentage !== undefined ? user.progressPercentage : 0;
    const genderLabel = user.gender === "MALE" ? "Nam" : user.gender === "FEMALE" ? "Nữ" : "Khác";
    const initials = (user.fullName || "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

    return (
        <div className="min-h-screen bg-[#fafaf8] flex flex-col text-neutral-800">
            <Header />

            <main className="flex-1 max-w-[1000px] w-full mx-auto px-5 pt-10 pb-20 mt-[88px]">
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5">

                    {/* ═══════════ CỘT TRÁI: GAMIFICATION CARD ═══════════ */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-white border border-[#ebebeb] rounded-[20px] p-7 text-center">
                            <div className="w-[88px] h-[88px] rounded-full bg-[#f3f4f0] border border-[#e8e8e4] mx-auto mb-4 flex items-center justify-center overflow-hidden shrink-0">
                                {user.avatarUrl
                                    ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    : <span className="text-[26px] font-medium text-[#777] tracking-wider">{initials}</span>
                                }
                            </div>

                            <div className="text-xl font-medium text-[#1a1a1a] leading-snug">
                                {user.fullName || "Học viên TREEdu"}
                            </div>
                            <span className="text-[11px] font-semibold tracking-wide text-[#2d6a4f] bg-[#eaf4ee] px-3 py-1 rounded-full inline-block mt-1">
                                {formatRole(user.role)}
                            </span>

                            <div className="mt-6 pt-5 border-t border-[#f0f0ee] text-left">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-semibold text-[#555] flex items-center gap-1.5">
                                        <Award size={13} color="#b98c2a" />
                                        Cấp {user.level || 1}
                                    </span>
                                    <span className="text-xs text-[#aaa] font-medium">{user.xp || 0} XP</span>
                                </div>
                                <div className="h-1 rounded-sm bg-[#ebebeb] overflow-hidden">
                                    <div className="h-full bg-[#3d7a5c] rounded-sm transition-all duration-700 ease-out" style={{ width: `${xpProgress}%` }}></div>
                                </div>
                                <p className="text-[11px] text-[#bbb] mt-1.5 text-right font-medium">
                                    {user.xpNeededForNextLevel !== undefined ? user.xpNeededForNextLevel : 0} XP để lên cấp
                                </p>
                            </div>
                        </div>

                        {/* Hệ thống Dashboard Stat */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <StatCard icon={<Flame size={15} />} iconColor="#e8773a" iconBg="#fff3ec"
                                      label="Streak" value={`${user.streakCount || 0} ngày`} valueColor="#e8773a" />
                            <StatCard icon={<Zap size={15} />} iconColor="#c9960d" iconBg="#fef9ec"
                                      label="Kỷ lục" value={`${user.longestStreak || 0} ngày`} valueColor="#c9960d" />
                            <StatCard icon={<Check size={15} />} iconColor="#2d6a4f" iconBg="#eaf4ee"
                                      label="Bài quiz" value={user.totalQuizCompleted || 0} valueColor="#2d6a4f" />
                            <StatCard icon={<BookOpen size={15} />} iconColor="#2453a8" iconBg="#eaf1fb"
                                      label="Flashcard" value={user.totalFlashcardLearned || 0} valueColor="#2453a8" />
                        </div>
                    </div>

                    {/* ═══════════ CỘT PHẢI: FORM CHỈNH SỬA & HIỂN THỊ CHI TIẾT ═══════════ */}
                    <div className="bg-white border border-[#ebebeb] rounded-[20px] flex flex-col">
                        <div className="px-7 py-[22px] pb-[18px] border-b border-[#f0f0ee] flex justify-between items-center">
                            <span className="text-lg font-semibold text-[#1a1a1a]">Thông tin tài khoản</span>
                            {!isEditing && (
                                <button
                                    className="text-xs font-medium text-[#555] bg-transparent border border-[#ddd] rounded-xl px-3.5 py-1.5 flex items-center gap-1.5 hover:bg-[#f5f5f3] hover:border-[#bbb] transition-all"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Edit2 size={13} /> Chỉnh sửa
                                </button>
                            )}
                        </div>

                        <div className="px-7 py-6 flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-6 mb-5">
                                <ReadField icon={<Mail size={14} color="#aaa" />} label="Email" value={user.email} />
                                <ReadField icon={<Shield size={14} color="#aaa" />} label="Vai trò" value={formatRole(user.role)} />
                            </div>

                            <div className="h-[1px] bg-[#f0f0ee] my-1 mb-5"></div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-[18px] gap-x-6">
                                {/* Họ và tên */}
                                <div>
                                    <label className="text-[11px] font-semibold tracking-wider uppercase text-[#aaa] mb-1.5 block">Họ và tên</label>
                                    {isEditing
                                        ? <input className="w-full text-sm text-[#1a1a1a] bg-[#fafaf8] border border-[#ddd] rounded-[10px] px-3.5 py-2.5 outline-none focus:border-[#3d7a5c] focus:bg-white transition-colors" type="text" name="fullname" value={formData.fullname} onChange={handleInputChange} />
                                        : <div className="flex items-center gap-2 text-sm text-[#1a1a1a] py-1.5"><User size={14} color="#ccc" />{user.fullName || <Blank />}</div>
                                    }
                                </div>

                                {/* Số điện thoại */}
                                <div>
                                    <label className="text-[11px] font-semibold tracking-wider uppercase text-[#aaa] mb-1.5 block">Số điện thoại</label>
                                    {isEditing
                                        ? <input className="w-full text-sm text-[#1a1a1a] bg-[#fafaf8] border border-[#ddd] rounded-[10px] px-3.5 py-2.5 outline-none focus:border-[#3d7a5c] focus:bg-white transition-colors" type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="0912 345 678" />
                                        : <div className="flex items-center gap-2 text-sm text-[#1a1a1a] py-1.5"><Phone size={14} color="#ccc" />{user.phoneNumber || <Blank />}</div>
                                    }
                                </div>

                                {/* Năm sinh */}
                                <div>
                                    <label className="text-[11px] font-semibold tracking-wider uppercase text-[#aaa] mb-1.5 block">Năm sinh</label>
                                    {isEditing
                                        ? <input className="w-full text-sm text-[#1a1a1a] bg-[#fafaf8] border border-[#ddd] rounded-[10px] px-3.5 py-2.5 outline-none focus:border-[#3d7a5c] focus:bg-white transition-colors" type="number" name="birthYear" value={formData.birthYear} onChange={handleInputChange} placeholder="2000" />
                                        : <div className="flex items-center gap-2 text-sm text-[#1a1a1a] py-1.5"><Calendar size={14} color="#ccc" />{user.birthYear || <Blank />}</div>
                                    }
                                </div>

                                {/* Giới tính */}
                                <div>
                                    <label className="text-[11px] font-semibold tracking-wider uppercase text-[#aaa] mb-1.5 block">Giới tính</label>
                                    {isEditing
                                        ? <select className="w-full text-sm text-[#1a1a1a] bg-[#fafaf8] border border-[#ddd] rounded-[10px] px-3.5 py-2.5 outline-none focus:border-[#3d7a5c] focus:bg-white transition-colors appearance-none" name="gender" value={formData.gender} onChange={handleInputChange}>
                                            <option value="MALE">Nam</option>
                                            <option value="FEMALE">Nữ</option>
                                            <option value="OTHER">Khác</option>
                                        </select>
                                        : <div className="flex items-center gap-2 text-sm text-[#1a1a1a] py-1.5"><User size={14} color="#ccc" />{genderLabel}</div>
                                    }
                                </div>

                                {/* Địa chỉ */}
                                <div className="sm:col-span-2">
                                    <label className="text-[11px] font-semibold tracking-wider uppercase text-[#aaa] mb-1.5 block">Địa chỉ thường trú</label>
                                    {isEditing
                                        ? <input className="w-full text-sm text-[#1a1a1a] bg-[#fafaf8] border border-[#ddd] rounded-[10px] px-3.5 py-2.5 outline-none focus:border-[#3d7a5c] focus:bg-white transition-colors" type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="TP. Hồ Chí Minh" />
                                        : <div className="flex items-center gap-2 text-sm text-[#1a1a1a] py-1.5"><MapPin size={14} color="#ccc" />{user.address || <Blank />}</div>
                                    }
                                </div>

                                {/* Chọn file ảnh */}
                                {isEditing && (
                                    <div className="sm:col-span-2">
                                        <label className="text-[11px] font-semibold tracking-wider uppercase text-[#aaa] mb-1.5 block">Ảnh đại diện</label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarFileChange}
                                            className="hidden"
                                        />
                                        {(avatarPreview || user.avatarUrl) && (
                                            <div className="relative mb-3">
                                                <img
                                                    src={avatarPreview || user.avatarUrl}
                                                    alt="Avatar preview"
                                                    className="w-full max-h-[200px] rounded-[10px] object-contain mb-2 border border-[#ddd]"
                                                />
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="text-[13px] font-medium text-white bg-[#3d7a5c] rounded-xl px-5 py-[11px] flex items-center gap-[7px] hover:bg-[#2d6a4f] transition-colors"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload size={14} /> {avatarPreview ? "Đổi ảnh" : "Chọn ảnh"}
                                            </button>
                                            {avatarFile && (
                                                <button
                                                    type="button"
                                                    className="text-[13px] font-medium text-[#555] bg-transparent border border-[#ddd] rounded-xl px-5 py-[11px] flex items-center gap-[7px] hover:bg-[#f5f5f3] transition-colors"
                                                    onClick={handleRemoveAvatar}
                                                >
                                                    <X size={14} /> Xóa
                                                </button>
                                            )}
                                        </div>
                                        {avatarFile && (
                                            <div className="text-xs text-[#666] font-medium bg-[#f9f9f7] px-2.5 py-2 rounded-lg mt-2">
                                                📎 {avatarFile.name} ({(avatarFile.size / 1024).toFixed(0)} KB)
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thanh công cụ tương tác dưới chân Card */}
                        <div className="px-7 py-4 border-t border-[#f0f0ee] flex gap-2.5 justify-end">
                            {isEditing ? (
                                <>
                                    <button
                                        className="text-[13px] font-medium text-[#555] bg-transparent border border-[#ddd] rounded-xl px-5 py-[11px] flex items-center gap-[7px] hover:bg-[#f5f5f3] hover:border-[#bbb] disabled:opacity-50 transition-colors"
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                    >
                                        <X size={14} /> Hủy
                                    </button>
                                    <button
                                        className="text-[13px] font-medium text-white bg-[#2d6a4f] rounded-xl px-5 py-[11px] flex items-center gap-[7px] hover:bg-[#245c43] disabled:opacity-50 transition-colors"
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                    >
                                        <Check size={14} /> {saving ? "Đang lưu…" : "Lưu thay đổi"}
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="text-[13px] font-medium text-[#555] bg-transparent border border-[#ddd] rounded-xl px-5 py-[11px] flex items-center gap-[7px] hover:bg-[#f5f5f3] hover:border-[#bbb] transition-colors"
                                    onClick={handleChangePassword}
                                >
                                    <Lock size={14} /> Đổi mật khẩu
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

/* ─── CÁC SUB-COMPONENTS HỖ TRỢ HIỂN THỊ GIAO DIỆN ─── */

const StatCard = ({ icon, iconColor, iconBg, label, value, valueColor }) => (
    <div className="flex flex-col gap-1 px-5 py-[18px] rounded-[14px] bg-[#fafaf8] border border-[#ebebeb]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: iconBg, color: iconColor }}>{icon}</div>
        <p className="text-[11px] text-[#aaa] font-semibold tracking-wider uppercase m-0">{label}</p>
        <p className="text-[17px] font-semibold m-0" style={{ color: valueColor }}>{value}</p>
    </div>
);

const ReadField = ({ icon, label, value }) => (
    <div>
        <label className="text-[11px] font-semibold tracking-wider uppercase text-[#bbb] block mb-1">{label}</label>
        <div className="flex items-center gap-[7px] text-[13px] text-[#555] font-medium py-1">
            {icon} {value || "—"}
        </div>
    </div>
);

const Blank = () => <span className="text-[#ccc] italic">Chưa thiết lập</span>;

const formatRole = (role) => {
    switch (role) {
        case "ROLE_ADMIN": return "Quản trị viên";
        case "ROLE_SUPPORTER": return "Hỗ trợ viên";
        default: return "Học viên";
    }
};

export default ProfilePage;
