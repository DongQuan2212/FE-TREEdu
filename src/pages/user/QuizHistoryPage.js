import React, { useEffect, useState } from 'react';
import { Eye, X, CheckCircle, XCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/user/Header';
import Footer from '../../components/Footer/Footer';
import axios from '../../config/axiosConfig';

const QuizHistoryPage = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/quiz/my-attempts');
        setAttempts(res.data.data || []);
      } catch (err) {
        setError('Không thể tải lịch sử làm bài.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const handleViewDetail = async (attemptId) => {
    try {
      setDetailLoading(true);
      const res = await axios.get(`/quiz/attempts/${attemptId}`);
      setSelectedAttempt(res.data.data);
    } catch (err) {
      alert('Không thể tải chi tiết bài làm');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedAttempt(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full mt-32 mb-12">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Lịch sử làm bài của bạn</h2>
                <p className="text-gray-600 mt-1">Tổng số lần làm bài: {attempts.length}</p>
              </div>
              <button
                onClick={() => navigate('/home')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
              >
                <Home size={18} />
                Quay về Trang chủ
              </button>
            </div>
          </div>
          <div className="px-8 py-6">
            {attempts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Bạn chưa làm bài quiz nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border rounded-lg overflow-hidden">
                  <thead className="bg-lime-100">
                    <tr>
                      <th className="py-3 px-4 text-left">#</th>
                      <th className="py-3 px-4 text-left">Tên Quiz</th>
                      <th className="py-3 px-4 text-center">Điểm</th>
                      <th className="py-3 px-4 text-center">Ngày làm</th>
                      <th className="py-3 px-4 text-center">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((item, idx) => (
                      <tr key={item.attemptId || idx} className="border-b hover:bg-lime-50 transition-colors">
                        <td className="py-3 px-4">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium">{item.quizTitle || 'Quiz'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-lime-100 text-lime-800">
                            {item.score ?? '-'}/{item.totalQuestions ?? '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {item.submittedAt 
                            ? new Date(item.submittedAt).toLocaleString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleViewDetail(item.attemptId)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors"
                          >
                            <Eye size={16} />
                            Xem
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Modal Chi tiết */}
      {selectedAttempt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{selectedAttempt.quizTitle}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Điểm: {selectedAttempt.score}/{selectedAttempt.totalQuestions} ({selectedAttempt.percentage?.toFixed(1)}%)
                </p>
                <p className="text-sm text-gray-500">
                  Làm bài lúc: {new Date(selectedAttempt.submittedAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedAttempt.results?.map((result, idx) => (
                    <div
                      key={result.questionId || idx}
                      className={`p-4 rounded-lg border-2 ${
                        result.correct
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-3">
                        {result.correct ? (
                          <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                        ) : (
                          <XCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Câu {idx + 1}: {result.content}
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Bạn chọn:</span>{' '}
                              <span className={result.correct ? 'text-green-700' : 'text-red-700'}>
                                {result.selectedAnswer}
                              </span>
                            </p>
                            {!result.correct && (
                              <p>
                                <span className="font-medium">Đáp án đúng:</span>{' '}
                                <span className="text-green-700">{result.correctAnswer}</span>
                              </p>
                            )}
                            {result.explanation && (
                              <p className="mt-2 text-gray-600 italic">
                                💡 {result.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizHistoryPage;