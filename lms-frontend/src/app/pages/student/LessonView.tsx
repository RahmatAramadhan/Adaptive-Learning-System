import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { VisualLesson } from '../../components/Learning/VisualLesson';
import { AuditoryLesson } from '../../components/Learning/AuditoryLesson';
import { KinestheticLesson } from '../../components/Learning/KinestheticLesson';
import { Eye, Headphones, Hand, ArrowLeft, ArrowRight, Loader2, ShieldAlert, CheckCircle2, Play } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../../../lib/api';

const styleIcons = {
  visual: { icon: Eye, label: 'Visual', color: 'from-blue-500 to-blue-600' },
  auditori: { icon: Headphones, label: 'Auditory', color: 'from-purple-500 to-purple-600' },
  kinestetik: { icon: Hand, label: 'Kinesthetic', color: 'from-orange-500 to-orange-600' },
};

export function LessonView() {
  const { courseId, moduleId } = useParams();
  const { courses, updateProgress, fetchStats, loadingCourses } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const timeSpentRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [pretestLoading, setPretestLoading] = useState(true);
  const [pretestEvaluation, setPretestEvaluation] = useState<any>(null);
  const [pretestPassed, setPretestPassed] = useState(false);
  const [pretestError, setPretestError] = useState<string | null>(null);

  const course = courses.find(c => c.id === courseId);
  const module = course?.modules.find(m => m.id === moduleId);

  if (loadingCourses) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-40" />
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-8 bg-slate-200 rounded w-72" />
            <div className="h-5 bg-slate-200 rounded w-48" />
          </div>
          <div className="h-12 bg-slate-200 rounded-xl w-56" />
        </div>
        <div className="h-[480px] bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  useEffect(() => {
    const loadPretest = async () => {
      if (!courseId || !moduleId) {
        setPretestLoading(false);
        return;
      }

      try {
        setPretestLoading(true);
        setPretestError(null);

        const [evaluationsRes, resultsRes] = await Promise.all([
          api.get(`/courses/${courseId}/modules/${moduleId}/evaluations`),
          api.get('/my-evaluation-results'),
        ]);

        const pretest = (evaluationsRes.data || []).find((evaluation: any) => {
          return String(evaluation.title || '').trim().toUpperCase() === 'PRE TEST';
        }) || null;

        setPretestEvaluation(pretest);

        if (!pretest) {
          setPretestPassed(false);
          return;
        }

        const pretestResult = (resultsRes.data || []).find((result: any) => {
          return String(result.evaluationId) === String(pretest.id) && Number(result.score) >= 60;
        });

        setPretestPassed(Boolean(pretestResult));
      } catch (error) {
        console.error('Gagal memuat pretest:', error);
        setPretestError('Gagal memuat pretest. Coba muat ulang halaman.');
      } finally {
        setPretestLoading(false);
      }
    };

    loadPretest();
  }, [courseId, moduleId]);

  // Track time spent on lesson only after pretest is passed
  useEffect(() => {
    if (!pretestPassed) {
      return;
    }

    // Start timer when component mounts
    timerRef.current = setInterval(() => {
      timeSpentRef.current += 1;
    }, 1000); // Update every second

    // Cleanup timer when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [pretestPassed]);

  if (!course || !module) {
    return <div>Lesson not found</div>;
  }

  // Gunakan learning style yang sudah ditetapkan untuk student
  const studentStyle = (currentUser?.learning_style?.result || 'visual') as keyof typeof styleIcons;
  const styleInfo = styleIcons[studentStyle];
  const StyleIcon = styleInfo.icon;

  const takePretest = () => {
    if (!pretestEvaluation) {
      return;
    }

    const returnTo = encodeURIComponent(`/student/learn/${courseId}/${moduleId}`);
    navigate(`/student/evaluations/${pretestEvaluation.id}/take?returnTo=${returnTo}`);
  };

  if (pretestLoading) {
    return (
      <div className="min-h-[480px] flex items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Memuat pretest...</span>
        </div>
      </div>
    );
  }

  if (!pretestPassed) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Course
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Pretest wajib sebelum materi dibuka</h1>
              <p className="text-slate-500">
                Selesaikan evaluasi <span className="font-semibold text-slate-700">PRE TEST</span> untuk membuka materi pada modul ini.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-3">
            <p className="text-sm text-slate-600">Kursus</p>
            <p className="text-lg font-semibold text-slate-900">{course.title}</p>
            <p className="text-sm text-slate-600 mt-4">Modul</p>
            <p className="text-lg font-semibold text-slate-900">{module.title}</p>
          </div>

          {pretestEvaluation ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={takePretest}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-md"
              >
                <Play className="w-5 h-5" /> Mulai PRE TEST
              </button>
              <div className="text-sm text-slate-500">
                Lulus jika nilai minimal 60%.
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
              Evaluasi PRE TEST belum ditemukan untuk modul ini.
            </div>
          )}

          {pretestError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {pretestError}
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleCompleteLesson = async () => {
    if (courseId && moduleId) {
      await updateProgress({
        courseId: String(courseId),
        moduleId: String(moduleId),
        completed: true,
        score: 0,
        timeSpent: timeSpentRef.current,
      });
      await fetchStats();
    }
    navigate(`/student/evaluations?courseId=${courseId}&moduleId=${moduleId}`);
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Course
      </button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">{module.title}</h1>
           <p className="text-slate-500 mt-1">{course.title}</p>
        </div>
        
        {/* Learning Style Badge - tidak bisa diubah */}
        <div className={`bg-gradient-to-r ${styleInfo.color} text-white px-4 py-3 rounded-xl shadow-md whitespace-nowrap`}>
          <div className="flex items-center gap-2">
            <StyleIcon className="w-5 h-5" />
            <div>
              <p className="text-xs font-medium opacity-90">Your Learning Style</p>
              <p className="text-sm font-bold">{styleInfo.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Konten sesuai learning style student */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {studentStyle === 'visual' && <VisualLesson content={module.content.visual} />}
        {studentStyle === 'auditori' && <AuditoryLesson content={module.content.auditory} />}
        {studentStyle === 'kinestetik' && <KinestheticLesson content={module.content.kinesthetic} />}
      </motion.div>

      <div className="flex justify-end pt-8 border-t border-slate-200">
        <button 
          onClick={handleCompleteLesson}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Complete & Take Quiz <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
