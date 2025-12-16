import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [userInfo, setUserInfo] = useState(null);

    // Hàm lấy thông tin user hiện tạino
    const fetchCurrentUser = async () => {
        try {
            const response = await axiosInstance.post("/auth/current-user");
            return response.data.data;
        } catch (err) {
            console.error("Không thể lấy thông tin user:", err);
            return null;
        }
    };
    const handleGoogleLogin = () => {
        // Redirect sang backend Google OAuth
        window.location.href = "http://localhost:3001/api/auth/google";
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // Gọi API login - Backend sẽ tự động set cookie
            await axiosInstance.post("/auth/login", {
                email: email.trim(),
                password: password,
            });

            // Lấy thông tin user sau khi login thành công
            const userData = await fetchCurrentUser();

            if (userData) {
                // Lưu thông tin user vào localStorage (không lưu token)
                localStorage.setItem("userInfo", JSON.stringify({
                    id: userData.id,
                    email: userData.email,
                    name: userData.name,
                    role: userData.role,
                }));

                setUserInfo(userData);

                // Redirect dựa theo role với message
                const welcomeMessage = `Chào mừng ${userData.name}!`;

                if (userData.role === "ROLE_ADMIN") {
                    navigate("/admin/dashboard", { state: { message: welcomeMessage } });
                } else if (userData.role === "ROLE_SUPPORTER") {
                    navigate("/supporter/dashboard", { state: { message: welcomeMessage } });
                } else {
                    navigate("/home", { state: { message: welcomeMessage } });
                }
            } else {
                throw new Error("Không thể lấy thông tin người dùng");
            }

        } catch (err) {
            console.error("Login error:", err);

            let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại sau!";

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 401) {
                errorMessage = "Email hoặc mật khẩu không đúng!";
            } else if (err.response?.status === 403) {
                errorMessage = "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email!";
            } else if (err.response?.status === 404) {
                errorMessage = "Không tìm thấy tài khoản!";
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && email && password && !loading) {
            handleLogin(e);
        }
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
                            <h2 className="text-3xl font-bold text-gray-800">Chào mừng bạn trở lại!</h2>
                            <p className="text-gray-600 mt-2">Đăng nhập để tiếp tục hành trình học tập</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Nhập email của bạn"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-lime-500 focus:outline-none focus:ring-4 focus:ring-lime-500/20 transition-all"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Nhập mật khẩu"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-lime-500 focus:outline-none focus:ring-4 focus:ring-lime-500/20 transition-all"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="text-right -mt-3">
                                <a href="/forgot-password"
                                   className="text-sm font-medium text-lime-600 hover:underline">
                                    Quên mật khẩu?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email || !password}
                                className={`w-full py-4 font-bold text-lg rounded-xl shadow-lg transform transition-all duration-200 ${
                                    loading || !email || !password
                                        ? "bg-gray-400 cursor-not-allowed text-gray-200"
                                        : "bg-lime-500 hover:bg-lime-600 active:bg-lime-700 text-white hover:shadow-xl hover:-translate-y-1"
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang đăng nhập...
                                    </span>
                                ) : (
                                    "Đăng Nhập"
                                )}
                            </button>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-3 bg-white text-gray-500">Hoặc</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full py-3 rounded-xl border-2 border-gray-300 flex items-center justify-center gap-3 font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                <img
                                    src="https://developers.google.com/identity/images/g-logo.png"
                                    alt="Google"
                                    className="w-5 h-5"
                                />
                                Đăng nhập bằng Google
                            </button>

                        </form>

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

            <Footer/>
        </div>
    );
};

export default LoginPage;
