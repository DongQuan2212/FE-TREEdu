import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                usernameOrEmail: email.trim(),
                password: password,
            });

            const { accessToken, expiryInMinutes } = response.data.data;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("tokenExpiry", Date.now() + expiryInMinutes * 60 * 1000);

            alert("Đăng nhập thành công!");
            navigate("/home");

        } catch (err) {
            console.error("Login error:", err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 401) {
                setError("Email hoặc mật khẩu không đúng!");
            } else {
                setError("Đăng nhập thất bại. Vui lòng thử lại sau!");
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

            <button
                onClick={handleBack}
                className="fixed top-6 left-6 z-50 w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white text-2xl hover:bg-white/40 transition-all hover:scale-110 shadow-lg"
                title="Quay lại"
            >
                Back
            </button>

            <main className="flex-1 flex items-center justify-center px-5 py-10">
                <div className="w-full max-w-md mt-20">
                    <div className="bg-white/95 backdrop-blur-xl rounded-1xl p-8 sm:p-10 shadow-2xl border border-white/30">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">Chào mừng bạn trở lại!</h2>
                            <p className="text-gray-600 mt-2">Đăng nhập để tiếp tục hành trình học tập</p>
                        </div>

                        {/* Hiển thị lỗi */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Nhập email của bạn"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-lime-500 focus:outline-none focus:ring-4 focus:ring-lime-500/20 transition-all"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-lime-500 focus:outline-none focus:ring-4 focus:ring-lime-500/20 transition-all"
                                    disabled={loading}
                                />
                            </div>

                            <div className="text-right -mt-3">
                                <a href="#" className="text-sm font-medium text-lime-600 hover:underline">
                                    Quên mật khẩu?
                                </a>
                            </div>

                            <button
                                onClick={handleLogin}
                                disabled={loading || !email || !password}
                                className={`w-full py-4 font-bold text-lg rounded-xl shadow-lg transform transition-all duration-200 ${
                                    loading || !email || !password
                                        ? "bg-gray-400 cursor-not-allowed text-gray-200"
                                        : "bg-lime-500 hover:bg-lime-600 active:bg-lime-700 text-white hover:shadow-xl hover:-translate-y-1"
                                }`}
                            >
                                {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                            <p className="text-gray-600 text-sm">
                                Chưa có tài khoản?{" "}
                                <a href="/register" className="font-bold text-lime-600 hover:underline">
                                    Đăng ký ngay
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

export default LoginPage;
