import React from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useData } from '../../context/DataContext';
import { Play, FileText, CheckCircle, Edit, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/api';

export function TeacherCourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, loadingCourses, fetchCourses } = useData();
  const course = courses.find(c => c.id === id);

  const handleDeleteModule = async (moduleId: number) => {
    if (!window.confirm('Yakin ingin menghapus modul ini?')) return;
    
    try {
      await api.delete(`/courses/${id}/modules/${moduleId}`);
      toast.success('Modul berhasil dihapus!');
      await fetchCourses();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus modul');
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm('Yakin ingin menghapus kursus ini beserta semua modulnya? Tindakan ini tidak dapat dibatalkan.')) return;
    
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Kursus berhasil dihapus!');
      await fetchCourses();
      navigate('/teacher/modules');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus kursus');
    }
  };

  if (loadingCourses) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-40" />
        <div className="h-64 rounded-3xl bg-slate-200" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-24 bg-slate-200 rounded-xl" />
            <div className="h-24 bg-slate-200 rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-40 bg-slate-200 rounded-2xl" />
            <div className="h-24 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center p-10 text-slate-500">
        <p>Kursus tidak ditemukan</p>
        <button onClick={() => navigate('/teacher')} className="text-indigo-600 hover:underline mt-4">
          Kembali ke dashboard
        </button>
      </div>
    );
  }

  const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80';
  const thumbnailUrl = course.thumbnail && course.thumbnail.trim() ? course.thumbnail : DEFAULT_THUMBNAIL;

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate('/teacher')}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dashboard
      </button>

      <div className="relative h-64 rounded-3xl overflow-hidden">
        <img src={thumbnailUrl} className="absolute inset-0 w-full h-full object-cover" alt="Cover kursus" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_THUMBNAIL; }} />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-between p-8 md:p-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
            <div className="text-lg text-slate-200 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: course.description }} />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/teacher/add-learning/${id}`)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              <Edit className="w-5 h-5" />
              Edit Kursus
            </button>
            <button
              onClick={handleDeleteCourse}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-5 h-5" />
              Hapus Kursus
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Materi Pembelajaran</h2>
            <button
              onClick={() => navigate(`/teacher/learn/${id}/new`)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Tambah Modul
            </button>
          </div>

          <div className="space-y-4">
            {course.modules.map((module, idx) => (
              <div
                key={module.id}
                className="w-full bg-white rounded-xl p-6 border border-slate-200 flex items-start gap-4 hover:border-indigo-300 hover:shadow-lg transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <button
                  onClick={() => navigate(`/teacher/learn/${id}/${module.id}`)}
                  className="flex-1 text-left cursor-pointer"
                >
                  <h3 className="font-bold text-slate-900 mb-1 hover:text-indigo-600">{module.title}</h3>
                  <div className="text-sm text-slate-500 mb-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: module.description }} />
                  <p className="text-xs text-slate-400">
                    Konten tersimpan untuk pelajar Visual, Auditori, dan Kinestetik
                  </p>
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/teacher/learn/${id}/${module.id}`)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit modul"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus modul"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Informasi Kursus</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Play className="w-4 h-4" />
                <span>{course.modules.length} Modul</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <FileText className="w-4 h-4" />
                <span>Konten Pembelajaran Adaptif</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4" />
                <span>Siap untuk diajarkan</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
            <h3 className="font-bold text-indigo-900 mb-2">Gaya Belajar</h3>
            <p className="text-sm text-indigo-700">
              Kursus ini berisi konten yang dioptimalkan untuk gaya belajar Visual, Auditori, dan Kinestetik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
