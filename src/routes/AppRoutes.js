import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import SupporterDashboard from "../pages/supporter/SupporterDashboard";
import RegisterPage from "../pages/RegisterPage";
import Home from "../pages/user/Home";
import QuizPage from "../pages/user/QuizPage";
import IntroPage from "../pages/user/IntroPage";
import QuizTakingPage from "../pages/user/QuizTakingPage";
import DiscoverFlashCardPage from "../pages/user/DiscoverFlashCardPage";
import MyFlashCardPage from "../pages/user/MyFlashCardPage";
function AppRoutes() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage/>} />

                {/* User Routes */}
                <Route path="/home" element={<Home/>} />
                <Route path="/quiz" element={<QuizPage/>} />
                <Route path="/quiz/:quizId" element={<QuizTakingPage />} />
                <Route path="/intro" element={<IntroPage/>} />
                <Route path="flashcard/discover" element={<DiscoverFlashCardPage/>} />
                <Route path="/flashcard/me" element={<MyFlashCardPage/>} />
                <Route path="/flashcard" element={<MyFlashCardPage/>} />



                {/* Admin Role */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />

                {/* Supporter Role */}
                <Route path="/supporter/dashboard" element={<SupporterDashboard />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
