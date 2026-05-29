import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";
import { useAuth } from "../../hook/useAuth";

import {
    User, Mail, Shield, Edit2, Lock, X, Check,
    Phone, Calendar, MapPin, Flame, Zap, Award, BookOpen, Upload
} from "lucide-react";

/* ─── Inline styles (Giữ nguyên kiến trúc CSS cô lập) ─── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

.pf-root { font-family: 'DM Sans', sans-serif; }

.pf-avatar-ring {
    width: 88px; height: 88px; border-radius: 50%;
    background: #f3f4f0;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; flex-shrink: 0;
    border: 1px solid #e8e8e4;
}

.pf-card {
    background: #ffffff;
    border: 1px solid #ebebeb;
    border-radius: 20px;
}

.pf-stat {
    display: flex; flex-direction: column; gap: 4px;
    padding: 18px 20px;
    border-radius: 14px;
    background: #fafaf8;
    border: 1px solid #ebebeb;
}

.pf-stat-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 8px;
}

.pf-input {
    width: 100%; box-sizing: border-box;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 400;
    color: #1a1a1a;
    background: #fafaf8;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 10px 14px;
    outline: none;
    transition: border-color 0.15s;
}
.pf-input:focus { border-color: #3d7a5c; background: #fff; }

.pf-select {
    width: 100%; box-sizing: border-box;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 400;
    color: #1a1a1a;
    background: #fafaf8;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 10px 14px;
    outline: none;
    appearance: none;
    transition: border-color 0.15s;
}
.pf-select:focus { border-color: #3d7a5c; background: #fff; }

.pf-btn-primary {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500; letter-spacing: 0.02em;
    color: #fff; background: #1c1c1c;
    border: none; border-radius: 12px;
    padding: 11px 20px; cursor: pointer;
    display: inline-flex; align-items: center; gap: 7px;
    transition: background 0.15s, transform 0.1s;
}
.pf-btn-primary:hover { background: #333; }
.pf-btn-primary:active { transform: scale(0.98); }

.pf-btn-save {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    color: #fff; background: #2d6a4f;
    border: none; border-radius: 12px;
    padding: 11px 20px; cursor: pointer;
    display: inline-flex; align-items: center; gap: 7px;
    transition: background 0.15s;
}
.pf-btn-save:hover { background: #245c43; }
.pf-btn-save:disabled { opacity: 0.5; cursor: default; }

.pf-btn-ghost {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    color: #555; background: transparent;
    border: 1px solid #ddd; border-radius: 12px;
    padding: 11px 20px; cursor: pointer;
    display: inline-flex; align-items: center; gap: 7px;
    transition: background 0.15s, border-color 0.15s;
}
.pf-btn-ghost:hover { background: #f5f5f3; border-color: #bbb; }
.pf-btn-ghost:disabled { opacity: 0.5; cursor: default; }

.pf-btn-upload {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    color: #fff; background: #3d7a5c;
    border: none; border-radius: 12px;
    padding: 11px 20px; cursor: pointer;
    display: inline-flex; align-items: center; gap: 7px;
    transition: background 0.15s;
}
.pf-btn-upload:hover { background: #2d6a4f; }
.pf-btn-upload:disabled { opacity: 0.5; cursor: default; }

.pf-file-input { display: none; }

.pf-avatar-preview {
    width: 100%; max-height: 200px; border-radius: 10px;
    object-fit: contain; margin-bottom: 8px; border: 1px solid #ddd;
}

.pf-avatar-preview-container {
    position: relative; margin-bottom: 12px;
}

.pf-file-info {
    font-size: 12px; color: #666;
    background: #f9f9f7; padding: 8px 10px;
    border-radius: 8px; margin-top: 8px;
}

.pf-xp-bar {
    height: 4px; border-radius: 2px;
    background: #ebebeb; overflow: hidden;
}
.pf-xp-fill {
    height: 100%;
    background: #3d7a5c;
    border-radius: 2px;
    transition: width 0.6s ease;
}

.pf-divider { height: 1px; background: #f0f0ee; margin: 4px 0; }

.pf-field-label {
    font-size: 11px; font-weight: 500;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #aaa; margin-bottom: 6px; display: block;
}

.pf-field-value {
    display: flex; align-items: center; gap: 8px;
    font-size: 14px; color: #1a1a1a; font-weight: 400;
    padding: 6px 0;
}

.pf-role-badge {
    font-size: 11px; font-weight: 500; letter-spacing: 0.05em;
    color: #2d6a4f; background: #eaf4ee;
    padding: 4px 12px; border-radius: 20px;
    display: inline-block; margin-top: 4px;
}

.pf-section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 18px; color: #1a1a1a; font-weight: 400;
}

.pf-spinner {
    width: 36px; height: 36px;
    border: 2px solid #e0e0e0;
    border-top-color: #3d7a5c;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
    .pf-grid { grid-template-columns: 1fr !important; }
}
`;

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
    const fileInputRef = React.useRef(null);

    // State form lưu giữ các giá trị chỉnh sửa
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

            // Kết hợp dữ liệu phân quyền và dữ liệu profile chi tiết
            const fullUser = { ...meData, role: authData.role };
            setUser(fullUser);

            // Gán dữ liệu ban đầu vào form (Sử dụng 'fullname' khớp DTO Backend)
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
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh hợp lệ!');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước ảnh không được vượt quá 5MB!');
                return;
            }
            setAvatarFile(file);
            // Create preview
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
            // Tạo FormData để gửi multipart/form-data
            const formDataSubmit = new FormData();
            formDataSubmit.append('fullname', formData.fullname.trim());
            formDataSubmit.append('phoneNumber', formData.phoneNumber ? formData.phoneNumber.trim() : '');
            formDataSubmit.append('birthYear', formData.birthYear || '');
            formDataSubmit.append('address', formData.address ? formData.address.trim() : '');
            formDataSubmit.append('gender', formData.gender);
            
            // Thêm file avatar nếu có
            if (avatarFile) {
                formDataSubmit.append('avatarFile', avatarFile);
            }

            const response = await axiosInstance.put(`/users/update-my-profile/${user.id}`, formDataSubmit, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const updatedData = response.data.data;

            // Cập nhật lại UI cục bộ dựa trên dữ liệu mới nhất từ Backend
            setUser({ ...user, ...updatedData });
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview("");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            // Làm mới Header để đồng bộ tức thì tên và avatar mới
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
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafaf8" }}>
            <style>{css}</style>
            <div style={{ textAlign: "center" }}>
                <div className="pf-spinner" style={{ margin: "0 auto 16px" }}></div>
                <p style={{ color: "#888", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Đang tải hồ sơ…</p>
            </div>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafaf8" }}>
            <style>{css}</style>
            <div className="pf-card" style={{ padding: "32px", textAlign: "center", maxWidth: 380 }}>
                <p style={{ color: "#c0392b", fontSize: 14, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
                <button className="pf-btn-primary" onClick={() => navigate("/login")}>Đăng nhập lại</button>
            </div>
        </div>
    );

    const xpProgress = user.progressPercentage !== undefined ? user.progressPercentage : 0; // Lấy trực tiếp % từ Backend
    const genderLabel = user.gender === "MALE" ? "Nam" : user.gender === "FEMALE" ? "Nữ" : "Khác";
    const initials = (user.fullName || "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

    return (
        <div className="pf-root" style={{ minHeight: "100vh", background: "#fafaf8", display: "flex", flexDirection: "column" }}>
            <style>{css}</style>
            <Header />

            <main style={{ flex: 1, maxWidth: 1000, margin: "0 auto", width: "100%", padding: "40px 20px 80px", marginTop: 88 }}>
                <div className="pf-grid" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>

                    {/* ═══════════ CỘT TRÁI: GAMIFICATION CARD ═══════════ */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div className="pf-card" style={{ padding: "28px 24px", textAlign: "center" }}>
                            {/* Khung xử lý Avatar tự động hiển thị hoặc tạo Initials chữ cái đầu */}
                            <div className="pf-avatar-ring" style={{ margin: "0 auto 16px" }}>
                                {user.avatarUrl
                                    ? <img src={user.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#777", letterSpacing: 1 }}>{initials}</span>
                                }
                            </div>

                            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#1a1a1a", fontWeight: 400, lineHeight: 1.3 }}>
                                {user.fullName || "Học viên TREEdu"}
                            </div>
                            <span className="pf-role-badge">{formatRole(user.role)}</span>

                            {/* 🛡️ Tìm khối Cấp độ hiển thị thực tế từ DB và thay thế bằng code dưới đây */}
                            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f0f0ee", textAlign: "left" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#555", display: "flex", alignItems: "center", gap: 5 }}>
            <Award size={13} color="#b98c2a" />
            Cấp {user.level || 1}
        </span>
                                    <span style={{ fontSize: 12, color: "#aaa" }}>{user.xp || 0} XP</span>
                                </div>
                                <div className="pf-xp-bar">
                                    {/* Thanh bar chạy mượt mà theo % thực tế từ thuật toán RPG */}
                                    <div className="pf-xp-fill" style={{ width: `${xpProgress}%` }}></div>
                                </div>
                                <p style={{ fontSize: 11, color: "#bbb", marginTop: 5, textAlign: "right" }}>
                                    {/* 🚀 Đổi từ tính toán cứng % 1000 sang trường dynamic chuẩn từ Backend */}
                                    {user.xpNeededForNextLevel !== undefined ? user.xpNeededForNextLevel : 0} XP để lên cấp
                                </p>
                            </div>
                        </div>

                        {/* Hệ thống Dashboard Stat hiển thị các chỉ số học tập thực tế */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
                    <div className="pf-card" style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid #f0f0ee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="pf-section-title">Thông tin tài khoản</span>
                            {!isEditing && (
                                <button className="pf-btn-ghost" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => setIsEditing(true)}>
                                    <Edit2 size={13} /> Chỉnh sửa
                                </button>
                            )}
                        </div>

                        <div style={{ padding: "24px 28px", flex: 1 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px", marginBottom: 20 }}>
                                <ReadField icon={<Mail size={14} color="#aaa" />} label="Email" value={user.email} />
                                <ReadField icon={<Shield size={14} color="#aaa" />} label="Vai trò" value={formatRole(user.role)} />
                            </div>

                            <div className="pf-divider" style={{ marginBottom: 20 }}></div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 24px" }}>
                                {/* Trường Họ và tên */}
                                <div>
                                    <label className="pf-field-label">Họ và tên</label>
                                    {isEditing
                                        ? <input className="pf-input" type="text" name="fullname" value={formData.fullname} onChange={handleInputChange} />
                                        : <div className="pf-field-value"><User size={14} color="#ccc" />{user.fullName || <Blank />}</div>
                                    }
                                </div>

                                {/* Trường Số điện thoại */}
                                <div>
                                    <label className="pf-field-label">Số điện thoại</label>
                                    {isEditing
                                        ? <input className="pf-input" type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="0912 345 678" />
                                        : <div className="pf-field-value"><Phone size={14} color="#ccc" />{user.phoneNumber || <Blank />}</div>
                                    }
                                </div>

                                {/* Trường Năm sinh */}
                                <div>
                                    <label className="pf-field-label">Năm sinh</label>
                                    {isEditing
                                        ? <input className="pf-input" type="number" name="birthYear" value={formData.birthYear} onChange={handleInputChange} placeholder="2000" />
                                        : <div className="pf-field-value"><Calendar size={14} color="#ccc" />{user.birthYear || <Blank />}</div>
                                    }
                                </div>

                                {/* Trường Giới tính */}
                                <div>
                                    <label className="pf-field-label">Giới tính</label>
                                    {isEditing
                                        ? <select className="pf-select" name="gender" value={formData.gender} onChange={handleInputChange}>
                                            <option value="MALE">Nam</option>
                                            <option value="FEMALE">Nữ</option>
                                            <option value="OTHER">Khác</option>
                                        </select>
                                        : <div className="pf-field-value"><User size={14} color="#ccc" />{genderLabel}</div>
                                    }
                                </div>

                                {/* Trường Địa chỉ */}
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label className="pf-field-label">Địa chỉ thường trú</label>
                                    {isEditing
                                        ? <input className="pf-input" type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="TP. Hồ Chí Minh" />
                                        : <div className="pf-field-value"><MapPin size={14} color="#ccc" />{user.address || <Blank />}</div>
                                    }
                                </div>

                                {/* Trường chọn file ảnh - Chỉ xuất hiện khi mở chế độ Edit */}
                                {isEditing && (
                                    <div style={{ gridColumn: "1 / -1" }}>
                                        <label className="pf-field-label">Ảnh đại diện</label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarFileChange}
                                            className="pf-file-input"
                                        />
                                        {/* Preview: ưu tiên file mới, fallback về avatar hiện tại */}
                                        {(avatarPreview || user.avatarUrl) && (
                                            <div className="pf-avatar-preview-container">
                                                <img 
                                                    src={avatarPreview || user.avatarUrl} 
                                                    alt="Avatar preview" 
                                                    className="pf-avatar-preview" 
                                                />
                                            </div>
                                        )}
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button
                                                type="button"
                                                className="pf-btn-upload"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload size={14} /> {avatarPreview ? "Đổi ảnh" : "Chọn ảnh"}
                                            </button>
                                            {avatarFile && (
                                                <button
                                                    type="button"
                                                    className="pf-btn-ghost"
                                                    onClick={handleRemoveAvatar}
                                                >
                                                    <X size={14} /> Xóa
                                                </button>
                                            )}
                                        </div>
                                        {/* Tên file đã chọn */}
                                        {avatarFile && (
                                            <div className="pf-file-info">
                                                📎 {avatarFile.name} ({(avatarFile.size / 1024).toFixed(0)} KB)
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thanh công cụ tương tác dưới chân Card */}
                        <div style={{ padding: "16px 28px", borderTop: "1px solid #f0f0ee", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            {isEditing ? (
                                <>
                                    <button className="pf-btn-ghost" onClick={handleCancelEdit} disabled={saving}>
                                        <X size={14} /> Hủy
                                    </button>
                                    <button className="pf-btn-save" onClick={handleSaveProfile} disabled={saving}>
                                        <Check size={14} /> {saving ? "Đang lưu…" : "Lưu thay đổi"}
                                    </button>
                                </>
                            ) : (
                                <button className="pf-btn-ghost" onClick={handleChangePassword}>
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
    <div className="pf-stat">
        <div className="pf-stat-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
        <p style={{ fontSize: 11, color: "#aaa", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>{label}</p>
        <p style={{ fontSize: 17, fontWeight: 500, color: valueColor, margin: 0, fontFamily: "'DM Serif Display', serif" }}>{value}</p>
    </div>
);

const ReadField = ({ icon, label, value }) => (
    <div>
        <label style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb", display: "block", marginBottom: 4 }}>{label}</label>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#555", padding: "4px 0" }}>
            {icon} {value || "—"}
        </div>
    </div>
);

const Blank = () => <span style={{ color: "#ccc", fontStyle: "italic" }}>Chưa thiết lập</span>;

const formatRole = (role) => {
    switch (role) {
        case "ROLE_ADMIN": return "Quản trị viên";
        case "ROLE_SUPPORTER": return "Hỗ trợ viên";
        default: return "Học viên";
    }
};

export default ProfilePage;
