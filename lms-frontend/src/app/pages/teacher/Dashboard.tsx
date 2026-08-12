import React, { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router';
import { Users, BookOpen, Activity, TrendingUp, Edit, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../../lib/api';

interface StudentItem {
  id: number;
  name: string;
  email: string;
  learning_style: string | null;
  bmw_mapping?: {
    dominant_result: string;
  } | null;
}

export function TeacherDashboard() {
  const navigate = useNavigate();
  const { courses, loadingCourses } = useData();
  const [students, setStudents] = useState<StudentItem[]>([]);

  useEffect(() => {
    // Pastikan API memanggil data dengan relasi bmwMapping (sudah kita setting sebelumnya)
    api.get('/students')
      .then(res => setStudents(res.data))
      .catch(() => {});
  }, []);

  // Data Grafik Gaya Belajar
  const styleData = [
    { name: 'Visual',       students: students.filter(s => s.learning_style?.toLowerCase() === 'visual').length },
    { name: 'Auditori',     students: students.filter(s => ['auditori','auditory'].includes(s.learning_style?.toLowerCase() ?? '')).length },
    { name: 'Kinestetik',   students: students.filter(s => ['kinestetik','kinesthetic'].includes(s.learning_style?.toLowerCase() ?? '')).length },
  ];

  // Data Grafik Pemetaan BMW
  const bmwData = [
    { name: 'Bekerja',     students: students.filter(s => s.bmw_mapping?.dominant_result?.toLowerCase() === 'bekerja').length },
    { name: 'Melanjutkan', students: students.filter(s => s.bmw_mapping?.dominant_result?.toLowerCase() === 'melanjutkan').length },
    { name: 'Wirausaha',   students: students.filter(s => s.bmw_mapping?.dominant_result?.toLowerCase() === 'wirausaha').length },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Instructor Dashboard</h1>
        <p className="text-slate-500">Monitor student progress, learning styles, and career mapping.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Siswa" value={students.length} color="blue" />
        <StatCard icon={BookOpen} label="Active Courses" value={courses.length} color="indigo" />
        <StatCard icon={Activity} label="Completion Rate" value="84%" color="green" />
        <StatCard icon={TrendingUp} label="Avg. Score" value="78/100" color="orange" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* =========================================
            GRAFIK 1: DISTRIBUSI GAYA BELAJAR
        ========================================= */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg text-slate-900 mb-6">Distribusi Gaya Belajar</h3>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={styleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value} Siswa`, 'Jumlah']}
                />
                <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            {styleData.map((item) => (
              <div key={item.name} className="text-center bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 transition-colors hover:bg-indigo-50">
                <p className="text-sm text-slate-500 font-medium mb-1">{item.name}</p>
                <p className="text-2xl font-bold text-indigo-600">{item.students}</p>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================
            GRAFIK 2: SEBARAN PEMETAAN KARIER (BMW)
        ========================================= */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg text-slate-900 mb-6">Sebaran Pemetaan Karier BMW</h3>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bmwData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value} Siswa`, 'Jumlah']}
                />
                <Bar dataKey="students" fill="#10b981" radius={[6, 6, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            {bmwData.map((item) => (
              <div key={item.name} className="text-center bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 transition-colors hover:bg-emerald-50">
                <p className="text-sm text-slate-500 font-medium mb-1">{item.name}</p>
                <p className="text-2xl font-bold text-emerald-600">{item.students}</p>
              </div>
            ))}
          </div>
        </div>
        
      </div>

      {/* Courses List Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-slate-900">My Courses</h3>
          <button 
            onClick={() => navigate('/teacher/add-learning')}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
          >
            + Add New Course
          </button>
        </div>

        {loadingCourses ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-4 border border-slate-200 rounded-xl animate-pulse space-y-3">
                <div className="h-5 bg-slate-200 rounded w-2/3" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No courses yet. Create your first course!</p>
            <button 
              onClick={() => navigate('/teacher/add-learning')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Create Course
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.map(course => (
              <div 
                key={course.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/teacher/course/${course.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900">{course.title}</h4>
                  <p className="text-sm text-slate-500">{course.modules.length} modules</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/teacher/add-learning/${course.id}`);
                  }}
                  className="ml-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-emerald-100 text-emerald-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-shadow hover:shadow-md">
      <div className={`p-4 rounded-xl ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}