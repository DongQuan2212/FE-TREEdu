import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosConfig";

import { User, Mail, Shield, Edit2, Lock, X, Check } from "lucide-react";

const ProfilePage = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchCurrentUser = async () => {
        try {
            const response = await axiosInstance.post("/auth/current-user");
            const userData = response.data.data;

            setUser(userData);
            setEditName(userData.fullname);
        } catch (err) {
            console.error("Fetch profile error:", err);
            setError("Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const handleEditProfile = () => {
        setIsEditing(true);
        setEditName(user.name);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditName(user.fullname);
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) return;

        setSaving(true);
        try {
            await axiosInstance.put(
                `/users/update-my-profile/${user.id}`,
                {
                    fullname: editName.trim(), // 🔥 đúng field backend
                }
            );

            setUser({ ...user, name: editName.trim() });
            setIsEditing(false);
        } catch (err) {
            console.error("Update profile error:", err);
            alert("Không thể cập nhật hồ sơ. Vui lòng thử lại!");
        } finally {
            setSaving(false);
        }
    };


    const handleChangePassword = () => {
        navigate("/change-password");
    };

    /* ================= UI STATES ================= */

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full mt-32 mb-12">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">

                    {/* Profile Header */}
                    <div className="px-8 py-6 border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900">
                                    {user.name}
                                </h2>
                                <p className="text-gray-500 mt-1">
                                    {formatRole(user.role)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="px-8 py-6 space-y-6">
                        <InfoRow
                            icon={<Mail className="w-5 h-5" />}
                            label="Email"
                            value={user.email}
                            disabled
                        />

                        <div className="flex items-start gap-4">
                            <div className="mt-0.5 text-gray-400">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full text-base text-gray-900 font-medium border-b-2 border-gray-900 focus:outline-none pb-1"
                                        autoFocus
                                    />
                                ) : (
                                    <p className="text-base text-gray-900 font-medium">
                                        {user.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <InfoRow
                            icon={<Shield className="w-5 h-5" />}
                            label="Vai trò"
                            value={formatRole(user.role)}
                            disabled
                        />
                    </div>

                    {/* Actions */}
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                        {isEditing ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" />
                                    Hủy
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleEditProfile}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Chỉnh sửa hồ sơ
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    <Lock className="w-4 h-4" />
                                    Đổi mật khẩu
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

/* ================= COMPONENTS ================= */

const InfoRow = ({ icon, label, value, disabled }) => (
    <div className="flex items-start gap-4">
        <div className="mt-0.5 text-gray-400">{icon}</div>
        <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-base font-medium ${disabled ? "text-gray-400" : "text-gray-900"}`}>
                {value}
            </p>
        </div>
    </div>
);

const formatRole = (role) => {
    switch (role) {
        case "ROLE_ADMIN":
            return "Quản trị viên";
        case "ROLE_SUPPORTER":
            return "Hỗ trợ viên";
        default:
            return "Thành viên";
    }
};

export default ProfilePage;
