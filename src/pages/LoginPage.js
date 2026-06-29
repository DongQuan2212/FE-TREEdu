import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";
// 1. Import hàm notify (Hãy đảm bảo đường dẫn đúng tới file bạn chứa object notify)
import { notify } from "../utils/toastNotify";

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // 2. Xử lý thông báo từ trang khác chuyển tới (ví dụ: Đăng ký thành công)
    useEffect(() => {
        if (location.state?.message) {
            // Thay vì set state, ta bắn thông báo Toast ngay
            notify.success(location.state.message);

            // Xóa state trong history để F5 không hiện lại
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

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
        window.location.href = `${process.env.REACT_APP_API_URL }/oauth2/authorization/google`;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const loginResponse = await axiosInstance.post("/auth/login", {
                email: email.trim(),
                password: password,
            });

            // ⭐ 1. Lấy mã JWT từ cục JSON trả về (chính là trường 'data' trong Postman)
            const token = loginResponse.data.data;

            // ⭐ 2. Cất token vào ngăn 'accessToken' của localStorage NGAY LẬP TỨC
            if (token) {
                localStorage.setItem('accessToken', token);
            } else {
                throw new Error("Không nhận được token từ server");
            }

            // ⭐ 3. Bây giờ mới gọi API lấy thông tin user.
            // Lúc này Axios Interceptor của bạn sẽ tự động bốc 'accessToken' vừa lưu ở trên nhét vào Header.
            const userData = await fetchCurrentUser();

            if (userData) {
                // Lưu thêm thông tin user (không chứa token) để dùng giao diện
                localStorage.setItem("userInfo", JSON.stringify({
                    id: userData.id,
                    email: userData.email,
                    name: userData.name,
                    role: userData.role,
                }));

                const welcomeMessage = `Chào mừng ${userData.name}!`;

                // Chuyển hướng
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

            notify.error(errorMessage);
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
                    <div
                        className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/30">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">Chào mừng bạn trở lại!</h2>
                            <p className="text-gray-600 mt-2">Đăng nhập để tiếp tục hành trình học tập</p>
                        </div>

                        {/* 4. Đã xóa các khối div hiển thị lỗi/success ở đây vì Toastify sẽ hiện popup ở góc màn hình */}

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

                        <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-2">
                            <p className="text-gray-600 text-sm">
                                Chưa có tài khoản?{" "}
                                <a href="/register" className="font-bold text-lime-600 hover:underline">
                                    Đăng ký ngay
                                </a>
                            </p>
                            {/* ─── DÒNG TEXT ĐƯỢC THÊM MỚI Ở ĐÂY ─── */}
                            <p className="text-gray-600 text-sm">
                                Tài khoản chưa kích hoạt?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/resend-verify-email")}
                                    className="font-bold text-lime-600 hover:underline bg-transparent border-none cursor-pointer"
                                >
                                    Kích hoạt tài khoản tại đây
                                </button>
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
