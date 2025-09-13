import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import SupporterDashboard from "../pages/supporter/SupporterDashboard";
function AppRoutes() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />



                {/* Admin Role */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />

                {/* Supporter Role */}
                <Route path="/supporter/dashboard" element={<SupporterDashboard />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
