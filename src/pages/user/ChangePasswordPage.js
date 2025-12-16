import { useState } from "react";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import axiosInstance from "../../config/axiosConfig";

const ChangePasswordPage = () => {
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!oldPassword || !newPassword || !confirmPassword) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        if (newPassword.length < 6) {
            alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post(
                `/auth/change-password`,
                null,
                {
                    params: {
                        oldPassword,
                        newPassword
                    }
                }
            );

            alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
            navigate("/login");
        } catch (err) {
            console.error(err);
            alert(
                err.response?.data?.message ||
                "Đổi mật khẩu thất bại!"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-md mx-auto px-6 py-12 w-full mt-16">
                <div className="bg-white border border-gray-200 rounded-lg p-8">

                    {/* Back */}
                    <button
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <ArrowLeft size={16} />
                        Quay lại hồ sơ
                    </button>

                    {/* Title */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                            <Lock className="text-white w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Đổi mật khẩu
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Old password */}
                        <InputPassword
                            label="Mật khẩu hiện tại"
                            value={oldPassword}
                            onChange={setOldPassword}
                            show={showPass}
                            toggleShow={() => setShowPass(!showPass)}
                        />

                        {/* New password */}
                        <InputPassword
                            label="Mật khẩu mới"
                            value={newPassword}
                            onChange={setNewPassword}
                            show={showPass}
                            toggleShow={() => setShowPass(!showPass)}
                        />

                        {/* Confirm */}
                        <InputPassword
                            label="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            show={showPass}
                            toggleShow={() => setShowPass(!showPass)}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition font-medium disabled:opacity-50"
                        >
                            {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ChangePasswordPage;

/* ========== COMPONENT ========== */

const InputPassword = ({ label, value, onChange, show, toggleShow }) => (
    <div>
        <label className="block text-sm text-gray-600 mb-1">
            {label}
        </label>
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-gray-900"
            />
            <button
                type="button"
                onClick={toggleShow}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    </div>
);
