import Header from "../../components/user/Header/Header";
import Footer from "../../components/Footer/Footer";
import "../../styles/IntroPage.css";
import Lottie from "lottie-react";
import treeAnimation from "../../asset/tree.json";
import studyAnimation from "../../asset/Study.json";
import bookAnimation from "../../asset/Books.json";
import timeAnimation from "../../asset/timehere.json";
import { useNavigate } from "react-router-dom";

function IntroPage() {
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
                            Làm chủ Tiếng Việt ngay hôm nay
                        </h1>
                        <p className="homepage-subtitle">
                            TREEdu mang đến phương pháp học thông minh, thú vị và dễ nhớ – giúp bạn tự tin giao tiếp từ gốc rễ đến nâng cao.
                        </p>
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
                <div className="homepage-main-4">
                    <div className="homepage-left-4">
                        <div className="lottie-container-4">
                            <Lottie animationData={timeAnimation} loop={true}/>
                        </div>
                    </div>
                    <div className="homepage-right-4">
                        <h1 className="homepage-title-4">
                            Học mọi lúc mọi nơi.
                        </h1>
                        <p className="homepage-subtitle-4">
                            Không cần giờ giấc cố định, TREEdu giúp bạn học mọi lúc mọi nơi, vừa chơi vừa luyện phát âm chuẩn như người bản xứ.
                        </p>
                    </div>
                </div>

            </main>
            <Footer/>
        </div>
    );
}

export default IntroPage;
