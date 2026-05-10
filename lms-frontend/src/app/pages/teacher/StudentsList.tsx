import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Headphones, Hand, Edit2, Trash2, X } from 'lucide-react';
import api from '../../../lib/api';
import { motion, AnimatePresence } from 'motion/react';

interface StudentItem {
  id: number;
  name: string;
  email: string;
  learning_style: string | null;
}

export function StudentsList() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [editStudent, setEditStudent] = useState<StudentItem | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<StudentItem | null>(null);
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

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditSave = async (updatedStudent: StudentItem) => {
    try {
      setIsLoading(true);
      await api.put(`/students/${updatedStudent.id}`, {
        name: updatedStudent.name,
        email: updatedStudent.email,
      });
      
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
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari siswa..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="px-4 py-2 border border-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-50">
            <Filter className="w-4 h-4 text-slate-500" /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium text-sm">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Dominant Learning Style</th>
              <th className="px-6 py-4">Progress</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Belum ada data siswa.</td></tr>
            )}
            {filtered.map(student => {
              const style = student.learning_style?.toLowerCase() ?? '';
              return (
              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {student.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-900">{student.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">{student.email}</td>
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
                <td className="px-6 py-4">
                  <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[75%] rounded-full"></div>
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
                    
                    {/* Dropdown Menu - Fixed positioning to avoid clipping */}
                    <AnimatePresence>
                      {openMenu === student.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -right-2 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-200 z-50"
                        >
                          <button
                            onClick={() => {
                              setEditStudent(student);
                              setOpenMenu(null);
                            }}
                            className="flex items-center gap-2 px-4 py-3 w-full hover:bg-slate-50 text-slate-700 font-medium transition-colors text-sm border-b border-slate-100"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeleteStudent(student);
                              setOpenMenu(null);
                            }}
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

      {/* Edit Modal */}
      <AnimatePresence>
        {editStudent && (
          <EditStudentModal
            student={editStudent}
            onClose={() => setEditStudent(null)}
            onSave={handleEditSave}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteStudent && (
          <DeleteConfirmDialog
            student={deleteStudent}
            onClose={() => setDeleteStudent(null)}
            onConfirm={() => handleDelete(deleteStudent)}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddStudentModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddStudent}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EditStudentModal({ 
  student, 
  onClose, 
  onSave, 
  isLoading 
}: { 
  student: StudentItem; 
  onClose: () => void; 
  onSave: (student: StudentItem) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...student,
      name: formData.name,
      email: formData.email,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Edit Student</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function DeleteConfirmDialog({ 
  student, 
  onClose, 
  onConfirm, 
  isLoading 
}: { 
  student: StudentItem; 
  onClose: () => void; 
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Delete Student</h2>
          <p className="text-slate-600">
            Are you sure you want to delete <span className="font-semibold">{student.name}</span>? This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AddStudentModal({ 
  onClose, 
  onSubmit, 
  isLoading 
}: { 
  onClose: () => void; 
  onSubmit: (data: { name: string; email: string; password: string }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.password) {
      onSubmit(formData);
      setFormData({ name: '', email: '', password: '' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Add New Student</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., John Doe"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g., john@example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 8 characters"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              minLength={8}
            />
            <p className="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
