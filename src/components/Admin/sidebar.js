import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faUsers, faUserTie, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import Logo from "../../asset/logo.png";
import Lottie from "lottie-react";
import treeAnimation from "../../asset/tree.json";

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {

        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <img  src={Logo} alt="logo"/>
            </div>

            <nav className="sidebar-menu">
                <NavLink to="/admin" className="sidebar-item">
                    <FontAwesomeIcon icon={faHouse} />
                    <span>Trang chủ</span>
                </NavLink>

                <NavLink to="/admin/employee" className="sidebar-item">
                    <FontAwesomeIcon icon={faUserTie} />
                    <span>Quản lý nhân viên</span>
                </NavLink>

                <NavLink to="/admin/user" className="sidebar-item">
                    <FontAwesomeIcon icon={faUsers} />
                    <span>Quản lý người dùng</span>
                </NavLink>

                <button onClick={handleLogout} className="sidebar-item logout-btn">
                    <FontAwesomeIcon icon={faRightFromBracket} />
                    <span>Đăng xuất</span>
                </button>
            </nav>
            <div className="lottie">
                <Lottie animationData={treeAnimation} loop={true}/>
            </div>
        </div>
    );
};

export default Sidebar;
