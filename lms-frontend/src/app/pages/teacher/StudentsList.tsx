import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Headphones, Hand } from 'lucide-react';
import api from '../../../lib/api';

interface StudentItem {
  id: number;
  name: string;
  email: string;
  learning_style: string | null;
}

export function StudentsList() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/students')
      .then(res => setStudents(res.data))
      .catch(() => {});
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Students</h1>
          <p className="text-slate-500">Manage student profiles and learning paths.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          Add Student
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
