import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Evaluation } from '../../types';
import { Plus, Edit, Trash2, Eye, AlertCircle, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import api from '../../../lib/api';

interface CourseOption {
  id: string;
  title: string;
  modules: { id: string; title: string }[];
}

export function EvaluationsManagement() {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [evaluationsRes, coursesRes] = await Promise.all([
        api.get('/evaluations'),
        api.get('/courses')
      ]);
      setEvaluations(evaluationsRes.data);
      setCourses(coursesRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (evalId: string) => {
    if (!confirm('Hapus evaluasi ini? Ini tidak bisa dibatalkan.')) return;

    try {
      await api.delete(`/evaluations/${evalId}`);
      setEvaluations(evaluations.filter(e => e.id !== evalId));
      toast.success('Evaluasi berhasil dihapus');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus evaluasi');
    }
  };

  // Group evaluations by course and module
  const getEvaluationsForModule = (courseId: string, moduleId: string) => {
    return evaluations.filter(
      e => String(e.course_id) === String(courseId) && String(e.module_id) === String(moduleId)
    );
  };

  if (loading) {
    return <div className="text-center py-12">Memuat evaluasi...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kelola Evaluasi</h1>
          <p className="text-slate-500 mt-1">Buat, edit, dan kelola kuis untuk siswa Anda</p>
        </div>
        <button 
          onClick={() => navigate('/teacher/evaluations/create')}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" /> Buat Evaluasi Baru
        </button>
      </div>

      {evaluations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-6">Belum ada evaluasi. Buat yang pertama untuk memulai!</p>
          <button 
            onClick={() => navigate('/teacher/evaluations/create')}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5 inline mr-2" /> Buat Evaluasi
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => {
            const courseEvaluations = evaluations.filter(e => String(e.course_id) === String(course.id));
            
            return (
              <div key={course.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Course Header */}
                <button
                  onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                  className="w-full p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="text-indigo-600">
                    {expandedCourse === course.id ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </div>
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>
                    <p className="text-sm text-slate-500">{courseEvaluations.length} evaluasi</p>
                  </div>
                </button>

                {/* Modules & Evaluations */}
                {expandedCourse === course.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-slate-200 divide-y divide-slate-200"
                  >
                    {course.modules.map((module) => {
                      const moduleEvaluations = getEvaluationsForModule(course.id, module.id);
                      
                      return (
                        <div key={`${course.id}-${module.id}`}>
                          {/* Module Header */}
                          <button
                            onClick={() => setExpandedModule(
                              expandedModule === `${course.id}-${module.id}` ? null : `${course.id}-${module.id}`
                            )}
                            className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left bg-slate-50"
                            disabled={moduleEvaluations.length === 0}
                          >
                            <div className="ml-8 text-slate-400">
                              {moduleEvaluations.length > 0 ? (
                                expandedModule === `${course.id}-${module.id}` ? (
                                  <ChevronDown className="w-5 h-5" />
                                ) : (
                                  <ChevronRight className="w-5 h-5" />
                                )
                              ) : null}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">{module.title}</h4>
                              <p className="text-sm text-slate-500">{moduleEvaluations.length} evaluasi</p>
                            </div>
                          </button>

                          {/* Evaluations List */}
                          {expandedModule === `${course.id}-${module.id}` && moduleEvaluations.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="bg-white space-y-2 p-4"
                            >
                              {moduleEvaluations.map((evaluation) => (
                                <div
                                  key={evaluation.id}
                                  className="ml-12 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow"
                                >
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-slate-900">{evaluation.title}</h5>
                                    <p className="text-sm text-slate-600">{evaluation.questions.length} pertanyaan</p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => navigate(`/teacher/evaluations/${evaluation.id}/results`)}
                                      className="flex items-center gap-2 px-3 py-1.5 text-slate-700 bg-slate-200 hover:bg-slate-300 rounded transition-colors text-sm font-medium"
                                      title="Lihat hasil siswa"
                                    >
                                      <Eye className="w-4 h-4" /> Hasil
                                    </button>

                                    <button 
                                      onClick={() => navigate(`/teacher/evaluations/${evaluation.id}/edit`)}
                                      className="flex items-center gap-2 px-3 py-1.5 text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded transition-colors text-sm font-medium"
                                      title="Edit evaluasi"
                                    >
                                      <Edit className="w-4 h-4" /> Edit
                                    </button>

                                    <button 
                                      onClick={() => handleDelete(evaluation.id)}
                                      className="flex items-center gap-2 px-3 py-1.5 text-red-700 bg-red-100 hover:bg-red-200 rounded transition-colors text-sm font-medium"
                                      title="Hapus evaluasi"
                                    >
                                      <Trash2 className="w-4 h-4" /> Hapus
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}

                          {/* Empty State for Module */}
                          {expandedModule === `${course.id}-${module.id}` && moduleEvaluations.length === 0 && (
                            <div className="p-4 text-center text-slate-500 text-sm">
                              Belum ada evaluasi untuk modul ini
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
