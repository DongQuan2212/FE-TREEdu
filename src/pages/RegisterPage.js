import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";



const RegisterPage = () => {
    const navigate = useNavigate();
    const avatarInputRef = useRef(null);

    // Mở rộng formData chứa đầy đủ các trường cũ và mới
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        rePassword: "",
        phoneNumber: "",
        birthYear: "",
        address: "",
        gender: "MALE" // Giá trị mặc định hợp lệ theo Enum của bạn
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === "birthYear" ? (value ? parseInt(value, 10) : "") : value
        });
    };

    const handleAvatarSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError("Vui lòng chọn một file hình ảnh!");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Kích thước file không được vượt quá 5MB!");
            return;
        }

        setError("");
        setAvatarFile(file);
    };

    const handleRegister = async () => {
        setError("");
        setSuccess("");
        setLoading(true);

        // 1. Validate các trường bắt buộc ở Frontend
        if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim() || !formData.rePassword.trim()) {
            setError("Vui lòng điền đầy đủ các trường bắt buộc (*)");
            setLoading(false);
            return;
        }

        // 2. Kiểm tra khớp mật khẩu
        if (formData.password !== formData.rePassword) {
            setError("Mật khẩu nhập lại không trùng khớp!");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Mật khẩu phải chứa ít nhất 6 ký tự!");
            setLoading(false);
            return;
        }

        // 3. Validate định dạng Số điện thoại Việt Nam (nếu có nhập)
        if (formData.phoneNumber) {
            const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
            if (!phoneRegex.test(formData.phoneNumber)) {
                setError("Số điện thoại không đúng định dạng Việt Nam!");
                setLoading(false);
                return;
            }
        }

        // 4. Validate năm sinh (nếu có nhập)
        if (formData.birthYear) {
            if (formData.birthYear < 1900 || formData.birthYear > 2026) {
                setError("Năm sinh không hợp lệ (Phải từ 1900 đến 2026)!");
                setLoading(false);
                return;
            }
        }

        try {
            // Chuẩn bị FormData để gửi cả dữ liệu và file
            const submitData = new FormData();
            submitData.append('fullName', formData.fullName.trim());
            submitData.append('email', formData.email.trim());
            submitData.append('password', formData.password);
            submitData.append('rePassword', formData.rePassword);
            submitData.append('phone', formData.phoneNumber.trim() || null);
            submitData.append('birthYear', formData.birthYear || null);
            submitData.append('address', formData.address.trim() || null);
            submitData.append('gender', formData.gender);

            // Thêm file avatar nếu người dùng chọn
            if (avatarFile) {
                submitData.append('avatarFile', avatarFile);
            }

            await axiosInstance.post(`/users/newMember`, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess("Đăng ký thành công! Đang chuyển sang trang xác thực email...");
            setTimeout(() => {
                navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
            }, 2000);

        } catch (err) {
            console.error("Register error:", err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 400) {
                setError("Dữ liệu không hợp lệ. Vui lòng kiểm tra kỹ các ràng buộc!");
            } else if (err.response?.status === 409) {
                setError("Email này đã được sử dụng trên hệ thống!");
            } else {
                setError("Đăng ký thất bại. Vui lòng thử lại sau!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 flex flex-col">
            <Header />

            <button
                onClick={() => navigate(-1)}
                className="fixed top-6 left-6 z-50 w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white text-2xl hover:bg-white/40 transition-all hover:scale-110 shadow-lg"
                title="Quay lại"
            >
                ←
            </button>

            <main className="flex-1 flex items-center justify-center px-5 py-10">
                {/* Tăng chiều rộng max-w-2xl để chứa giao diện 2 cột cân đối */}
                <div className="w-full max-w-2xl mt-20">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/30">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">Tạo tài khoản mới</h2>
                            <p className="text-gray-600 mt-2">Tham gia cùng chúng tôi để nâng cấp vốn từ vựng ngay hôm nay!</p>
                        </div>

                        {success && (
                            <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm text-center font-medium">
                                {success}
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center font-medium">
                                {error}
                            </div>
                        )}

                        {/* Sử dụng Grid layout chia form làm 2 cột rõ ràng */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                            {/* --- CỘT 1: THÔNG TIN TÀI KHOẢN (BẮT BUỘC) --- */}
                            <div className="space-y-4 sm:border-r sm:pr-5 border-gray-100">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-lime-600 mb-2">Thông tin bắt buộc</h3>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                                    <input
                                        type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nguyễn Văn A"
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-lime-500 focus:outline-none transition-all text-sm" disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com"
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-lime-500 focus:outline-none transition-all text-sm" disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                                    <input
                                        type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Ít nhất 6 ký tự"
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-lime-500 focus:outline-none transition-all text-sm" disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nhập lại mật khẩu <span className="text-red-500">*</span></label>
                                    <input
                                        type="password" name="rePassword" value={formData.rePassword} onChange={handleChange} placeholder="Trùng khớp với mật khẩu"
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-lime-500 focus:outline-none transition-all text-sm" disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* --- CỘT 2: HỒ SƠ CÁ NHÂN (TÙY CHỌN thêm mới) --- */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Hồ sơ cá nhân (Tùy chọn)</h3>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                                    <input
                                        type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="0912345678"
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-lime-500 focus:outline-none transition-all text-sm" disabled={loading}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Năm sinh</label>
                                        <input
                                            type="number" name="birthYear" value={formData.birthYear} onChange={handleChange} placeholder="2000" min="1900" max="2026"
                                            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-lime-500 focus:outline-none transition-all text-sm" disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Giới tính</label>
                                        <select
                                            name="gender" value={formData.gender} onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-lime-500 focus:outline-none transition-all text-sm bg-white" disabled={loading}
                                        >
                                            <option value="MALE">Nam</option>
                                            <option value="FEMALE">Nữ</option>
                                            <option value="OTHER">Khác</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ</label>
                                    <input
                                        type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Ví dụ: TP.HCM, Hà Nội"
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-lime-500 focus:outline-none transition-all text-sm" disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ảnh đại diện</label>
                                    <input
                                        type="file"
                                        ref={avatarInputRef}
                                        onChange={handleAvatarSelect}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        disabled={loading}
                                        className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${
                                            avatarFile
                                                ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                                                : "border-gray-200 text-gray-700 hover:border-lime-500 hover:bg-lime-50"
                                        }`}
                                    >
                                        {avatarFile
                                            ? `✓ ${avatarFile.name}`
                                            : "📷 Chọn ảnh đại diện"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Nút Đăng ký kéo dài toàn bộ chiều rộng phía dưới */}
                        <button
                            onClick={handleRegister} disabled={loading}
                            className={`w-full py-3.5 font-bold text-lg rounded-xl shadow-lg transform transition-all duration-200 mt-8 ${
                                loading
                                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                                    : "bg-lime-500 hover:bg-lime-600 active:bg-lime-700 text-white hover:shadow-xl hover:-translate-y-0.5"
                            }`}
                        >
                            {loading ? "Đang tạo tài khoản..." : "Đăng Ký Ngay"}
                        </button>

                        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                            <p className="text-gray-600 text-sm">
                                Đã có tài khoản?{" "}
                                <span onClick={() => navigate("/login")} className="font-bold text-lime-600 hover:underline cursor-pointer">
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
