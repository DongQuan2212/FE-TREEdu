import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../asset/logo1.png';



const Header = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogoClick = () => navigate("/home");
    const handleQuiz = () => navigate("/quiz");
    const handleFlashcard = () => navigate("/flashcard");
    const handleIntro = () => navigate("/intro");
    const handleAi = () => navigate("/pronunciation-practice");

    const handleProfile = () => {
        navigate("/profile");
        setIsMenuOpen(false);
    };
    const handleHistory = () => {
        navigate("/history");
        setIsMenuOpen(false);
    };
    const handleLogout = () => {
        // Xử lý logout ở đây (xóa token, localStorage, v.v.)
        localStorage.removeItem("token");
        navigate("/login");
        setIsMenuOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-20 xl:px-52 py-4 bg-white backdrop-blur-md border-b border-gray-200 shadow-sm">
            {/* Logo */}
            <div className="cursor-pointer" onClick={handleLogoClick}>
                <img src={Logo} alt="TREEdu Logo" className="h-14 lg:h-16 w-auto object-contain" />
            </div>

            {/* Nav + Avatar */}
            <div className="flex items-center gap-8 lg:gap-12">
                {/* Navigation */}
                <nav className="hidden lg:block">
                    <ul className="flex items-center gap-8 text-gray-700 font-medium">
                        <li onClick={handleQuiz} className="cursor-pointer hover:text-lime-600 transition">
                            Bài quiz
                        </li>
                        <li onClick={handleFlashcard} className="cursor-pointer hover:text-lime-600 transition">
                            Flashcard
                        </li>
                        <li onClick={handleAi} className="cursor-pointer hover:text-lime-600 transition">
                            Phòng luyện phát âm
                        </li>
                        <li onClick={handleIntro} className="cursor-pointer hover:text-lime-600 transition">
                            Giới thiệu
                        </li>
                        <li className="cursor-pointer hover:text-lime-600 transition">
                            Liên lạc
                        </li>
                    </ul>
                </nav>

                {/* Avatar + Dropdown Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-10 h-10 lg:w-11 lg:h-11 rounded-full overflow-hidden border-2 border-gray-300 hover:border-lime-500 transition-all duration-200 hover:scale-105 shadow-md"
                    >
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </button>
                    {isMenuOpen && (
                        <>
                            {/* Overlay để click ngoài sẽ tắt */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={handleProfile}
                                    className="w-full px-5 py-3 text-left text-gray-700 hover:bg-lime-50 hover:text-lime-700 transition flex items-center gap-3"
                                >
                                    <span>Thông tin cá nhân</span>
                                </button>

                                <button
                                    onClick={handleHistory}
                                    className="w-full px-5 py-3 text-left text-gray-700 hover:bg-lime-50 hover:text-lime-700 transition flex items-center gap-3"
                                >
                                    <span>Lịch sử học tập</span>
                                </button>

                                <hr className="my-2 border-gray-200" />

                                <button
                                    onClick={handleLogout}
                                    className="w-full px-5 py-3 text-left text-red-600 hover:bg-red-50 transition flex items-center gap-3 font-medium"
                                >
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
