import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../config/axiosConfig";

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handleOAuth2Redirect = async () => {
            const token = searchParams.get("token");
            const email = searchParams.get("email");
            const name = searchParams.get("name");
            const role = searchParams.get("role");

            if (!token || !email || !name) {
                navigate("/login?error=oauth_failed");
                return;
            }

            // ⭐ Lưu token để Axios interceptor tự gắn Authorization header
            localStorage.setItem("accessToken", token);

            try {
                const response = await axiosInstance.post("/auth/current-user");
                const userData = response.data.data;

                localStorage.setItem("userInfo", JSON.stringify({
                    id: userData.id,
                    email: userData.email,
                    name: userData.name,
                    role: userData.role,
                }));

                const welcomeMessage = `Chào mừng ${userData.name}!`;
                if (role === "ROLE_ADMIN") {
                    navigate("/admin/dashboard", { state: { message: welcomeMessage } });
                } else if (role === "ROLE_SUPPORTER") {
                    navigate("/supporter/dashboard", { state: { message: welcomeMessage } });
                } else {
                    navigate("/home", { state: { message: welcomeMessage } });
                }
            } catch (error) {
                console.error("OAuth2 redirect error:", error);
                navigate("/login?error=oauth_failed");
            }
        };

        handleOAuth2Redirect();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-lime-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-lime-500 mx-auto mb-4"></div>
                <p className="text-gray-700 text-lg font-semibold">Đang xử lý đăng nhập...</p>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;
