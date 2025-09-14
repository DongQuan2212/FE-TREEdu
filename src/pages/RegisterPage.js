import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import React, { useState } from 'react';
import Logo from "../asset/logo.png";
import '../styles/LoginPage.css';
import { useNavigate } from "react-router-dom";
const RegisterPage = () => {

    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [birthDate, setBirthDate] = useState('');

    const handleRegister = () => {
        navigate("/login")
    };

    return (
        <div>
            <Header />
            <main>
                <div className="login-page">
                    <button className="back-button" title="Quay lại">
                        ←
                    </button>

                    <div className="login-container">
                        <div className="login-header">
                            <div className="login-logo">
                                <div className="login-logo-icon">
                                    <img src={Logo}  alt=""/>
                                </div>
                            </div>
                            <h2 className="login-title">Chào mừng bạn!</h2>
                            <p className="login-subtitle">Tạo tài khoản để bắt đầu hành trình học tập</p>
                        </div>

                        <div className="login-form">
                            <div className="form-group">
                                <label className="form-label">Họ và tên</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Nhập họ và tên"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>

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
                            <div className="form-group">
                                <label className="form-label">Nhập lại mật khẩu</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Nhập mật khẩu"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Ngày sinh</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                />
                            </div>

                            <button className="login-button" onClick={handleRegister}>
                                Đăng Ký
                            </button>
                        </div>

                        <div className="register-link">
                            <p>Đã có tài khoản?</p>
                            <a href="/login">Đăng nhập ngay</a>
                        </div>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default RegisterPage;
