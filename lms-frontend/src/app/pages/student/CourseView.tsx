import React from 'react';
import { useParams, Link } from 'react-router';
import { useData } from '../../context/DataContext';
import { Play, FileText, CheckCircle, ArrowRight } from 'lucide-react';

export function CourseView() {
  const { id } = useParams();
  const { courses, loadingCourses } = useData();
  const course = courses.find(c => c.id === id);

  if (loadingCourses) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 rounded-3xl bg-slate-200" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-24 bg-slate-200 rounded-xl" />
            <div className="h-24 bg-slate-200 rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-40 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) return <div>Course not found</div>;

  return (
    <div className="space-y-8">
      <div className="relative h-64 rounded-3xl overflow-hidden">
        <img src={course.thumbnail} className="absolute inset-0 w-full h-full object-cover" alt="Cover" />
        <div className="absolute inset-0 bg-black/60 flex items-center p-8 md:p-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
            <div className="text-lg text-slate-200 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: course.description }} />
          </div>
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
              <div key={module.id} className="bg-white rounded-xl p-6 border border-slate-200 flex items-start gap-4 hover:border-indigo-300 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">{module.title}</h3>
                  <div className="text-sm text-slate-500 mb-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: module.description }} />
                  <div className="flex items-center gap-4">
                    <Link 
                      to={`/student/learn/${course.id}/${module.id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Start Lesson <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Course Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Play className="w-4 h-4" />
                <span>{course.modules.length} Video Lessons</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <FileText className="w-4 h-4" />
                <span>Downloadable resources</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4" />
                <span>Certificate of completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
