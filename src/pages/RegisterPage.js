import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

const RegisterPage = () => {
    const navigate = useNavigate();

    // Chỉ giữ lại các trường cần thiết theo DTO
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async () => {
        setError("");
        setSuccess("");
        setLoading(true);

        // Validate cơ bản ở frontend
        if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
            setError("Vui lòng điền đầy đủ các trường bắt buộc!");
            setLoading(false);
            return;
        }

        // Kiểm tra độ dài mật khẩu tối thiểu (theo @Size(min = 6) ở backend)
        if (formData.password.length < 6) {
            setError("Mật khẩu phải ít nhất 6 ký tự!");
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/api/users/newMember`, {
                userType: "ROLE_MEMBER",                    // Cố định, không cho người dùng thay đổi
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                password: formData.password
            });

            setSuccess("Đăng ký thành công! Đang chuyển sang trang đăng nhập...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            console.error("Register error:", err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 400) {
                setError("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!");
            } else if (err.response?.status === 409) {
                setError("Email đã được sử dụng!");
            } else {
                setError("Đăng ký thất bại. Vui lòng thử lại sau!");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 flex flex-col">
            <Header />

            {/* Nút quay lại */}
            <button
                onClick={handleBack}
                className="fixed top-6 left-6 z-50 w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white text-2xl hover:bg-white/40 transition-all hover:scale-110 shadow-lg"
                title="Quay lại"
            >
                ←
            </button>

            <main className="flex-1 flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-md mt-20">
                    <div className="bg-white/95 backdrop-blur-xl rounded-1xl p-8 sm:p-10 shadow-2xl border border-white/30">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">Tạo tài khoản mới</h2>
                            <p className="text-gray-600 mt-2">Tham gia cùng chúng tôi ngay hôm nay!</p>
                        </div>

                        {/* Thông báo thành công */}
                        {success && (
                            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm text-center">
                                {success}
                            </div>
                        )}

                        {/* Thông báo lỗi */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Họ và tên */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Nguyễn Văn A"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-lime-500 focus:outline-none focus:ring-4 focus:ring-lime-500/20 transition-all"
                                    disabled={loading}
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-lime-500 focus:outline-none focus:ring-4 focus:ring-lime-500/20 transition-all"
                                    disabled={loading}
                                />
                            </div>

                            {/* Mật khẩu */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mật khẩu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Ít nhất 6 ký tự"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-lime-500 focus:outline-none focus:ring-4 focus:ring-lime-500/20 transition-all"
                                    disabled={loading}
                                />
                            </div>

                            {/* Nút Đăng ký */}
                            <button
                                onClick={handleRegister}
                                disabled={loading}
                                className={`w-full py-4 font-bold text-lg rounded-xl shadow-lg transform transition-all duration-200 mt-6 ${
                                    loading
                                        ? "bg-gray-400 cursor-not-allowed text-gray-200"
                                        : "bg-lime-500 hover:bg-lime-600 active:bg-lime-700 text-white hover:shadow-xl hover:-translate-y-1"
                                }`}
                            >
                                {loading ? "Đang tạo tài khoản..." : "Đăng Ký Ngay"}
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                            <p className="text-gray-600 text-sm">
                                Đã có tài khoản?{" "}
                                <span
                                    onClick={() => navigate("/login")}
                                    className="font-bold text-lime-600 hover:underline cursor-pointer"
                                >
                                    Đăng nhập ngay
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default RegisterPage;
