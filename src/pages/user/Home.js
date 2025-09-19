import Header from "../../components/user/Header/Header";
import Footer from "../../components/Footer/Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Spline from '@splinetool/react-spline';

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import banner1 from "../../asset/banner/banner1.png"
import banner2 from "../../asset/banner/banner2.png"
import banner3 from "../../asset/banner/banner3.png"
import iconQuiz from "../../asset/User/quiz.png"
import iconFlashcard from "../../asset/User/flash-cards.png"
import iconRoom from "../../asset/User/room.png"

import "../../styles/user/home.css";


function HomePage() {
    return (
        <div>
            <Header />
            <main>
                <div>
                    <section className="w-full">
                        <Swiper
                            modules={[Autoplay, Pagination, Navigation]}
                            loop={true}
                            autoplay={{delay: 3000, disableOnInteraction: false}}
                            pagination={{clickable: true}}
                            navigation={true}
                            className="banner-swiper"
                        >
                            <SwiperSlide>
                                <img src={banner1} alt="banner1"/>
                            </SwiperSlide>
                            <SwiperSlide>
                                <img src={banner2} alt="banner2"/>
                            </SwiperSlide>
                            <SwiperSlide>
                                <img src={banner3} alt="banner3"/>
                            </SwiperSlide>
                        </Swiper>
                    </section>
                </div>
                <div className="features-section">
                    <div className="container">
                        <h2 className="features-title">Các Chức Năng</h2>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <img src={iconQuiz} alt="ver"/>
                                </div>
                                <h3 className="feature-title">Bài tập Quiz</h3>
                                <p className="feature-description">
                                    Tập hợp các bài tập nhanh bao ồm nhiều tài phù hợp với từng level của bạn.
                                </p>
                                <button className="feature-btn">Tham gia</button>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon">
                                    <img src={iconFlashcard} alt="ver"/>
                                </div>
                                <h3 className="feature-title">Flashcard</h3>
                                <p className="feature-description">
                                    Tạo các thẻ từ vựng, cũng như có sẵn các bộ từ vựng từ hệ thống da dạng nhiều chủ
                                    đề.
                                </p>
                                <button className="feature-btn">Tham gia</button>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon">
                                    <img src={iconRoom} alt="ver"/>
                                </div>
                                <h3 className="feature-title">Phòng luyện phát âm</h3>
                                <p className="feature-description">
                                    AI giúp bạn luyện hổ trợ phát âm cho chuẩn, vừa đưa ra đánh gia qua phần đọc của
                                    bạn.
                                </p>
                                <button className="feature-btn">Tham gia</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div>

                </div>
            </main>
            <Footer/>
        </div>
);
}

export default HomePage;
