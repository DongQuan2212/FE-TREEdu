import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../../components/user/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getQuizById, getQuestionsByQuizId } from "../../Data/dataQuiz";
import "../../styles/user/quizTakingPage.css";

function QuizTakingPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});

    // Khởi tạo quiz
    useEffect(() => {
        const quizData = getQuizById(quizId);
        if (!quizData) {
            navigate('/quiz');
            return;
        }

        const quizQuestions = getQuestionsByQuizId(quizId);
        if (quizQuestions.length === 0) {
            navigate('/quiz');
            return;
        }

        setQuiz(quizData);
        setQuestions(quizQuestions);
    }, [quizId, navigate]);

    const handleAnswerSelect = (questionId, answer) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const renderQuestion = (question) => {
        const userAnswer = userAnswers[question.id];

        switch (question.type) {
            case 'multiple-choice':
                return (
                    <div className="question-options">
                        {question.options.map((option, index) => (
                            <div
                                key={index}
                                className={`option ${userAnswer === index ? 'selected' : ''}`}
                                onClick={() => handleAnswerSelect(question.id, index)}
                            >
                                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                <span className="option-text">{option}</span>
                            </div>
                        ))}
                    </div>
                );

            case 'true-false':
                return (
                    <div className="question-options">
                        {[true, false].map((value, index) => (
                            <div
                                key={index}
                                className={`option ${userAnswer === value ? 'selected' : ''}`}
                                onClick={() => handleAnswerSelect(question.id, value)}
                            >
                                <span className="option-letter">{value ? 'T' : 'F'}</span>
                                <span className="option-text">{value ? 'Đúng' : 'Sai'}</span>
                            </div>
                        ))}
                    </div>
                );

            case 'fill-in-blank':
                return (
                    <div className="fill-blank-container">
                        <input
                            type="text"
                            className="fill-blank-input"
                            value={userAnswer || ''}
                            onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                            placeholder="Nhập câu trả lời..."
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    if (!quiz || questions.length === 0) {
        return <div className="loading">Đang tải...</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div>
            <Header />
            <main className="quiz-taking-page">
                <div className="container">
                    {/* Quiz Header */}
                    <div className="quiz-header">
                        <h1 className="quiz-title">{quiz.title}</h1>
                        <div className="quiz-info">
                            <div className="time-remaining">
                                <span className="time-icon">⏱️</span>
                                <span className="time-text">15:00</span>
                            </div>
                            <div className="question-progress">
                                <span>Câu {currentQuestionIndex + 1}/{questions.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Question Navigation */}
                    <div className="question-nav">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                className={`nav-dot ${index === currentQuestionIndex ? 'active' : ''} 
                                    ${userAnswers[questions[index].id] !== undefined ? 'answered' : ''}`}
                                onClick={() => setCurrentQuestionIndex(index)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    {/* Current Question */}
                    <div className="question-container">
                        <div className="question-header">
                            <h2 className="question-text">
                                {currentQuestion.question}
                            </h2>
                        </div>

                        {renderQuestion(currentQuestion)}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="question-navigation">
                        <button
                            className="nav-btn secondary"
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                        >
                            ← Câu trước
                        </button>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <button
                                className="nav-btn primary submit-btn"
                                onClick={() => alert('Nộp bài thành công!')}
                            >
                                Nộp bài
                            </button>
                        ) : (
                            <button
                                className="nav-btn primary"
                                onClick={handleNextQuestion}
                            >
                                Câu tiếp →
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default QuizTakingPage;