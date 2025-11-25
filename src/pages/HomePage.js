import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "../styles/HomePage.css";
import { useNavigate } from "react-router-dom";
import Spline from "@splinetool/react-spline";

function HomePage() {
    const navigate = useNavigate();
    const handleGetStarted = () => {
        navigate("/login");
    };
    return (
        <div>
            <Header />
            <main className="homepage-hero-section">
                <div className="homepage-hero-content">
                    <div className="homepage-left-content">
                        <h1 className="homepage-main-title">
                            Cùng TREEdu trồng cây tri thức, thành thạo Tiếng Việt từ gốc rễ.
                        </h1>

                        <p className="homepage-subtitle">
                            Phương pháp khoa học, thú vị và dễ tiếp thu. Chỉ 15 phút mỗi ngày để làm chủ Tiếng Việt cùng TREEdu
                        </p>

                        <div className="homepage-cta-btn-start">
                            <a href="/login" className="homepage-btn homepage-btn-secondary" >
                                Học ngay thôi →
                            </a>
                        </div>
                    </div>

                    <div className="homepage-right-content">
                        <Spline scene="https://prod.spline.design/Ae90gNh9rmqmAV3D/scene.splinecode" />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default HomePage;
