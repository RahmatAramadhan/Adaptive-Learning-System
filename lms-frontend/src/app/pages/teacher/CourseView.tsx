import React from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useData } from '../../context/DataContext';
import { Play, FileText, CheckCircle, Edit, ArrowLeft } from 'lucide-react';

export function TeacherCourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses } = useData();
  const course = courses.find(c => c.id === id);

  if (!course) {
    return (
      <div className="text-center p-10 text-slate-500">
        <p>Course not found</p>
        <button onClick={() => navigate('/teacher')} className="text-indigo-600 hover:underline mt-4">
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate('/teacher')}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="relative h-64 rounded-3xl overflow-hidden">
        <img src={course.thumbnail} className="absolute inset-0 w-full h-full object-cover" alt="Cover" />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-between p-8 md:p-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
            <p className="text-lg text-slate-200">{course.description}</p>
          </div>
          <button
            onClick={() => navigate(`/teacher/add-learning/${id}`)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            <Edit className="w-5 h-5" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Course Modules</h2>
            <span className="text-sm text-slate-500">{course.modules.length} Modules</span>
          </div>

          <div className="space-y-4">
            {course.modules.map((module, idx) => (
              <button
                key={module.id}
                onClick={() => navigate(`/teacher/learn/${id}/${module.id}`)}
                className="w-full text-left bg-white rounded-xl p-6 border border-slate-200 flex items-start gap-4 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">{module.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{module.description}</p>
                  <p className="text-xs text-slate-400">
                    Content stored for Visual, Auditory, and Kinesthetic learners
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Course Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Play className="w-4 h-4" />
                <span>{course.modules.length} Modules</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <FileText className="w-4 h-4" />
                <span>Adaptive Learning Content</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4" />
                <span>Ready to teach</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
            <h3 className="font-bold text-indigo-900 mb-2">Learning Styles</h3>
            <p className="text-sm text-indigo-700">
              This course contains content optimized for Visual, Auditory, and Kinesthetic learning styles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
