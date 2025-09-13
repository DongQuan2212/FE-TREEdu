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
                            <img src={Logo} alt=""/>
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
                        <li><a href="#">Flash Card</a></li>
                        <li><a href="#">Bài Quiz</a></li>
                        <li><a href="#">Phòng luyện phát âm</a></li>
                    </ul>
                </div>

                {/* About Section */}
                <div className="footer-section">
                    <h3>Về TREEdu</h3>
                    <ul className="footer-links">
                        <li><a href="#">Giới thiệu</a></li>
                        <li><a href="#">Phương pháp phát triển</a></li>
                        <li><a href="#">Liên hệ</a></li>
                    </ul>
                </div>
                {/* Support Section */}
                <div className="footer-section">
                    <h3>Quyền riêng tư và điều khoản</h3>
                    <ul className="footer-links">
                        <li><a href="#">Nội quy</a></li>
                        <li><a href="#">Điều khoản</a></li>
                        <li><a href="#">Chính sách bảo mật</a></li>

                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;