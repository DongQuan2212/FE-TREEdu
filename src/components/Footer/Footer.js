import React from 'react';
import './Footer.css';
import Logo from "../../asset/logo.png"

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Brand Section */}
                <div className="footer-section">
                    <div className="footer-logo">
                        <div className="footer-logo-icon">
                            <img src={Logo} alt="TREEdu Logo" />
                        </div>
                        <h2 className="footer-logo-text">TREEdu</h2>
                    </div>
                    <p className="footer-description">
                        Học Tiếng Việt miễn phí, vui nhộn và hiệu quả cùng TREEdu. Phương pháp học tập hiện đại giúp bạn tiến bộ mỗi ngày.
                    </p>
                </div>

                {/* Courses Section */}
                <div className="footer-section">
                    <h3>Chức năng</h3>
                    <ul className="footer-links">
                        <li><a href="/flashcard">Flash Card</a></li>
                        <li><a href="/quiz">Bài Quiz</a></li>
                        <li><a href="/pronunciation-practice">Phòng luyện phát âm</a></li>
                        <li><a href="/dictation">Nghe chép chính tả</a></li>
                    </ul>
                </div>

                {/* About Section */}
                <div className="footer-section">
                    <h3>Về TREEdu</h3>
                    <ul className="footer-links">
                        <li><a href="/intro">Giới thiệu</a></li>

                    </ul>
                </div>

                {/* Support Section */}
                <div className="footer-section">
                    <h3>Quyền riêng tư và điều khoản</h3>
                    <ul className="footer-links">
                        <li><a href="#">Nội quy</a></li>

                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
