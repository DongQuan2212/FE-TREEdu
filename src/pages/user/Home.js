import Header from "../../components/user/Header/Header";
import Footer from "../../components/Footer/Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Import css Swiper mặc định
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import banner1 from "../../asset/banner/banner1.png"
import banner2 from "../../asset/banner/banner2.png"
import banner3 from "../../asset/banner/banner3.png"
// Import css riêng
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
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        pagination={{ clickable: true }}
                        navigation={true}
                        className="banner-swiper"
                    >
                        <SwiperSlide>
                            <img src={banner1} alt="banner1" />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img src={banner2} alt="banner2" />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img src={banner3} alt="banner3" />
                        </SwiperSlide>
                    </Swiper>
                </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default HomePage;
