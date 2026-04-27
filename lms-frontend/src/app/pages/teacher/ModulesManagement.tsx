import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Trash2, Edit3, Book, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import api from '../../../lib/api';

interface Module {
  id: string;
  title: string;
  description: string;
  course_id: string;
  course_name: string;
  created_at: string;
}

export function ModulesManagement() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const modulesRes = await api.get('/modules');
      setModules(modulesRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (courseId: string, moduleId: string) => {
    if (!window.confirm('Yakin ingin menghapus materi ini?')) return;

    try {
      await api.delete(`/courses/${courseId}/modules/${moduleId}`);
      setModules(modules.filter(m => m.id !== moduleId));
      toast.success('Materi berhasil dihapus!');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus materi');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Memuat materi...</div>;
  }

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
          <Plus className="w-5 h-5" /> Tambah Materi
        </button>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Belum ada materi</p>
          <p className="text-sm text-slate-500 mt-2">Mulai dengan mengklik "Tambah Materi"</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {modules.map((module) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(`/teacher/learn/${module.course_id}/${module.id}`)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Book className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-slate-900">{module.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600">{module.description}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                      {module.course_name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(module.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/courses/${module.course_id}/learn/${module.id}/edit`);
                    }}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit materi"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteModule(module.course_id, module.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus materi"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
