import React, { useState } from 'react';
import Header from "../../components/user/Header/Header";
import Footer from "../../components/Footer/Footer";
import { quizData, getUniqueTopics, getUniqueLevels } from "../../Data/dataQuiz";
import "../../styles/user/quiz.css";
import iconTime from "../../asset/User/time.png"
import iconQuestion from "../../asset/User/question.png"
import iconTopic from "../../asset/User/topic.png"

function QuizPage() {
    const [quizzes] = useState(quizData);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedTopic, setSelectedTopic] = useState('all');
    const [sortBy, setSortBy] = useState('title');

    const availableTopics = getUniqueTopics();
    const availableLevels = getUniqueLevels();

    const filteredQuizzes = quizzes.filter(quiz => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = selectedLevel === 'all' || quiz.level.toString() === selectedLevel;
        const matchesTopic = selectedTopic === 'all' || quiz.topic === selectedTopic;

        return matchesSearch && matchesLevel && matchesTopic;
    });

    const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
        switch(sortBy) {
            case 'title':
                return a.title.localeCompare(b.title);
            case 'duration':
                return parseInt(a.duration) - parseInt(b.duration);
            case 'questions':
                return a.questionCount - b.questionCount;
            case 'level':
                return a.level - b.level;
            default:
                return 0;
        }
    });
    const getLevelColor = (level) => {
        const colors = {
            1: '#28a745',
            2: '#20c997',
            3: '#ffc107',
            4: '#fd7e14',
            5: '#dc3545',
            6: '#6f42c1'
        };
        return colors[level] || '#6c757d';
    };

    const getLevelText = (level) => {
        return `Level ${level}`;
    };

    return (
        <div>
            <Header />
            <main className="quiz-page">
                <div className="container">
                    {/* Page Header */}
                    <div className="page-header">
                        <h1 className="page-title">Bài Tập Quiz</h1>
                        <p className="page-description">
                            Khám phá và thử thách bản thân với các bài quiz đa dạng từ Level 1 đến Level 6
                        </p>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="search-filter-section">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài quiz..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="filter-section">
                            <div className="filter-group">
                                <label>Cấp độ:</label>
                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">Tất cả</option>
                                    {availableLevels.map(level => (
                                        <option key={level} value={level}>
                                            Level {level}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Chủ đề:</label>
                                <select
                                    value={selectedTopic}
                                    onChange={(e) => setSelectedTopic(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">Tất cả</option>
                                    {availableTopics.map(topic => (
                                        <option key={topic} value={topic}>
                                            {topic}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Sắp xếp:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="title">Tên A-Z</option>
                                    <option value="duration">Thời gian</option>
                                    <option value="questions">Số câu hỏi</option>
                                    <option value="level">Cấp độ</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Results Info */}
                    <div className="results-info">
                        <span>Tìm thấy <strong>{sortedQuizzes.length}</strong> bài quiz</span>
                    </div>

                    {/* Quiz Grid */}
                    <div className="quiz-grid">
                        {sortedQuizzes.length > 0 ? (
                            sortedQuizzes.map(quiz => (
                                <div key={quiz.id} className="quiz-card">
                                    <div className="quiz-header">
                                        <h3 className="quiz-title">{quiz.title}</h3>
                                        <span
                                            className="quiz-level"
                                            style={{ backgroundColor: getLevelColor(quiz.level) }}
                                        >
                                            {getLevelText(quiz.level)}
                                        </span>
                                    </div>

                                    <p className="quiz-description">{quiz.description}</p>

                                    <div className="quiz-stats">
                                        <div className="stat-item">
                                            <span className="stat-icon">
                                                <img src={iconTime} alt="time"/>
                                            </span>
                                            <span className="stat-value">{quiz.duration}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-icon">
                                                <img src={iconQuestion} alt="time"/>
                                            </span>
                                            <span className="stat-value">{quiz.questionCount} câu</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-icon">
                                                <img src={iconTopic} alt="time"/>
                                            </span>
                                            <span className="stat-value">{quiz.topic}</span>
                                        </div>
                                    </div>

                                    <div className="quiz-actions">
                                        <button className="quiz-btn primary">Bắt đầu Quiz</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <h3>Không tìm thấy bài quiz nào</h3>
                                <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default QuizPage;