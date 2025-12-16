import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await axiosInstance.post(
                "/auth/forgot-password",
                null, // 👈 body rỗng
                {
                    params: {
                        email: email.trim(),
                        newPassword: "reset123", // 👈 gán cứng
                    },
                }
            );

            setSuccess(
                "Đã gửi mã xác thực đặt lại mật khẩu về email của bạn. Vui lòng kiểm tra hộp thư!"
            );
        } catch (err) {
            console.error("Forgot password error:", err);

            let errorMessage = "Có lỗi xảy ra. Vui lòng thử lại sau!";

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 404) {
                errorMessage = "Email không tồn tại trong hệ thống!";
            }

            setError(errorMessage);
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

            <button
                onClick={handleBack}
                className="fixed top-6 left-6 z-50 w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white text-2xl hover:bg-white/40 transition-all hover:scale-110 shadow-lg"
                title="Quay lại"
            >
                ←
            </button>

            <main className="flex-1 flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-md mt-20">
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/30">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">
                                Quên mật khẩu?
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Nhập email để nhận mã đặt lại mật khẩu
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Nhập email của bạn"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-lime-500 focus:outline-none focus:ring-4 focus:ring-lime-500/20 transition-all"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className={`w-full py-4 font-bold text-lg rounded-xl shadow-lg transition-all ${
                                    loading || !email
                                        ? "bg-gray-400 cursor-not-allowed text-gray-200"
                                        : "bg-lime-500 hover:bg-lime-600 text-white hover:shadow-xl hover:-translate-y-1"
                                }`}
                            >
                                {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                            <p className="text-gray-600 text-sm">
                                Nhớ mật khẩu rồi?{" "}
                                <a
                                    href="/login"
                                    className="font-bold text-lime-600 hover:underline"
                                >
                                    Đăng nhập
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ForgotPasswordPage;
