import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/api';

interface StudentResult {
  userName: string;
  score: number;
  correct: number;
  total: number;
  submitted_at: string;
  userId: string;
}

export function StudentResultsReview() {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState<any>(null);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load evaluation
        const evalRes = await api.get(`/evaluations/${evaluationId}`);
        setEvaluation(evalRes.data);

        // Load student results
        const resultsRes = await api.get(`/evaluations/${evaluationId}/student-results`);
        setResults(resultsRes.data);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat hasil');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [evaluationId]);

  if (loading) {
    return <div className="text-center py-12">Memuat hasil...</div>;
  }

  if (!evaluation) {
    return <div className="text-center py-12">Evaluasi tidak ditemukan</div>;
  }

  const avgScore = results.length > 0 
    ? (results.reduce((sum, r) => sum + parseFloat(String(r.score)), 0) / results.length).toFixed(1)
    : 0;

  const passCount = results.filter(r => parseFloat(String(r.score)) >= 60).length;
  const passRate = results.length > 0 
    ? ((passCount / results.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <button 
        onClick={() => navigate('/teacher/evaluations')}
        className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Evaluasi
      </button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Hasil Evaluasi: {evaluation.title}</h1>
        <p className="text-slate-500">{evaluation.questions.length} pertanyaan</p>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-slate-600 text-sm font-medium">Total Siswa</p>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{results.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-slate-600 text-sm font-medium">Rata-rata Nilai</p>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{avgScore}%</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-slate-600 text-sm font-medium">Lulus (≥60%)</p>
            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{passRate}%</p>
          <p className="text-xs text-slate-500">{passCount} dari {results.length} siswa</p>
        </div>
      </div>

      {/* Results Table */}
      {results.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Belum ada siswa yang mengerjakan evaluasi ini</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Nama Siswa</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Nilai</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Benar</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Waktu Submit</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => {
                const isPassing = parseFloat(String(result.score)) >= 60;
                return (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{result.userName}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                      {parseFloat(String(result.score)).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600">
                      {result.correct}/{result.total}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600">
                      {new Date(result.submitted_at).toLocaleDateString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        isPassing 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {isPassing ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Lulus
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" /> Belum Lulus
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
