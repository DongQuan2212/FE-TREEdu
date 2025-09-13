import React from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';
import Logo from '../../asset/logo.png'
const Header = () => {
    const navigate = useNavigate();
    const handleStart = () => {
        navigate("/login");
    };
    const handleLogoClick = () => {
        navigate("/");
    };

    return (
        <header className="header">
            <div className="header-logo" onClick={handleLogoClick}>
                <div className="header-logo-icon">
                    <img  src={Logo} alt="logo"/>
                </div>
            </div>

            <button
                className="header-btn"
                onClick={handleStart}
            >
                Bắt Đầu
            </button>
        </header>
    );
};

export default Header;