import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
  Users,
  Plus,
  X,
  Eye,
  Headphones,
  Hand,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../../lib/api';

interface Teacher {
  id: number;
  name: string;
}

interface SchoolClass {
  id: number;
  name: string;
  grade: string;
  major: string;
  academic_year: string;

  homeroom_teacher: {
    id: number;
    name: string;
  } | null;

  students_count: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  learning_style: string | null;
}

export function ClassesManagement() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(false);

  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const [editClass, setEditClass] =
    useState<SchoolClass | null>(null);

  const [deleteClass, setDeleteClass] =
    useState<SchoolClass | null>(null);

  const [viewStudents, setViewStudents] =
    useState<SchoolClass | null>(null);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');

      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/teachers');

      setTeachers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async (id: number) => {
    try {
      const res = await api.get(`/classes/${id}/students`);

      setStudents(res.data.students);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = classes.filter((item) => {
    return (
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.grade.toLowerCase().includes(search.toLowerCase()) ||
      item.major.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleAdd = async (data: any) => {
    try {
      setLoading(true);

      const res = await api.post('/classes', data);

      setClasses([...classes, res.data]);

      setShowAddModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (data: any) => {
    if (!editClass) return;

    try {
      setLoading(true);

      const res = await api.put(
        `/classes/${editClass.id}`,
        data
      );

      setClasses((prev) =>
        prev.map((item) =>
          item.id === editClass.id ? res.data : item
        )
      );

      setEditClass(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteClass) return;

    try {
      setLoading(true);

      await api.delete(`/classes/${deleteClass.id}`);

      setClasses((prev) =>
        prev.filter(
          (item) => item.id !== deleteClass.id
        )
      );

      setDeleteClass(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Classes
          </h1>

          <p className="text-slate-500">
            Manage school classes and homeroom teachers.
          </p>

        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />

          Add Class
        </button>

      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">

        <div className="p-4 border-b border-slate-200 flex gap-4">

          <div className="relative flex-1">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search class..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
            />

          </div>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-50">

              <tr className="text-left text-sm text-slate-500">

                <th className="px-6 py-4">
                  Nama Kelas
                </th>

                <th className="px-6 py-4">
                  Tikat Kelas
                </th>

                <th className="px-6 py-4">
                  Jurusan
                </th>

                <th className="px-6 py-4">
                  Wali Kelas
                </th>

                <th className="px-6 py-4">
                  Siswa
                </th>

                <th className="px-6 py-4">
                    Tahun Ajaran
                </th>

                <th className="px-6 py-4"></th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filtered.length === 0 && (

                <tr>

                  <td
                    colSpan={7}
                    className="text-center py-10 text-slate-400"
                  >

                    No classes available.

                  </td>

                </tr>

              )}

              {filtered.map((item) => (

                <tr
                  key={item.id}
                  className="hover:bg-slate-50 transition"
                >

                  <td className="px-6 py-4 font-semibold">

                    {item.name}

                  </td>

                  <td className="px-6 py-4">

                    {item.grade}

                  </td>

                  <td className="px-6 py-4">

                    {item.major}

                  </td>

                  <td className="px-6 py-4">

                    {item.homeroom_teacher?.name ?? '-'}

                  </td>

                  <td className="px-6 py-4">

                    <button
                      onClick={() => {
                        fetchStudents(item.id);
                        setViewStudents(item);
                      }}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <Users className="w-4 h-4" />

                      {item.students_count}
                    </button>

                  </td>

                  <td className="px-6 py-4">

                    {item.academic_year}

                  </td>

                  <td className="px-6 py-4 relative">

                    <button
                      onClick={() =>
                        setOpenMenu(
                          openMenu === item.id
                            ? null
                            : item.id
                        )
                      }
                      className="p-2 rounded-lg hover:bg-slate-100"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    <AnimatePresence>

                      {openMenu === item.id && (

                        <motion.div
                          initial={{
                            opacity: 0,
                            y: -10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: -10,
                          }}
                          className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border z-50"
                        >
                          <button
                            onClick={() => {
                              fetchStudents(item.id);
                              setViewStudents(item);
                              setOpenMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50"
                          >
                            <Eye className="w-4 h-4" />

                            View Students
                          </button>

                          <button
                            onClick={() => {
                              setEditClass(item);
                              setOpenMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50"
                          >
                            <Edit2 className="w-4 h-4" />

                            Edit
                          </button>

                          <button
                            onClick={() => {
                              setDeleteClass(item);
                              setOpenMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />

                            Delete
                          </button>

                        </motion.div>

                      )}

                    </AnimatePresence>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

            <AnimatePresence>
        {showAddModal && (
          <ClassModal
            title="Add Class"
            teachers={teachers}
            loading={loading}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAdd}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editClass && (
          <ClassModal
            title="Edit Class"
            initialData={editClass}
            teachers={teachers}
            loading={loading}
            onClose={() => setEditClass(null)}
            onSubmit={handleEdit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteClass && (
          <DeleteDialog
            item={deleteClass}
            loading={loading}
            onClose={() => setDeleteClass(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewStudents && (
          <StudentsDialog
            schoolClass={viewStudents}
            students={students}
            onClose={() => {
              setViewStudents(null);
              setStudents([]);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

interface ClassModalProps {
  title: string;
  teachers: Teacher[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: SchoolClass;
}

function ClassModal({
  title,
  teachers,
  loading,
  onClose,
  onSubmit,
  initialData,
}: ClassModalProps) {

  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    grade: initialData?.grade ?? 'X',
    major: initialData?.major ?? '',
    academic_year:
      initialData?.academic_year ?? '',
    homeroom_teacher_id:
      initialData?.homeroom_teacher?.id ?? '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
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
        initial={{ scale: .95 }}
        animate={{ scale: 1 }}
        exit={{ scale: .95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-8 w-full max-w-lg"
      >
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            {title}
          </h2>

          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>

        </div>

        <form
          onSubmit={submit}
          className="space-y-4"
        >

          <div>

            <label className="block text-sm font-medium mb-2">
              Nama Kelas
            </label>

            <input
              value={form.name}
              onChange={(e)=>
                setForm({
                  ...form,
                  name:e.target.value,
                })
              }
              className="w-full border rounded-lg px-4 py-2"
              required
            />

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="block text-sm font-medium mb-2">
                Tingkatan Kelas
              </label>

              <select
                value={form.grade}
                onChange={(e)=>
                  setForm({
                    ...form,
                    grade:e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="X">X</option>
                <option value="XI">XI</option>
                <option value="XII">XII</option>
              </select>

            </div>

            <div>

              <label className="block text-sm font-medium mb-2">
                Jurusan
              </label>

              <input
                value={form.major}
                onChange={(e)=>
                  setForm({
                    ...form,
                    major:e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-2"
                required
              />

            </div>

          </div>

          <div>

            <label className="block text-sm font-medium mb-2">
              Tahun Ajaran
            </label>

            <input
              value={form.academic_year}
              onChange={(e)=>
                setForm({
                  ...form,
                  academic_year:e.target.value,
                })
              }
              placeholder="2025/2026"
              className="w-full border rounded-lg px-4 py-2"
            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-2">
              Wali Kelas
            </label>

            <select
              value={form.homeroom_teacher_id}
              onChange={(e)=>
                setForm({
                  ...form,
                  homeroom_teacher_id:e.target.value,
                })
              }
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="">
                -- None --
              </option>

              {teachers.map((teacher)=>(
                <option
                  key={teacher.id}
                  value={teacher.id}
                >
                  {teacher.name}
                </option>
              ))}

            </select>

          </div>

          <div className="flex gap-3 pt-3">

            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded-lg py-2"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2"
            >
              {loading
                ? 'Saving...'
                : 'Save'}
            </button>

          </div>

        </form>

      </motion.div>

    </motion.div>
  );
}

interface DeleteDialogProps {
  item: SchoolClass;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteDialog({
  item,
  loading,
  onClose,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Delete Class
        </h2>

        <p className="text-slate-600 mb-6">
          Are you sure you want to delete class{' '}
          <span className="font-semibold">
            {item.name}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="flex gap-3">

          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-slate-300 rounded-lg py-2 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2"
          >
            {loading
              ? 'Deleting...'
              : 'Delete'}
          </button>

        </div>

      </motion.div>

    </motion.div>
  );
}

interface StudentsDialogProps {
  schoolClass: SchoolClass;
  students: Student[];
  onClose: () => void;
}

function StudentsDialog({
  schoolClass,
  students,
  onClose,
}: StudentsDialogProps) {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >

      <motion.div
        initial={{ scale: .95 }}
        animate={{ scale: 1 }}
        exit={{ scale: .95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8"
      >

        <div className="flex justify-between items-center mb-6">

          <div>

            <h2 className="text-2xl font-bold text-slate-900">
              {schoolClass.name}
            </h2>

            <p className="text-slate-500">
              Students in this class
            </p>

          </div>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-6 h-6" />
          </button>

        </div>

        <div className="border rounded-xl overflow-hidden">

          <table className="w-full">

            <thead className="bg-slate-50">

              <tr className="text-left text-sm text-slate-500">

                <th className="px-6 py-4">
                  Name
                </th>

                <th className="px-6 py-4">
                  Email
                </th>

                <th className="px-6 py-4">
                  Learning Style
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {students.length === 0 && (

                <tr>

                  <td
                    colSpan={3}
                    className="text-center py-10 text-slate-400"
                  >
                    No students in this class.
                  </td>

                </tr>

              )}

              {students.map((student) => (

                <tr
                  key={student.id}
                  className="hover:bg-slate-50 transition"
                >

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-600">

                        {student.name.charAt(0)}

                      </div>

                      <span className="font-medium">

                        {student.name}

                      </span>

                    </div>

                  </td>

                  <td className="px-6 py-4 text-slate-500">

                    {student.email}

                  </td>

                    <td className="px-6 py-4">
                    {(() => {
                        const style = student.learning_style?.toLowerCase() ?? '';

                        return (
                        <div className="flex items-center gap-2">
                            <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                                style.includes('visual')
                                ? 'bg-blue-100 text-blue-700'
                                : style.includes('auditor')
                                ? 'bg-purple-100 text-purple-700'
                                : style.includes('kinestet') || style.includes('kinesthetic')
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                            >
                            {student.learning_style ?? 'Belum diisi'}
                            </span>

                            {style.includes('visual') && (
                            <Eye className="w-4 h-4 text-blue-500" />
                            )}

                            {style.includes('auditor') && (
                            <Headphones className="w-4 h-4 text-purple-500" />
                            )}

                            {(style.includes('kinestet') ||
                            style.includes('kinesthetic')) && (
                            <Hand className="w-4 h-4 text-orange-500" />
                            )}
                        </div>
                        );
                    })()}
                </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <div className="flex justify-end mt-6">

          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            Close
          </button>

        </div>

      </motion.div>

    </motion.div>
  );
}