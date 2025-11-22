import React from 'react';
import { Users, UserCheck } from 'lucide-react';
import Sidebar from "../../components/Admin/sidebar";
import '../../styles/admin/Homepage.css';

const AdminHomepage = () => {
    const handleNavigate = (path) => {

        console.log('Navigate to:', path);
    };

    return (
        <div className="admin-wrapper">
            <Sidebar />
            <div className="admin-content">
                <div className="admin-homepage">
                    {/* Header with Avatar */}
                    <div className="homepage-header">
                        <div className="avatar-section">
                            <div className="admin-avatar">
                                <span>A</span>
                            </div>
                            <div className="admin-info">
                                <span className="admin-name">Admin</span>
                                <span className="admin-role">Quản trị viên</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="homepage-content">
                        {/* Welcome Section */}
                        <div className="welcome-section">
                            <h1 className="welcome-title">Chào mừng Admin đã quay trở lại! 👋</h1>
                            <p className="welcome-subtitle">Quản lý hệ thống và theo dõi hoạt động</p>
                        </div>

                        {/* Cards Section */}
                        <div className="cards-section">
                            {/* Employee Management Card */}
                            <div className="management-card">
                                <div className="card-icon employee-icon">
                                    <UserCheck size={32} />
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">Quản lý nhân viên</h3>
                                    <p className="card-description">
                                        Quản lý thông tin nhân viên, phân quyền và theo dõi hoạt động của đội ngũ.
                                    </p>
                                </div>
                                <div className="card-actions">
                                    <button
                                        className="btn-primary"
                                        onClick={() => handleNavigate('/admin/employees')}
                                    >
                                        Xem tất cả
                                    </button>
                                </div>
                            </div>

                            {/* User Management Card */}
                            <div className="management-card">
                                <div className="card-icon user-icon">
                                    <Users size={32} />
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">Quản lý người dùng</h3>
                                    <p className="card-description">
                                        Quản lý tài khoản người dùng, trạng thái và quyền truy cập hệ thống.
                                    </p>
                                </div>
                                <div className="card-actions">
                                    <button
                                        className="btn-primary"
                                        onClick={() => handleNavigate('/admin/users')}
                                    >
                                        Xem tất cả
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHomepage;
