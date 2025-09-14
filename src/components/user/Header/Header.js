import React from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';
import Logo from '../../../asset/logo.png';


const Header = () => {
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate("/");
    };

    return (
        <header className="header">
            {/* Logo bên trái */}
            <div className="header-logo" onClick={handleLogoClick}>
                <div className="header-logo-icon">
                    <img src={Logo} alt="logo"/>
                </div>
            </div>

            {/* Nav + Avatar bên phải */}
            <div className="header-right">
                <nav className="header-nav">
                    <ul>
                        <li>Bài quiz</li>
                        <li>Flashcard</li>
                        <li>Phòng luyện phát âm</li>
                        <li>Giới thiệu</li>
                        <li>Liên lạc</li>
                    </ul>
                </nav>
                <div className="header-avatar">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        alt="avatar"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
