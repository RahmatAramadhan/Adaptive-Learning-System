import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import api from '../../lib/api';
import { toast } from 'sonner';

interface SchoolClass {
  id: number;
  name: string;
  grade: string;
  major: string;
}

export function ProtectedLayout() {
  const { currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  
  // Menggunakan nama showClassModal agar lebih jelas
  const [showClassModal, setShowClassModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role !== 'siswa') return;
    if (currentUser.class) return;

    loadClasses();
  }, [currentUser]);

  const loadClasses = async () => {
    try {
      const res = await api.get('/classes/available');
      setClasses(res.data);
      if (res.data.length > 0) {
        setShowClassModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const chooseClass = async () => {
    if (!selectedClass) {
      toast.error('Silakan pilih kelas terlebih dahulu.');
      return;
    }

    setLoading(true);

    try {
      await api.put('/my-class', {
        class_id: selectedClass,
      });
      await refreshUser();
      setShowClassModal(false);
      toast.success('Kelas berhasil dipilih.');
    } catch (err) {
      console.error(err);
      toast.error('Gagal memilih kelas.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // --- LOGIKA ASSESSMENT MODAL ---
  // Pastikan semua variabel ini ada sebelum 'return'
  const isStudent = currentUser?.role === 'siswa';
  const hasClass = !!currentUser?.class;
  const needsLearningStyle = !currentUser?.has_learning_style;
  const needsBmw = !(currentUser as any)?.has_bmw_mapping;

  const showAssessmentModal = isStudent && hasClass && needsLearningStyle && needsBmw;
  const isSenior = currentUser?.class?.grade === 'XI' || currentUser?.class?.grade === 'XII';

  return (
    <>
      <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* MODAL PILIH KELAS (Prioritas Pertama) */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Pilih Kelas
            </h2>
            <p className="text-slate-500 mb-5">
              Sebelum mulai menggunakan aplikasi, silakan pilih kelas Anda terlebih dahulu.
            </p>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 mb-5"
            >
              <option value="">-- Pilih Kelas --</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <button
              onClick={chooseClass}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 disabled:opacity-60"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL ASESMEN (Muncul setelah punya kelas & belum isi asesmen) */}
      {showAssessmentModal && !showClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Selamat Datang!</h2>
              <p className="text-slate-500 mt-2">
                Untuk memulai perjalanan belajar Anda, silakan lengkapi salah satu profil di bawah ini.
              </p>
            </div>

            <div className="space-y-3">
              {/* Opsi 1: Gaya Belajar */}
              <button
                onClick={() => navigate('/questionnaire')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Isi Kuesioner Gaya Belajar
              </button>

              {/* Opsi 2: BMW (Hanya untuk Kelas XI dan XII) */}
              {isSenior && (
                <>
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">ATAU</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <button
                    onClick={() => navigate('/bmw-mapping')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Isi Pemetaan BMW
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}