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
import RevenueReport from "../pages/admin/RevenueReport";
import QuizCreator from "../pages/supporter/QuizCreator";
import QuizList from "../pages/supporter/QuizList";
import QuizEdit from "../pages/supporter/QuizEdit";
import FlashcardList from "../pages/supporter/FlashcardList";
import FlashcardCreate from "../pages/supporter/FlashcardCreate";
import FlashcardWordManager from "../pages/supporter/FlashcardWordManager";
import PronunciationPracticePage from "../pages/user/PronunciationPracticePage";
import PronunciationPracticeDetailPage from "../pages/user/PronunciationPracticeDetailPage";
import VerifyEmailPage from "../pages/verify-result";
function AppRoutes() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage/>} />
                <Route path="/verify-result" element={<VerifyEmailPage />} />

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
                <Route path="/pronunciation-practice" element={<PronunciationPracticePage />} />
                <Route path="/pronunciation-practice/:topic" element={<PronunciationPracticeDetailPage />} />



                {/* Admin Role */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/user" element={<AdminManagerUser/>} />
                <Route path="/admin/employee" element={<AdminManagerEmployee/>} />
                <Route path="/admin/revenue" element={<RevenueReport/>} />

                {/* Supporter Role */}
                <Route path="/supporter/dashboard" element={<SupporterDashboard />} />
                <Route path="/supporter" element={<SupporterDashboard />} />
                <Route path="/supporter/quizzes" element={<QuizList />} />
                <Route path="/supporter/quizzes/create" element={<QuizCreator />} />
                <Route path="/supporter/quizzes/edit/:id" element={<QuizEdit />} />
                <Route path="/supporter/flashcards" element={<FlashcardList />} />
                <Route path="/supporter/flashcards/create" element={<FlashcardCreate />} />
                <Route path="/supporter/flashcards/edit/:id" element={<FlashcardWordManager />} />
                <Route path="/supporter/flashcards/:id/words" element={<FlashcardWordManager />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
