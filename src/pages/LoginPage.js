import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import React, { useState } from 'react';
import Logo from "../asset/logo.png"
import '../styles/LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        console.log('Đăng nhập:', { email, password });
        alert('Đăng nhập thành công!');
    };

    return (
        <div>
            <Header/>
        <main>
        <div className="login-page">
            <button className="back-button" title="Quay lại">
                ←
            </button>

            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        <div className="login-logo-icon">
                            <img src={Logo}/>
                        </div>
                    </div>
                    <h2 className="login-title">Chào mừng bạn trở lại!</h2>
                    <p className="login-subtitle">Đăng nhập để tiếp tục hành trình học tập</p>
                </div>

                <div className="login-form">
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Nhập email của bạn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="forgot-password">
                        <a href="#">Quên mật khẩu?</a>
                    </div>

                    <button className="login-button" onClick={handleLogin}>
                        Đăng Nhập
                    </button>
                </div>
                <div className="register-link">
                    <p>Chưa có tài khoản?</p>
                    <a href="#">Đăng ký ngay</a>
                </div>
            </div>
        </div>
        </main>
            <Footer/>
        </div>
    );
};

export default LoginPage;