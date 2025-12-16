import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const API_BASE_URL = "http://localhost:3001";

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [status, setStatus] = useState("loading"); // loading, success, error
    const [message, setMessage] = useState("");
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const verifyEmail = async () => {
            const code = searchParams.get("code");
            const email = searchParams.get("email");

            // Kiểm tra params
            if (!code || !email) {
                setStatus("error");
                setMessage("Liên kết xác thực không hợp lệ!");
                return;
            }

            try {
                // Gọi API verify
                const response = await axios.get(
                    `${API_BASE_URL}/api/auth/verify-email`,
                    {
                        params: { code, email },
                        withCredentials: true // Quan trọng nếu backend dùng session/cookie
                    }
                );

                setStatus("success");
                setMessage(response.data.message || "Xác thực email thành công!");

                // Đếm ngược và chuyển trang
                const timer = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            navigate("/login");
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                return () => clearInterval(timer);

            } catch (err) {
                console.error("Verification error:", err);
                setStatus("error");

                if (err.response?.data?.message) {
                    setMessage(err.response.data.message);
                } else if (err.response?.status === 400) {
                    setMessage("Mã xác thực không hợp lệ hoặc đã hết hạn!");
                } else if (err.response?.status === 404) {
                    setMessage("Không tìm thấy tài khoản!");
                } else {
                    setMessage("Xác thực thất bại. Vui lòng thử lại sau!");
                }
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-md">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/30">

                        {/* Loading State */}
                        {status === "loading" && (
                            <div className="text-center">
                                <div className="inline-block w-16 h-16 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                    Đang xác thực...
                                </h2>
                                <p className="text-gray-600">
                                    Vui lòng chờ trong giây lát
                                </p>
                            </div>
                        )}

                        {/* Success State */}
                        {status === "success" && (
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                                    <svg
                                        className="w-12 h-12 text-green-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>

                                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                                    Xác thực thành công!
                                </h2>

                                <p className="text-gray-600 mb-6">
                                    {message}
                                </p>

                                <div className="bg-lime-50 border border-lime-200 rounded-lg p-4 mb-6">
                                    <p className="text-lime-800 text-sm">
                                        Tự động chuyển đến trang đăng nhập trong{" "}
                                        <span className="font-bold text-lg">{countdown}</span> giây
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate("/login")}
                                    className="w-full py-3 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                                >
                                    Đăng nhập ngay
                                </button>
                            </div>
                        )}

                        {/* Error State */}
                        {status === "error" && (
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                                    <svg
                                        className="w-12 h-12 text-red-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>

                                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                                    Xác thực thất bại!
                                </h2>

                                <p className="text-gray-600 mb-6">
                                    {message}
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate("/register")}
                                        className="w-full py-3 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                                    >
                                        Đăng ký lại
                                    </button>

                                    <button
                                        onClick={() => navigate("/login")}
                                        className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all"
                                    >
                                        Về trang đăng nhập
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default VerifyEmailPage;
