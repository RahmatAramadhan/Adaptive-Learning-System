import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function AssessmentModal() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Modal HANYA muncul jika:
  // 1. Dia siswa
  // 2. Belum isi Gaya Belajar
  // 3. Belum isi BMW
  const mustFillOne = 
    currentUser?.role === 'siswa' && 
    !currentUser?.has_learning_style && 
    !currentUser?.has_bmw_mapping;

  if (!mustFillOne) return null; // Sembunyikan modal jika salah satu sudah diisi

  // Cek apakah dia kelas XI atau XII
  const isSenior = currentUser?.class?.grade === 'XI' || currentUser?.class?.grade === 'XII';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
        
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Selamat Datang! 👋</h2>
          <p className="text-slate-500 mt-2">
            Untuk memulai perjalanan belajarmu, silakan lengkapi salah satu profil di bawah ini.
          </p>
        </div>

        <div className="space-y-3">
          {/* Opsi 1: Gaya Belajar (Muncul untuk semua kelas X, XI, XII) */}
          <button 
            onClick={() => navigate('/questionnaire')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition"
          >
            📋 Isi Kuesioner Gaya Belajar
          </button>

          {/* Opsi 2: BMW (Hanya muncul jika kelas XI atau XII) */}
          {isSenior && (
            <>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">ATAU</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button 
                onClick={() => navigate('/bmw-mapping')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition"
              >
                🚀 Isi Pemetaan BMW (Bekerja, Melanjutkan, Wirausaha)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}