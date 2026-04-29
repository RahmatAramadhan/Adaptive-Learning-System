import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Evaluation } from '../../types';
import { ArrowLeft, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/api';

export function TakeEvaluation() {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const loadEvaluation = async () => {
      try {
        const res = await api.get(`/evaluations/${evaluationId}`);
        
        // Parse options if they're strings (from backend)
        const parsedQuestions = res.data.questions.map((q: any) => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }));
        
        const evaluationData = {
          ...res.data,
          questions: parsedQuestions
        };
        
        setEvaluation(evaluationData);
        
        // Initialize answers
        const initialAnswers: Record<string, number> = {};
        parsedQuestions.forEach((q: any) => {
          initialAnswers[q.id] = -1; // -1 means no answer selected
        });
        setAnswers(initialAnswers);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat evaluasi');
      } finally {
        setLoading(false);
      }
    };
    loadEvaluation();
  }, [evaluationId]);

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    // Check if all questions answered
    const unanswered = Object.values(answers).some(a => a === -1);
    if (unanswered) {
      toast.error('Jawab semua pertanyaan sebelum submit');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/evaluations/${evaluationId}/submit`, { answers });
      setResult(res.data);
      setSubmitted(true);
      toast.success('Evaluasi berhasil disubmit!');
    } catch (err) {
      console.error(err);
      toast.error('Gagal submit evaluasi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Memuat evaluasi...</div>;
  }

  if (!evaluation) {
    return <div className="text-center py-12">Evaluasi tidak ditemukan</div>;
  }

  if (submitted) {
    const percentage = result?.score || 0;
    const isPassing = percentage >= 60;

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <button 
          onClick={() => navigate('/student/evaluations')}
          className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar Evaluasi
        </button>

        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-6">
          <div className="flex justify-center">
            {isPassing ? (
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            ) : (
              <AlertCircle className="w-16 h-16 text-orange-500" />
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{evaluation.title}</h1>
            <p className="text-slate-500">Evaluasi selesai!</p>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-8 space-y-4">
            <div>
              <p className="text-slate-600 text-sm">Skor Anda</p>
              <p className="text-5xl font-bold text-indigo-600">{percentage.toFixed(1)}%</p>
            </div>
            <div className="flex justify-around text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{result?.correct}</p>
                <p className="text-xs text-slate-600">Benar</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-600">{result?.total}</p>
                <p className="text-xs text-slate-600">Total</p>
              </div>
            </div>
          </div>

          <p className={`text-lg font-semibold ${isPassing ? 'text-green-600' : 'text-orange-600'}`}>
            {isPassing ? '✓ Anda lulus! Sempurna!' : '○ Coba lagi di waktu berikutnya'}
          </p>

          <button 
            onClick={() => navigate('/student/evaluations')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.values(answers).filter(a => a !== -1).length;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <button 
        onClick={() => navigate('/student/evaluations')}
        className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar Evaluasi
      </button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{evaluation.title}</h1>
        <p className="text-slate-500">Jawab semua {evaluation.questions.length} pertanyaan</p>
        <div className="mt-4 text-sm text-slate-600">
          Terjawab: <span className="font-bold text-indigo-600">{answeredCount}/{evaluation.questions.length}</span>
        </div>
      </div>

      <div className="space-y-6">
        {evaluation.questions.map((question, qIndex) => (
          <div key={question.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-4 whitespace-pre-wrap text-justify">
                {qIndex + 1}. {question.text}
              </h3>
              
              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <label key={optIndex} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-indigo-200">
                    <input 
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answers[question.id] === optIndex}
                      onChange={() => handleAnswerChange(question.id, optIndex)}
                      className="w-4 h-4 text-indigo-600 mt-0.5"
                    />
                    <span className="text-slate-800 whitespace-pre-wrap text-justify">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 -m-8 mt-8 flex justify-between items-center">
        <p className="text-sm text-slate-600">
          {answeredCount === evaluation.questions.length ? (
            <span className="text-green-600 font-semibold">✓ Semua pertanyaan terjawab</span>
          ) : (
            <span className="text-orange-600">⚠ {evaluation.questions.length - answeredCount} pertanyaan belum dijawab</span>
          )}
        </p>
        <button 
          onClick={handleSubmit}
          disabled={submitting || answeredCount < evaluation.questions.length}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" /> {submitting ? 'Mengirim...' : 'Submit Jawaban'}
        </button>
      </div>
    </div>
  );
}
