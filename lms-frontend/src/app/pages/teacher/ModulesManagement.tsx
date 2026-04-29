import React from 'react';
import { useNavigate } from 'react-router';
import { Plus, Trash2, Edit, ArrowLeft, AlertCircle, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useData } from '../../context/DataContext';
import api from '../../../lib/api';

export function ModulesManagement() {
  const navigate = useNavigate();
  const { courses, loadingCourses, fetchCourses } = useData();

  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm('Yakin ingin menghapus kursus ini beserta semua modulnya?')) return;

    try {
      await api.delete(`/courses/${courseId}`);
      toast.success('Kursus berhasil dihapus!');
      await fetchCourses();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus kursus');
    }
  };

  return (
    <div className="space-y-8">
      <button 
        onClick={() => navigate('/teacher')}
        className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kelola Materi</h1>
          <p className="text-slate-500 mt-2">Lihat, tambah, dan edit semua materi pembelajaran</p>
        </div>
        <button
          onClick={() => navigate('/teacher/add-learning')}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" /> Tambah Kursus
        </button>
      </div>

      {/* Daftar Kursus */}
      <div className="space-y-4">
        {loadingCourses ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-20 bg-slate-100 rounded-xl" />
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Belum ada kursus</p>
          </div>
        ) : (
          courses.map((course) => {
            const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80';
            const thumbnailUrl = course.thumbnail && course.thumbnail.trim() ? course.thumbnail : DEFAULT_THUMBNAIL;
            return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all p-6 space-y-4"
            >
              <div className="flex gap-6 cursor-pointer" onClick={() => navigate(`/teacher/course/${course.id}`)}>
                <div className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-md hover:shadow-lg transition-shadow">
                  <img
                    src={thumbnailUrl}
                    alt="Course thumbnail"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_THUMBNAIL; }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors">{course.title}</h3>
                  <div className="text-slate-600 mt-2 line-clamp-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: course.description }} />
                  <div className="flex items-center gap-2 mt-4">
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
                      {course.modules.length} Modul
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => navigate(`/teacher/add-learning/${course.id}`)}
                  className="px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-semibold flex items-center gap-2"
                  title="Edit informasi kursus"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold flex items-center gap-2"
                  title="Hapus kursus"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
                <button
                  onClick={() => navigate(`/teacher/course/${course.id}`)}
                  className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-semibold flex items-center gap-2"
                >
                  Lihat Detail
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
            );})
        )}
      </div>
    </div>
  );
}
