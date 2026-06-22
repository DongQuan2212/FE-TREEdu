import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import axiosInstance from "../config/axiosConfig";
import { notify } from "../utils/toastNotify";

const ResendVerifyEmailPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Gọi API resend-otp để hệ thống gửi mã về Mailbox người dùng
            await axiosInstance.post("/auth/resend-otp", null, {
                params: {
                    email: email.trim(),
                    type: "SIGNUP" // Xác định là luồng đăng ký/kích hoạt
                }
            });

            notify.success("Mã OTP kích hoạt đã được gửi tới email của bạn!");

            // CHUYỂN HƯỚNG: Khớp chính xác với cách nhận SearchParams trên VerifyOtpPage của bạn
            navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}&type=SIGNUP`);

        } catch (err) {
            console.error("Gửi OTP thất bại:", err);
            let errorMessage = "Không thể gửi mã OTP. Vui lòng kiểm tra lại email!";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            notify.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 flex flex-col">
            <Header />

            <button
                onClick={() => navigate("/login")}
                className="fixed top-6 left-6 z-50 w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white text-2xl hover:bg-white/40 transition-all shadow-lg"
                title="Quay lại Đăng nhập"
            >
                ←
            </button>

            <main className="flex-1 flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-md mt-20 bg-white/95 backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/30">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-lime-100 rounded-full mb-4">
                            <svg className="w-7 h-7 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Kích Hoạt Tài Khoản</h2>
                        <p className="text-gray-600 text-sm mt-2">Nhập email bạn đã đăng ký để nhận mã OTP xác thực</p>
                    </div>

                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email của bạn</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nhap-email@example.com"
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
                                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                    : "bg-lime-500 hover:bg-lime-600 text-white hover:shadow-xl hover:-translate-y-0.5"
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Đang gửi mã...
                                </span>
                            ) : "Gửi Mã Xác Thực"}
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ResendVerifyEmailPage;
