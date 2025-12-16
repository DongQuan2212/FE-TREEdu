import React, { useEffect, useState } from 'react';
import { Eye, X, CheckCircle, XCircle, ArrowLeft, Trophy, Clock, Target, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/user/Header';
import Footer from '../../components/Footer/Footer';
import axiosInstance from '../../config/axiosConfig'; // Sử dụng instance đồng bộ

const QuizHistoryPage = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Tính toán thống kê nhanh
  const stats = {
    total: attempts.length,
    avgScore: attempts.length > 0
        ? (attempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions * 10), 0) / attempts.length).toFixed(1)
        : 0,
    bestScore: attempts.length > 0
        ? Math.max(...attempts.map(a => (a.score / a.totalQuestions * 10))).toFixed(1)
        : 0
  };

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/quiz/my-attempts');
        // Giả sử API trả về data.data là mảng
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
      const res = await axiosInstance.get(`/quiz/attempts/${attemptId}`);
      setSelectedAttempt(res.data.data);
    } catch (err) {
      alert('Không thể tải chi tiết bài làm');
    } finally {
      setDetailLoading(false);
    }
  };

  // Format ngày tháng đẹp hơn
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
        <>
          <Header />
          <main className="min-h-screen bg-zinc-50 pt-32 pb-12 px-6">
            <div className="max-w-5xl mx-auto">
              <div className="h-32 bg-gray-200 rounded-xl animate-pulse mb-8"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>)}
              </div>
            </div>
          </main>
          <Footer />
        </>
    );
  }

  if (error) {
    return (
        <>
          <Header />
          <main className="min-h-screen bg-zinc-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="underline text-zinc-800">Tải lại trang</button>
            </div>
          </main>
          <Footer />
        </>
    );
  }

  return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <Header />

        <main className="flex-1 pt-28 pb-20 px-6 sm:px-8">
          <div className="max-w-7xl mx-auto mt-8">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-5xl font-bold text-zinc-900 tracking-tight">Lịch sử làm bài</h1>
                <p className="text-zinc-500 mt-1">Xem lại tiến độ và kết quả học tập của bạn.</p>
              </div>
              <button
                  onClick={() => navigate('/quiz')}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all text-sm font-medium shadow-sm"
              >
                <ArrowLeft size={16} />
                Thư viện Quiz
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Target size={24} />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 font-medium">Tổng số bài làm</p>
                  <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Trophy size={24} />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 font-medium">Điểm trung bình</p>
                  <p className="text-2xl font-bold text-zinc-900">{stats.avgScore}/10</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 font-medium">Kết quả tốt nhất</p>
                  <p className="text-2xl font-bold text-zinc-900">{stats.bestScore}/10</p>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              {attempts.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="text-zinc-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">Chưa có lịch sử làm bài</h3>
                    <p className="text-zinc-500 mb-6 max-w-sm mx-auto">Bạn chưa thực hiện bài kiểm tra nào. Hãy bắt đầu ngay để kiểm tra kiến thức!</p>
                    <button
                        onClick={() => navigate('/quiz')}
                        className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition font-medium"
                    >
                      Làm bài Quiz ngay
                    </button>
                  </div>
              ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Tên bài Quiz</th>
                        <th className="px-6 py-4 font-semibold text-center">Kết quả</th>
                        <th className="px-6 py-4 font-semibold text-center">Ngày thực hiện</th>
                        <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                      {attempts.map((item, idx) => (
                          <tr key={item.attemptId || idx} className="hover:bg-zinc-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-zinc-900 text-base">{item.quizTitle || 'Bài kiểm tra không tên'}</div>
                              <div className="text-zinc-400 text-xs mt-0.5">ID: #{item.attemptId?.toString().slice(-6)}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                                        (item.score / item.totalQuestions) >= 0.8 ? 'bg-emerald-100 text-emerald-700' :
                                                            (item.score / item.totalQuestions) >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                    }`}>
                                                        {item.score}/{item.totalQuestions}
                                                    </span>
                            </td>
                            <td className="px-6 py-4 text-center text-zinc-500 flex items-center justify-center gap-2 h-full">
                              {item.submittedAt ? formatDate(item.submittedAt) : '-'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                  onClick={() => handleViewDetail(item.attemptId)}
                                  className="text-zinc-600 hover:text-emerald-600 font-medium hover:underline transition-colors flex items-center justify-end gap-1 ml-auto"
                              >
                                <Eye size={16} />
                                Chi tiết
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

        {/* Modal Detail - Minimalist Style */}
        {selectedAttempt && (
            <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 rounded-t-2xl">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900">{selectedAttempt.quizTitle}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                      {formatDate(selectedAttempt.submittedAt)}
                                    </span>
                      <span>•</span>
                      <span className={`font-semibold ${
                          (selectedAttempt.score / selectedAttempt.totalQuestions) >= 0.5 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                                        Điểm: {selectedAttempt.score}/{selectedAttempt.totalQuestions} ({selectedAttempt.percentage?.toFixed(0)}%)
                                    </span>
                    </div>
                  </div>
                  <button
                      onClick={() => setSelectedAttempt(null)}
                      className="p-2 bg-white border border-zinc-200 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/30">
                  {detailLoading ? (
                      <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
                      </div>
                  ) : (
                      <div className="space-y-4">
                        {selectedAttempt.results?.map((result, idx) => (
                            <div
                                key={result.questionId || idx}
                                className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm"
                            >
                              <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                  {result.correct ? (
                                      <CheckCircle className="text-emerald-500" size={24} />
                                  ) : (
                                      <XCircle className="text-red-500" size={24} />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-zinc-900 font-medium text-lg mb-3">
                                    <span className="text-zinc-400 mr-2">Câu {idx + 1}:</span>
                                    {result.content}
                                  </h4>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    {/* User Answer */}
                                    <div className={`p-3 rounded-lg border ${
                                        result.correct
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                                            : 'bg-red-50 border-red-100 text-red-800'
                                    }`}>
                                      <span className="block text-xs uppercase font-bold opacity-70 mb-1">Bạn chọn</span>
                                      {result.selectedAnswer}
                                    </div>

                                    {/* Correct Answer (Show only if wrong) */}
                                    {!result.correct && (
                                        <div className="p-3 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700">
                                          <span className="block text-xs uppercase font-bold opacity-70 mb-1">Đáp án đúng</span>
                                          {result.correctAnswer}
                                        </div>
                                    )}
                                  </div>

                                  {/* Explanation */}
                                  {result.explanation && (
                                      <div className="mt-3 text-sm text-zinc-500 italic bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                        <span className="font-semibold not-italic text-zinc-700">Giải thích: </span>
                                        {result.explanation}
                                      </div>
                                  )}
                                </div>
                              </div>
                            </div>
                        ))}
                      </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-zinc-100 bg-white rounded-b-2xl flex justify-end">
                  <button
                      onClick={() => setSelectedAttempt(null)}
                      className="px-6 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium rounded-lg transition-colors"
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
