import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "../styles/HomePage.css";
import Lottie from "lottie-react";
import treeAnimation from "../asset/tree.json";
import studyAnimation from "../asset/Study.json";
import bookAnimation from "../asset/Books.json";
import { useNavigate } from "react-router-dom";

function HomePage() {
    const navigate = useNavigate();
    const handleGetStarted = () => {
        navigate("/login");
    };

    return (
        <div>
            <Header />
            <main>
                {/* Section 1 */}
                <div className="homepage-main">
                    <div className="homepage-left">
                        <h1 className="homepage-title">
                            Cùng TREEdu trồng cây tri thức, thành thạo Tiếng Việt từ gốc rễ.
                        </h1>
                        <p className="homepage-subtitle">
                            Phương pháp khoa học, thú vị và dễ tiếp thu. Chỉ 15 phút mỗi ngày để làm chủ Tiếng Việt cùng
                            TREEdu
                        </p>
                        <div className="homepage-buttons">
                            <button className="btn-primary" onClick={handleGetStarted}>
                                Học ngay nào!!!!
                            </button>
                        </div>
                    </div>
                    <div className="homepage-right">
                        <div className="lottie-container">
                            <Lottie animationData={treeAnimation} loop={true}/>
                        </div>
                    </div>
                </div>

                <hr className="section-divider"/>

                {/* Section 2 */}
                <div className="homepage-main-tow">
                    <div className="homepage-left-tow">
                        <div className="lottie-container-tow">
                            <Lottie animationData={studyAnimation} loop={true}/>
                        </div>
                    </div>
                    <div className="homepage-right-tow">
                        <h1 className="homepage-title-tow">
                            Hãy học theo cách bạn thích
                        </h1>
                        <p className="homepage-subtitle-tow">
                            TREEdu kết hợp flashcard sinh động, quiz thú vị và lớp học ảo để bạn luyện phát âm chuẩn như
                            người bản xứ. Vừa học, vừa chơi, vừa tiến bộ mỗi ngày
                        </p>
                    </div>
                </div>


                <div className="homepage-main-3">
                    <div className="homepage-left-3">
                        <h1 className="homepage-title-3">
                            Nguồn tài liệu phong phú
                        </h1>
                        <p className="homepage-subtitle-3">
                            Kho tài liệu phong phú giúp bạn luyện tập mọi kỹ năng: từ từ vựng, ngữ pháp đến phát âm.
                        </p>
                    </div>
                    <div className="homepage-right-3">
                        <div className="lottie-container-3">
                            <Lottie animationData={bookAnimation} loop={true}/>
                        </div>
                    </div>
                </div>

            </main>
            <Footer/>
        </div>
    );
}

export default HomePage;
