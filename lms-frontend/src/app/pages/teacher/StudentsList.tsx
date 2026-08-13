import React, { useEffect, useState } from 'react';
import { Search, MoreHorizontal, ChevronDown, Eye, Headphones, Hand, Edit2, Trash2, X, Briefcase, Filter, Compass} from 'lucide-react';
import api from '../../../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';

interface StudentItem {
  id: number;
  name: string;
  email: string;
  learning_style: string | null;
  learning_style_details?: {
    visual_percentage: number;
    auditory_percentage: number;
    kinesthetic_percentage: number;
  } | null;
  class: {
    id: number;
    name: string;
    academic_year?: string;
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
  
  // State untuk UI Filter Chips
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    class_name: '',
    learning_style: '',
    bmw_result: '',
    academic_year: ''
  });

  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [editStudent, setEditStudent] = useState<StudentItem | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<StudentItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detailStyleStudent, setDetailStyleStudent] = useState<StudentItem | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    api.get('/students')
      .then(res => setStudents(res.data))
      .catch(() => {});
  };

  // Opsi Filter Dinamis & Statis
  const classOptions = [...new Set(students.map((s) => s.class?.name).filter(Boolean))];
  const learningStyleOptions = ['Visual', 'Auditori', 'Kinestetik', 'Belum Diisi'];    
  const bmwResultOptions = ['Bekerja', 'Melanjutkan', 'Wirausaha', 'Belum Diisi'];
  const academicYearOptions = [...new Set(students.map((s) => s.class?.academic_year).filter(Boolean))];

  // Logika Filter Multi-Kriteria
  const filtered = students.filter((student) => {
    // 1. Pencarian Text (Nama/Email)
    const matchSearch = search === '' ||
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase());

    // 2. Filter Kelas
    const matchClass = filters.class_name === '' || student.class?.name === filters.class_name;

    //3. Filter Tahun Ajaran
    const matchYear = filters.academic_year === '' || student.class?.academic_year === filters.academic_year;

    // 4. Filter Gaya Belajar
    const style = student.learning_style || 'Belum Diisi';
    const matchStyle = filters.learning_style === '' || 
      (filters.learning_style === 'Belum Diisi' 
        ? !student.learning_style 
        : style.toLowerCase() === filters.learning_style.toLowerCase());

    // 5. Filter Hasil BMW
    const bmw = student.bmw_mapping?.dominant_result || 'Belum Diisi';
    const matchBmw = filters.bmw_result === '' ||
      (filters.bmw_result === 'Belum Diisi'
        ? !student.bmw_mapping
        : bmw.toLowerCase() === filters.bmw_result.toLowerCase());

    return matchSearch && matchClass && matchYear && matchStyle && matchBmw;
  });

  // Fungsi Helper untuk Filter Chips
  const hasActiveFilters = Object.values(filters).some(val => val !== '');
  const removeFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: '' }));
  };

  const handleEditSave = async (updatedStudent: any) => {
    try {
      setIsLoading(true);
      const payload: any = {
        name: updatedStudent.name,
        email: updatedStudent.email,
        class_id: updatedStudent.class?.id, 
      };

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
    <div className="space-y-6 pb-12">
      {/* Header Halaman */}
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
        
        {/* ================= BARIS PENCARIAN & FILTER ================= */}
        <div className="p-5 border-b border-slate-200 space-y-4">
          <div className="flex gap-4 relative">
            
            {/* Search Bar (Hanya Text) */}
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau email siswa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            {/* Tombol Filter */}
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 font-medium transition-colors ${
                hasActiveFilters || showFilter
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filter Data
            </button>

            {/* Pop-up Panel Filter */}
            {showFilter && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl p-5 z-20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800">Filter Siswa</h3>
                  <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Kelas</label>
                    <select 
                      value={filters.class_name} 
                      onChange={e => setFilters({...filters, class_name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">Semua Kelas</option>
                      {classOptions.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tahun Ajaran</label>
                    <select 
                      value={filters.academic_year} 
                      onChange={e => setFilters({...filters, academic_year: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">Semua Tahun Ajaran</option>
                      {academicYearOptions.map(y => <option key={y as string} value={y as string}>{y as string}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Gaya Belajar</label>
                    <select 
                      value={filters.learning_style} 
                      onChange={e => setFilters({...filters, learning_style: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">Semua Gaya Belajar</option>
                      {learningStyleOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Hasil BMW</label>
                    <select 
                      value={filters.bmw_result} 
                      onChange={e => setFilters({...filters, bmw_result: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">Semua Hasil BMW</option>
                      {bmwResultOptions.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <button 
                    onClick={() => setFilters({class_name: '', academic_year:'', learning_style: '', bmw_result: ''})}
                    className="mt-5 w-full py-2 text-sm text-red-600 font-medium bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Reset Semua Filter
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ================= FILTER CHIPS ================= */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-1 items-center">
              <span className="text-sm text-slate-500 py-1.5 mr-1 font-medium">Filter aktif:</span>
              
              {filters.class_name && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg border border-indigo-100">
                  Kelas: {filters.class_name}
                  <button onClick={() => removeFilter('class_name')} className="hover:bg-indigo-200 p-0.5 rounded-md transition-colors text-indigo-500 hover:text-indigo-800"><X className="w-3.5 h-3.5" /></button>
                </span>
              )}

              {filters.academic_year && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg border border-amber-100">
                  Tahun: {filters.academic_year}
                  <button onClick={() => removeFilter('academic_year')} className="hover:bg-amber-200 p-0.5 rounded-md transition-colors text-amber-500 hover:text-amber-800"><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
              
              {filters.learning_style && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg border border-purple-100">
                  Gaya: {filters.learning_style}
                  <button onClick={() => removeFilter('learning_style')} className="hover:bg-purple-200 p-0.5 rounded-md transition-colors text-purple-500 hover:text-purple-800"><X className="w-3.5 h-3.5" /></button>
                </span>
              )}

              {filters.bmw_result && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg border border-emerald-100">
                  BMW: {filters.bmw_result}
                  <button onClick={() => removeFilter('bmw_result')} className="hover:bg-emerald-200 p-0.5 rounded-md transition-colors text-emerald-500 hover:text-emerald-800"><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tabel Siswa */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium text-sm">
          <tr>
              <th className="px-6 py-4">Nama</th>
              <th className="px-6 py-4">Kelas</th>
              <th className="px-6 py-4">Gaya Belajar</th>
              <th className="px-6 py-4">Pemetaan BMW</th>
              <th className="px-6 py-4">Tahun Ajaran</th> 
              <th className="px-6 py-4"></th>
          </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Tidak ada siswa yang sesuai dengan filter.</td></tr>
            )}
            {filtered.map(student => {
              const style = student.learning_style?.toLowerCase() ?? '';
              return (
              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                      {formatName(student.name).charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{formatName(student.name)}</div>
                      <div className="text-xs text-slate-500">{student.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {student.class ? (<span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold whitespace-nowrap">
                      {student.class.name}
                    </span>) : (
                    <span className="text-slate-400 italic text-sm">Belum ada kelas</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 items-center whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      style.includes('visual')      ? 'bg-blue-100 text-blue-700' :
                      style.includes('auditor')     ? 'bg-purple-100 text-purple-700' :
                      style.includes('kinestet') || style.includes('kinesth') ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {student.learning_style || 'Belum diisi'}
                    </span>
                    {style.includes('visual')     && <Eye className="w-4 h-4 text-blue-500" />}
                    {style.includes('auditor')    && <Headphones className="w-4 h-4 text-purple-500" />}
                    {(style.includes('kinestet') || style.includes('kinesth')) && <Hand className="w-4 h-4 text-orange-500" />}
                  </div>
                </td>
                
                {/* Kolom BMW Mapping */}
                <td className="px-6 py-4">
                  {student.bmw_mapping ? (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 capitalize whitespace-nowrap">
                      {student.bmw_mapping.dominant_result}
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 whitespace-nowrap">
                      Belum diisi
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm">
                  {student.class?.academic_year ? (
                    <span className="font-medium">{student.class.academic_year}</span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
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
                          className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden text-left"
                        >
                          {/* Menu Detail BMW (Hanya muncul jika sudah mengisi) */}
                          {student.bmw_mapping && (
                            <button
                              onClick={() => { 
                                navigate(`/teacher/students/${student.id}/bmw`); 
                                setOpenMenu(null); 
                              }}
                              className="flex items-center gap-2 px-4 py-3 w-full hover:bg-emerald-50 text-emerald-700 font-medium transition-colors text-sm border-b border-slate-100"
                            >
                              <Briefcase className="w-4 h-4" /> Detail BMW
                            </button>
                          )}

                          {student.learning_style_details && (
                            <button
                              onClick={() => { 
                                setDetailStyleStudent(student); 
                                setOpenMenu(null); 
                              }}
                              className="flex items-center gap-2 px-4 py-3 w-full hover:bg-indigo-50 text-indigo-700 font-medium transition-colors text-sm border-b border-slate-100"
                            >
                              <Compass className="w-4 h-4" /> Detail Gaya Belajar
                            </button>
                          )}

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

      {/* Bagian Komponen Modal/Dialog Asumsi sudah di-import dari file atau didefinisikan di tempat lain */}
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
        {detailStyleStudent && (
          <LearningStyleDetailModal
            student={detailStyleStudent}
            onClose={() => setDetailStyleStudent(null)}
          />
        )}
      </AnimatePresence>
    </div>
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

function LearningStyleDetailModal({ student, onClose }: any) {
  const details = student.learning_style_details;
  if (!details) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-6">
        
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Gaya Belajar</h3>
          <p className="text-sm text-slate-500 mt-1">{student.name}</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
          <span className="text-xs uppercase tracking-wider text-indigo-500 font-bold">Kecenderungan</span>
          <h4 className="text-2xl font-extrabold text-indigo-700 uppercase mt-1">
            {student.learning_style}
          </h4>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
            <span>Visual</span>
            <span className="font-bold">{details.visual_percentage}%</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
            <span>Auditori</span>
            <span className="font-bold">{details.auditory_percentage}%</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
            <span>Kinestetik</span>
            <span className="font-bold">{details.kinesthetic_percentage}%</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition"
        >
          Tutup
        </button>
      </motion.div>
    </motion.div>
  );
}