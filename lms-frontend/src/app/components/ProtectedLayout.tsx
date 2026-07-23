import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router';
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
  const {
    currentUser,
    refreshUser,
  } = useAuth();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  console.log(currentUser);

  if (!currentUser) return;

  if (currentUser.role !== 'siswa') return;

  if (currentUser.class) return;

  loadClasses();
}, [currentUser]);

  const loadClasses = async () => {
    console.log("loadClasses dipanggil");

    try {
      const res = await api.get('/classes/available');

      console.log("Status:", res.status);
      console.log("Data:", res.data);

      setClasses(res.data);

      if (res.data.length > 0) {
        console.log("Show modal");
        setShowModal(true);
      } else {
        console.log("Tidak ada kelas");
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

      setShowModal(false);

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

      {
        showModal && (

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

                <option value="">
                  -- Pilih Kelas --
                </option>

                {
                  classes.map((item) => (

                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>

                  ))
                }

              </select>

              <button
                onClick={chooseClass}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 disabled:opacity-60"
              >
                {
                  loading
                    ? 'Menyimpan...'
                    : 'Simpan'
                }
              </button>

            </div>

          </div>

        )

      }

    </>
  );
}