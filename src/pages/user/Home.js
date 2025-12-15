import Header from "../../components/user/Header";
import Footer from "../../components/Footer/Footer";
import iconQuiz from "../../asset/User/quiz.png";
import iconFlashcard from "../../asset/User/flash-cards.png";
import iconRoom from "../../asset/User/room.png";
import avatar1 from "../../asset/User1.jpg";
import avatar2 from "../../asset/User2.jpg";
import avatar3 from "../../asset/user3.webp";

import { useNavigate } from "react-router-dom";

function HomePage() {
    const navigate = useNavigate();

    const handleJoinQuiz = () => navigate("/quiz");
    const handleJoinFlashCard = () => navigate("/flashcard");
    const handleJoinPronunciation = () => navigate("/pronunciation"); // sửa link nếu có

    return (
        <>
            <Header />
            <section className="py-20 bg-gray-10 mt-14">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2
                        data-aos="fade-up"
                        className="text-4xl md:text-6xl font-bold text-gray-800 mb-6"
                    >
                        Bạn sẽ học được gì trên TREEdu?
                    </h2>
                    <p
                        data-aos="fade-up"
                        data-aos-delay="200"
                        className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto"
                    >
                        Luyện học Tiếng Việt chưa bao giờ dễ đến vậy
                    </p>

                    <div className="grid md:grid-cols-3 gap-10">
                        {/* Card 1 */}
                        <div
                            data-aos="zoom-in"
                            data-aos-delay="100"
                            className="bg-white rounded-2xl shadow-2xl p-10 hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500 group"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                <img src={iconQuiz} alt="Quiz" className="w-12 h-12 filter brightness-0 invert" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Các bài quiz đa dạng</h3>
                            <p className="text-gray-600 mb-6">
                                Ôn luyện Tiếng Việt hiệu quả: đề luyện phong phú, chấm tự động và lời giải rõ ràng.
                            </p>
                            <button
                                onClick={handleJoinQuiz}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-full hover:shadow-lg transform hover:scale-105 transition"
                            >
                                Làm ngay →
                            </button>
                        </div>

                        {/* Card 2 */}
                        <div
                            data-aos="zoom-in"
                            data-aos-delay="300"
                            className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500 group"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <img src={iconFlashcard} alt="Flashcard" className="w-12 h-12 filter brightness-0 invert" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Flashcard Thông Minh</h3>
                            <p className="text-gray-600 mb-6">
                                Ghi nhớ từ vựng nhanh hơn với flashcard thông minh – lặp lại theo chu kỳ và theo dõi tiến độ học.
                            </p>
                            <button
                                onClick={handleJoinFlashCard}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:shadow-lg transform hover:scale-105 transition"
                            >
                                Tạo bộ từ →
                            </button>
                        </div>

                        {/* Card 3 */}
                        <div
                            data-aos="zoom-in"
                            data-aos-delay="500"
                            className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500 group"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                <img src={iconRoom} alt="Phòng phát âm" className="w-12 h-12 filter brightness-0 invert" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">AI Chấm Phát Âm</h3>
                            <p className="text-gray-600 mb-6">
                                Luyện nói chuẩn như người bản xứ • nhận điểm & góp ý tức thì
                            </p>
                            <button
                                onClick={handleJoinPronunciation}
                                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-3 px-8 rounded-full hover:shadow-lg transform hover:scale-105 transition"
                            >
                                Luyện nói →
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== TESTIMONIALS ==================== */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 data-aos="fade-up" className="text-4xl md:text-5xl font-bold mb-16">
                        Học viên nói gì về TREEdu?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { img: avatar1, name: "Nguyễn Lan Anh", text: "Từ 5.5 lên 7.0 IELTS chỉ sau 2 tháng nhờ AI phát âm!", rating: "★★★★★" },
                            { img: avatar2, name: "Trần Minh Quân", text: "Flashcard giúp mình nhớ 1000 từ trong 3 tuần. Quá ngon!", rating: "★★★★★" },
                            { img: avatar3, name: "Phạm Thu Hà", text: "Đề thi giống đề thật đến 95%. Đạt 9.0 môn Anh THPT QG!", rating: "★★★★★" },
                        ].map((item, i) => (
                            <div
                                key={i}
                                data-aos="fade-up"
                                data-aos-delay={i * 200}
                                className="bg-gray-50 rounded-2xl p-8 shadow-lg"
                            >
                                <img src={item.img} alt={item.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
                                <p className="text-3xl text-yellow-500 mb-2">{item.rating}</p>
                                <p className="text-gray-700 italic mb-4">"{item.text}"</p>
                                <p className="font-bold text-gray-800">- {item.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}

export default HomePage;
