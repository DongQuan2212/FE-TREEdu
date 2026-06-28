import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Spline from "@splinetool/react-spline";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

import imgQuiz from "../asset/quiz.jpg"
import imgDic from "../asset/flashcard.jpg"
import imgAI from "../asset/ai1.jpg"

import imgCom1 from "../asset/icom1.jpg"
import imgCom2 from "../asset/icom2.jpg"
import imgCom3 from "../asset/icom3.jpg"
import imgCom4 from "../asset/icom4.jpg"
import imgCom5 from "../asset/iCom5.jpg"


function HomePage() {
    const navigate = useNavigate();
    const heroRef = useRef(null);

    // --- Parallax Effect cho Hero ---
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });
    const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    // Cấu hình animation chung: lướt lên lướt xuống đều chạy lại
    const animConfig = {
        viewport: { once: false, amount: 0.3 }
    };

    return (
        <div className="w-full overflow-hidden bg-white font-sans text-slate-800">
            <Header />

            <div ref={heroRef} className="relative h-screen min-h-[800px] w-full bg-slate-50 flex items-center justify-center overflow-hidden">
                <motion.div style={{ y: yHero, opacity: opacityHero }} className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-100 via-transparent to-transparent opacity-50" />
                </motion.div>

                <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full pt-20 mr-10">
                    {/* Left: Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8 text-center lg:text-left"
                    >
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                            Trồng cây tri thức,
                            <span className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.15]"> vững gốc Tiếng Việt.</span>
                        </h1>
                        <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                            Phương pháp khoa học, thú vị và dễ tiếp thu. Chỉ 15 phút mỗi ngày để làm chủ Tiếng Việt cùng TREEdu.
                        </p>
                        <div className="pt-4">
                            <button
                                onClick={() => navigate("/login")}
                                className="px-10 py-4 bg-emerald-600 text-white font-semibold rounded-full shadow-lg hover:bg-emerald-700 hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all duration-300"
                            >
                                Học ngay thôi →
                            </button>
                        </div>
                    </motion.div>

                    {/* Right: Spline */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-[400px] lg:h-[600px] w-full flex items-center justify-center relative"
                    >
                        <Spline scene="https://prod.spline.design/Ae90gNh9rmqmAV3D/scene.splinecode" />
                    </motion.div>
                </div>
            </div>

            {/* ==================== SECTION 1: QUIZ (Trắng) ==================== */}
            <section className="py-24 lg:py-32 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={animConfig.viewport}
                            transition={{ duration: 0.8 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-emerald-200 rounded-3xl rotate-3 group-hover:rotate-6 transition-transform duration-500" />
                            <img
                                src={imgQuiz}
                                alt="Quiz Feature"
                                className="relative rounded-3xl shadow-2xl w-full object-cover aspect-[4/3] transform group-hover:-translate-y-2 transition-transform duration-500"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={animConfig.viewport}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="space-y-6"
                        >
                            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                                Thử thách kiến thức <br/>với Quiz Game
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Hệ thống câu hỏi đa dạng giúp bạn ôn luyện, củng cố và ghi nhớ từ vựng một cách bền vững.
                            </p>
                            <button
                                onClick={() => navigate("/quiz")}
                                className="mt-4 px-8 py-3 border-2 border-slate-900 text-slate-900 font-semibold rounded-lg hover:bg-slate-900 hover:text-white transition-all duration-300"
                            >
                                Làm bài Quiz ngay
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ==================== SECTION 2: TỪ ĐIỂN (Dark) ==================== */}
            <section className="py-24 lg:py-32 bg-zinc-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-900/20 to-transparent pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Chữ bên Trái */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={animConfig.viewport}
                            transition={{ duration: 0.8 }}
                            className="space-y-8 order-2 lg:order-1"
                        >
                            <div className="space-y-4">

                                <h2 className="text-5xl lg:text-6xl font-serif text-white leading-tight">
                                    Flashcard <br/> Thông minh
                                </h2>
                            </div>
                            <div className="space-y-4 text-zinc-400 text-lg">
                                <p className="flex items-center gap-3">
                                    Hệ thống Flashcard thông minh giúp bạn học và ôn tập từ vựng một cách khoa học, ghi nhớ lâu hơn và cải thiện rõ rệt khả năng ngôn ngữ.
                                </p>

                            </div>
                            <div className="pt-4">
                                <button
                                    onClick={() => navigate("/flashcard")}
                                    className="px-10 py-4 border border-zinc-500 text-white text-lg hover:border-white hover:bg-white hover:text-black transition-all duration-500 rounded-sm"
                                >
                                    Tra cứu ngay
                                </button>
                            </div>
                        </motion.div>

                        {/* Ảnh bên Phải */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={animConfig.viewport}
                            transition={{ duration: 1 }}
                            className="relative order-1 lg:order-2"
                        >
                            <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl border border-zinc-700">
                                <img src={imgDic} alt="Dictionary Feature" className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" />
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* ==================== NEW SECTION: AI CHECKING (Trắng - Ảnh Trái, Chữ Phải) ==================== */}
            <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Ảnh bên Trái */}
                        <motion.div
                            initial={{ opacity: 0, x: -100, rotate: -2 }}
                            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                            viewport={animConfig.viewport}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-50 blur-2xl -z-10" />
                            <img
                                src={imgAI}
                                alt="AI Technology"
                                className="w-full h-auto rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)] object-cover hover:scale-[1.02] transition-transform duration-500"
                            />

                        </motion.div>

                        {/* Chữ bên Phải */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={animConfig.viewport}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="space-y-6"
                        >
                            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                                AI Bắt lỗi Phát âm <br/> & Chính tả
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Bạn không chắc mình nói đúng? Đừng lo! Trợ lý AI của TREEdu sẽ lắng nghe, phân tích giọng nói và chỉ ra lỗi sai ngay lập tức.
                            </p>
                            <button
                                onClick={() => navigate("/pronunciation-practice")}
                                className="mt-4 px-8 py-3 border-2 border-slate-900 text-slate-900 font-semibold rounded-lg hover:bg-slate-900 hover:text-white transition-all duration-300"
                            >
                                Thử nghiệm ngay
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-24 lg:py-32 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={animConfig.viewport}
                            className="text-4xl lg:text-6xl font-bold text-slate-900 mb-4"
                        >
                            Cộng đồng TREEdu
                        </motion.h2>
                        <p className="text-xl text-slate-500">Cùng nhau gieo hạt giống tri thức, gặt hái thành công</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[250px]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={animConfig.viewport}
                            className="col-span-2 row-span-2 rounded-2xl overflow-hidden shadow-lg relative group"
                        >
                            <img src={imgCom1} alt="Community Main" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        </motion.div>

                        {[imgCom2, imgCom3, imgCom4, imgCom5].map((img, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={animConfig.viewport}
                                transition={{ delay: index * 0.1 }}
                                className="col-span-1 row-span-1 rounded-2xl overflow-hidden shadow-lg group"
                            >
                                <img src={img} alt={`Community ${index}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}

export default HomePage;
