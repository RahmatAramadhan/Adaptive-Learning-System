import React, { useEffect, useState } from 'react';
import { Search, MoreHorizontal, ChevronDown, Eye, Headphones, Hand, Edit2, Trash2, X, Briefcase } from 'lucide-react';
import api from '../../../lib/api';
import { motion, AnimatePresence } from 'motion/react';

interface StudentItem {
  id: number;
  name: string;
  email: string;
  learning_style: string | null;

  class: {
    id: number;
    name: string;
  } | null;

  bmw_mapping?: {
    dominant_result: string;
    bekerja_score: number;
    melanjutkan_score: number;
    wirausaha_score: number;
    open_answers: Record<string, string>;
  } | null;
}

export function StudentsList() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [editStudent, setEditStudent] = useState<StudentItem | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<StudentItem | null>(null);
  const [viewBmwStudent, setViewBmwStudent] = useState<StudentItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    api.get('/students')
      .then(res => setStudents(res.data))
      .catch(() => {});
  };

  const filtered = students.filter((student) => {
    const matchSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase());

    const matchClass = !classFilter || student.class?.name === classFilter;
    const matchStyle = !styleFilter || student.learning_style?.toLowerCase() === styleFilter.toLowerCase();

    return matchSearch && matchClass && matchStyle;
  });

  const classOptions = [...new Set(students.map((s) => s.class?.name).filter(Boolean))];
  const learningStyleOptions = ['Visual', 'Auditori', 'Kinestetik'];    

  const handleEditSave = async (updatedStudent: any) => {
    try {
      setIsLoading(true);
      
      // Siapkan payload data (Nama, Email, dan Class ID wajib dikirim ulang)
      const payload: any = {
        name: updatedStudent.name,
        email: updatedStudent.email,
        class_id: updatedStudent.class?.id, // <-- Baris ini yang sebelumnya tertinggal
      };

      // Jika admin mengisi password baru, masukkan ke payload
      if (updatedStudent.password) {
        payload.password = updatedStudent.password;
      }

      await api.put(`/students/${updatedStudent.id}`, payload);
      
      setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
      setEditStudent(null);
    } catch (error) {
      console.error('Error updating student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (student: StudentItem) => {
    try {
      setIsLoading(true);
      await api.delete(`/students/${student.id}`);
      setStudents(students.filter(s => s.id !== student.id));
      setDeleteStudent(null);
      setOpenMenu(null);
    } catch (error) {
      console.error('Error deleting student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async (formData: { name: string; email: string; password: string }) => {
    try {
      setIsLoading(true);
      const response = await api.post('/students', formData);
      setStudents([...students, response.data]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatName = (name: string) => {
    return name.toLowerCase().split(' ').filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Students</h1>
          <p className="text-slate-500">Manage student profiles and learning paths.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Add Student
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
        <div className="p-4 border-b border-slate-200 flex gap-4 flex-wrap">

          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="appearance-none w-52 px-4 pr-10 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500">
              <option value="">Semua Kelas</option>
              {classOptions.map((kelas) => (
                <option key={kelas} value={kelas}>{kelas}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={styleFilter}
              onChange={(e) => setStyleFilter(e.target.value)}
              className="appearance-none w-52 px-4 pr-10 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500">
              <option value="">Semua Gaya Belajar</option>
              {learningStyleOptions.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium text-sm">
          <tr>
              <th className="px-6 py-4">Nama</th>
              <th className="px-6 py-4">Kelas</th>
              <th className="px-6 py-4">Gaya Belajar</th>
              <th className="px-6 py-4">Pemetaan BMW</th>
              <th className="px-6 py-4">Progress</th>
              <th className="px-6 py-4"></th>
          </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Belum ada data siswa.</td></tr>
            )}
            {filtered.map(student => {
              const style = student.learning_style?.toLowerCase() ?? '';
              return (
              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {formatName(student.name).charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{formatName(student.name)}</div>
                      <div className="text-xs text-slate-500">{student.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {student.class ? (<span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                      {student.class.name}
                    </span>) : (
                    <span className="text-slate-400 italic text-sm">Belum ada kelas</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      style.includes('visual')      ? 'bg-blue-100 text-blue-700' :
                      style.includes('auditor')     ? 'bg-purple-100 text-purple-700' :
                      style.includes('kinestet') || style.includes('kinesth') ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {style || 'Belum diisi'}
                    </span>
                    {style.includes('visual')     && <Eye className="w-4 h-4 text-blue-500" />}
                    {style.includes('auditor')    && <Headphones className="w-4 h-4 text-purple-500" />}
                    {(style.includes('kinestet') || style.includes('kinesth')) && <Hand className="w-4 h-4 text-orange-500" />}
                  </div>
                </td>
                
                {/* Kolom BMW Mapping */}
                <td className="px-6 py-4">
                  {student.bmw_mapping ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        {student.bmw_mapping.dominant_result}
                      </span>
                      <button 
                        onClick={() => setViewBmwStudent(student)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        title="Lihat Detail BMW"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm italic">Belum diisi</span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[75%] rounded-full"></div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right relative">
                  <div className="relative inline-block w-full">
                    <button 
                      onClick={() => setOpenMenu(openMenu === student.id ? null : student.id)}
                      className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors float-right"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    
                    <AnimatePresence>
                      {openMenu === student.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -right-2 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden"
                        >
                          <button
                            onClick={() => { setEditStudent(student); setOpenMenu(null); }}
                            className="flex items-center gap-2 px-4 py-3 w-full hover:bg-slate-50 text-slate-700 font-medium transition-colors text-sm border-b border-slate-100"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => { setDeleteStudent(student); setOpenMenu(null); }}
                            className="flex items-center gap-2 px-4 py-3 w-full hover:bg-red-50 text-red-600 font-medium transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Edit & Delete Modals ... */}
      <AnimatePresence>
        {editStudent && (
          <EditStudentModal
            student={editStudent}
            onClose={() => setEditStudent(null)}
            onSave={handleEditSave}
            isLoading={isLoading}
          />
        )}
        {deleteStudent && (
          <DeleteConfirmDialog
            student={deleteStudent}
            onClose={() => setDeleteStudent(null)}
            onConfirm={() => handleDelete(deleteStudent)}
            isLoading={isLoading}
          />
        )}
        {showAddModal && (
          <AddStudentModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddStudent}
            isLoading={isLoading}
          />
        )}
        {viewBmwStudent && (
          <BmwDetailModal
            student={viewBmwStudent}
            onClose={() => setViewBmwStudent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── KOMPONEN BMW DETAIL MODAL ──
function BmwDetailModal({ student, onClose }: { student: StudentItem; onClose: () => void }) {
  const bmw = student.bmw_mapping;
  if (!bmw) return null;

  const openQuestions = [
    { key: 'q1', text: 'Rencana setelah lulus SMK' },
    { key: 'q2', text: 'Pertimbangan mengambil rencana tersebut' },
    { key: 'q3', text: 'Rencana yang disarankan orang tua' },
    { key: 'q4', text: 'Alasan orang tua menyarankan rencana tersebut' },
    { key: 'q5', text: 'Cita-cita yang ingin dicapai' },
  ];

  // Konversi ke persentase
  const bPct = Math.round(((bmw.bekerja_score || 0) / 15) * 100);
  const mPct = Math.round(((bmw.melanjutkan_score || 0) / 15) * 100);
  const wPct = Math.round(((bmw.wirausaha_score || 0) / 15) * 100);

  // Cek kategori dominan untuk memberikan warna hijau
  const dominant = bmw.dominant_result?.toLowerCase() || '';
  const isBekerjaDom = dominant === 'bekerja';
  const isMelanjutkanDom = dominant === 'melanjutkan';
  const isWirausahaDom = dominant === 'wirausaha';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] px-4 py-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-full flex flex-col overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" /> Hasil Pemetaan Karier BMW
            </h2>
            <p className="text-sm text-slate-500 mt-1">{student.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {/* Skor Bagian */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Kecenderungan Minat</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              
              {/* Kotak Bekerja */}
              <div className={`p-4 rounded-xl border transition-colors ${isBekerjaDom ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className={`text-xs font-semibold mb-1 ${isBekerjaDom ? 'text-emerald-600' : 'text-slate-500'}`}>Bekerja</div>
                <div className={`text-2xl font-bold ${isBekerjaDom ? 'text-emerald-700' : 'text-slate-700'}`}>{bPct}%</div>
              </div>

              {/* Kotak Melanjutkan */}
              <div className={`p-4 rounded-xl border transition-colors ${isMelanjutkanDom ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className={`text-xs font-semibold mb-1 ${isMelanjutkanDom ? 'text-emerald-600' : 'text-slate-500'}`}>Melanjutkan</div>
                <div className={`text-2xl font-bold ${isMelanjutkanDom ? 'text-emerald-700' : 'text-slate-700'}`}>{mPct}%</div>
              </div>

              {/* Kotak Wirausaha */}
              <div className={`p-4 rounded-xl border transition-colors ${isWirausahaDom ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className={`text-xs font-semibold mb-1 ${isWirausahaDom ? 'text-emerald-600' : 'text-slate-500'}`}>Wirausaha</div>
                <div className={`text-2xl font-bold ${isWirausahaDom ? 'text-emerald-700' : 'text-slate-700'}`}>{wPct}%</div>
              </div>

            </div>
          </div>

          {/* Jawaban Terbuka */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Jawaban Refleksi (Esai)</h3>
            <div className="space-y-4">
              {openQuestions.map((q, i) => (
                <div key={q.key} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 mb-2">{i + 1}. {q.text}</div>
                  <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {bmw.open_answers?.[q.key] || <span className="italic text-slate-400">Tidak ada jawaban</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── KOMPONEN LAMA (JANGAN DIUBAH) ──

function EditStudentModal({ student, onClose, onSave, isLoading }: any) {
  // Tambahkan state password dengan default kosong
  const [formData, setFormData] = useState({ 
    name: student.name, 
    email: student.email,
    password: '' 
  });

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    onSave({ ...student, ...formData }); 
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Edit Siswa</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>

          {/* Kolom Password Baru */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password Baru <span className="text-slate-400 font-normal">(Opsional)</span></label>
            <input 
              type="text" 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="Kosongkan jika tidak diubah"
              minLength={8}
            />
            <p className="text-xs text-slate-500 mt-1">Minimal 8 karakter.</p>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50" disabled={isLoading}>Batal</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function DeleteConfirmDialog({ student, onClose, onConfirm, isLoading }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="mb-6"><h2 className="text-2xl font-bold text-slate-900 mb-2">Delete Student</h2><p className="text-slate-600">Are you sure you want to delete <span className="font-semibold">{student.name}</span>? This action cannot be undone.</p></div>
        <div className="flex gap-2"><button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50" disabled={isLoading}>Cancel</button><button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" disabled={isLoading}>{isLoading ? 'Deleting...' : 'Delete'}</button></div>
      </motion.div>
    </motion.div>
  );
}

function AddStudentModal({ onClose, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (formData.name && formData.email && formData.password) { onSubmit(formData); setFormData({ name: '', email: '', password: '' }); } };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-slate-900">Add New Student</h2><button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-2">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-2">Password</label><input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required minLength={8} /></div>
          <div className="flex gap-2 pt-4"><button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50" disabled={isLoading}>Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Student'}</button></div>
        </form>
      </motion.div>
    </motion.div>
  );
}