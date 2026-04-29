import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle2, AlertCircle, Play, Award, Clock, ArrowLeft, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useData } from '../../context/DataContext';
import api from '../../../lib/api';

interface Evaluation {
  id: string;
  title: string;
  course_id: string;
  module_id: string;
}

interface StudentResult {
  evaluationId: string;
  evaluationTitle: string;
  score: number;
  correct: number;
  total: number;
  submittedAt: string;
}

export function EvaluationsList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { courses } = useData();
  
  // Get courseId and moduleId from query params
  const queryCourseId = searchParams.get('courseId');
  const queryModuleId = searchParams.get('moduleId');
  
  const [selectedCourse, setSelectedCourse] = useState<string | null>(queryCourseId);
  const [selectedModule, setSelectedModule] = useState<string | null>(queryModuleId);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [results, setResults] = useState<Map<string, StudentResult>>(new Map());
  const [loading, setLoading] = useState(false);

  // Load student's evaluation results once on mount
  useEffect(() => {
    const loadResults = async () => {
      try {
        const resultsRes = await api.get('/my-evaluation-results');
        const resultsMap = new Map();
        resultsRes.data.forEach((result: any) => {
          resultsMap.set(result.evaluationId, result);
        });
        setResults(resultsMap);
      } catch (err) {
        console.error(err);
      }
    };
    loadResults();
  }, []);

  // Load evaluations when module is selected
  useEffect(() => {
    if (!selectedCourse || !selectedModule) {
      setEvaluations([]);
      return;
    }

    const loadEvaluations = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/courses/${selectedCourse}/modules/${selectedModule}/evaluations`);
        setEvaluations(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat evaluasi');
      } finally {
        setLoading(false);
      }
    };

    loadEvaluations();
  }, [selectedCourse, selectedModule]);

  const handleTakeEvaluation = (evalId: string) => {
    navigate(`/student/evaluations/${evalId}/take`);
  };

  const currentCourse = courses.find(c => c.id === selectedCourse);
  const currentModule = currentCourse?.modules.find(m => m.id === selectedModule);

  if (!selectedCourse) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Evaluasi Saya</h1>
          <p className="text-slate-500 mt-2">Pilih kursus untuk melihat evaluasi yang tersedia</p>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Belum ada kursus tersedia</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedCourse(course.id)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all p-6 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">{course.title}</h3>
                    <div className="text-sm text-slate-600 mb-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: course.description }} />
                    <p className="text-xs text-slate-500">{course.modules.length} modul tersedia</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!selectedModule) {
    return (
      <div className="space-y-8">
        <button
          onClick={() => setSelectedCourse(null)}
          className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Kursus
        </button>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">{currentCourse?.title}</h1>
          <p className="text-slate-500 mt-2">Pilih modul untuk melihat evaluasi terkait</p>
        </div>

        {currentCourse?.modules.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Belum ada modul dalam kursus ini</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {currentCourse?.modules.map((module, idx) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedModule(module.id)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all p-6 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">{module.title}</h3>
                    <div className="text-sm text-slate-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: module.description }} />
                  </div>
                  <ArrowLeft className="w-5 h-5 text-slate-400 rotate-180" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => setSelectedModule(null)}
        className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Modul
      </button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">{currentModule?.title}</h1>
        <p className="text-slate-500 mt-1">{currentCourse?.title}</p>
        <p className="text-slate-500 mt-2">Evaluasi untuk modul ini</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Memuat evaluasi...</div>
      ) : evaluations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Belum ada evaluasi untuk modul ini</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {evaluations.map((evaluation) => {
            const result = results.get(evaluation.id);
            const isPassing = result && result.score >= 60;

            return (
              <motion.div 
                key={evaluation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{evaluation.title}</h3>
                    
                    {result ? (
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          {isPassing ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                          )}
                          <span className="text-sm font-semibold" style={{ color: isPassing ? '#10b981' : '#f59e0b' }}>
                            {parseFloat(String(result.score)).toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">
                          {result.correct}/{result.total} benar
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(result.submittedAt || result.submitted_at).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Belum dikerjakan
                      </p>
                    )}
                  </div>

                  {!result ? (
                    <button 
                      onClick={() => handleTakeEvaluation(evaluation.id)}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                    >
                      <Play className="w-5 h-5" /> Mulai Kuis
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-6 py-3 text-slate-600">
                      <Award className="w-5 h-5" />
                      <span className="text-sm font-semibold">Selesai</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
