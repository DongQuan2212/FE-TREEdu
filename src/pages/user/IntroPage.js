import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import Lottie from "lottie-react";
import treeAnimation from "../../asset/tree.json";
import studyAnimation from "../../asset/Study.json";
import bookAnimation from "../../asset/Books.json";
import timeAnimation from "../../asset/timehere.json";

function IntroPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="pt-20">
                {/* Section 1: Hero */}
                <section
                    className="max-w-7xl mx-auto px-6 lg:px-20 py-10 flex flex-col lg:flex-row items-center justify-between min-h-screen gap-12">
                    <div
                        data-aos="fade-up"
                        data-aos-delay="100"
                        className="flex-1 max-w-xl text-left lg:text-left"
                    >
                        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                            Làm chủ Tiếng Việt ngay hôm nay
                        </h1>
                        <p className="text-lg lg:text-xl text-gray-700 leading-relaxed">
                            TREEdu mang đến phương pháp học thông minh, thú vị và dễ nhớ – giúp bạn tự tin giao tiếp từ
                            gốc rễ đến nâng cao.
                        </p>
                    </div>

                    <div
                        data-aos="fade-up"
                        data-aos-delay="300"
                        className="flex-1 flex justify-center lg:justify-end"
                    >
                        <div className="w-80 h-80 lg:w-96 lg:h-96">
                            <Lottie animationData={treeAnimation} loop={true}/>
                        </div>
                    </div>
                </section>

                <hr className="max-w-7xl mx-auto border-t border-gray-300"/>

                {/* Section 2: Học theo cách bạn thích */}
                <section
                    className="max-w-7xl mx-auto px-6 lg:px-20 py-20 flex flex-col lg:flex-row-reverse items-center justify-between min-h-screen gap-16">
                    <div
                        data-aos="fade-left"
                        data-aos-delay="100"
                        className="flex-1 max-w-lg"
                    >
                        <h1 className="text-4xl lg:text-6xl font-bold text-[#609a47] leading-tight mb-6">
                            Hãy học theo cách bạn thích
                        </h1>
                        <p className="text-lg lg:text-xl text-gray-700 italic leading-relaxed font-light">
                            TREEdu kết hợp flashcard sinh động, quiz thú vị và lớp học ảo để bạn luyện phát âm chuẩn như
                            người bản xứ. Vừa học, vừa chơi, vừa tiến bộ mỗi ngày.
                        </p>
                    </div>

                    <div
                        data-aos="fade-right"
                        data-aos-delay="300"
                        className="flex-1 flex justify-center"
                    >
                        <div className="w-80 h-80 lg:w-96 lg:h-96">
                            <Lottie animationData={studyAnimation} loop={true}/>
                        </div>
                    </div>
                </section>
                <hr className="max-w-7xl mx-auto border-t border-gray-300"/>
                {/* Section 3: Nguồn tài liệu phong phú */}
                <section
                    className="max-w-7xl mx-auto px-6 lg:px-20 py-20 flex flex-col lg:flex-row items-center justify-between min-h-screen gap-16  -mt-20 pt-32">
                    <div
                        data-aos="fade-up"
                        data-aos-delay="100"
                        className="flex-1 max-w-lg text-left lg:ml-20"
                    >
                        <h1 className="text-4xl lg:text-6xl font-bold text-[#609a47] leading-tight mb-6">
                            Nguồn tài liệu phong phú
                        </h1>
                        <p className="text-lg lg:text-xl text-gray-700 italic leading-relaxed font-light">
                            Kho tài liệu phong phú giúp bạn luyện tập mọi kỹ năng: từ từ vựng, ngữ pháp đến phát âm.
                        </p>
                    </div>

                    <div
                        data-aos="fade-up"
                        data-aos-delay="400"
                        className="flex-1 flex justify-center"
                    >
                        <div className="w-72 h-72 lg:w-80 lg:h-80 animate-float">
                            <Lottie animationData={bookAnimation} loop={true}/>
                        </div>
                    </div>
                </section>
                <hr className="max-w-7xl mx-auto border-t border-gray-300"/>
                {/* Section 4: Học mọi lúc mọi nơi */}
                <section
                    className="max-w-7xl mx-auto px-6 lg:px-20 py-20 pb-40 flex flex-col lg:flex-row-reverse items-center justify-between min-h-screen gap-16">
                    <div
                        data-aos="fade-left"
                        data-aos-delay="100"
                        className="flex-1 max-w-lg"
                    >
                        <h1 className="text-4xl lg:text-6xl font-bold text-[#609a47] leading-tight mb-6">
                            Học mọi lúc mọi nơi.
                        </h1>
                        <p className="text-lg lg:text-xl text-gray-700 italic leading-relaxed font-light">
                            Không cần giờ giấc cố định, TREEdu giúp bạn học mọi lúc mọi nơi, vừa chơi vừa luyện phát âm
                            chuẩn như người bản xứ.
                        </p>
                    </div>

                    <div
                        data-aos="fade-right"
                        data-aos-delay="300"
                        className="flex-1 flex justify-center"
                    >
                        <div className="w-80 h-80 lg:w-96 lg:h-96">
                            <Lottie animationData={timeAnimation} loop={true}/>
                        </div>
                    </div>
                </section>
            </main>

            <Footer/>
        </div>
    );
}

export default IntroPage;
