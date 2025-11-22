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
import AdminManagerUser from "../pages/admin/AdminManagerUser";
import AdminManagerEmployee from "../pages/admin/AdminManagerEmployee";
import CreateFlashcardPage from "../pages/user/CreateFlashcardPage";
import FlashcardDetailPage from "../pages/user/FlashcardDetailPage";
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
                <Route path="/flashcard/create" element={<CreateFlashcardPage />} />
                <Route path="/flashcard/detail/:id" element={<FlashcardDetailPage />} />



                {/* Admin Role */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/user" element={<AdminManagerUser/>} />
                <Route path="/admin/employee" element={<AdminManagerEmployee/>} />

                {/* Supporter Role */}
                <Route path="/supporter/dashboard" element={<SupporterDashboard />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
