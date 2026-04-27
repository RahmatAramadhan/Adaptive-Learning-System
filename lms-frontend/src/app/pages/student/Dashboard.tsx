import React from 'react';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router';
import { BookOpen, PlayCircle, Clock } from 'lucide-react';

export function StudentDashboard() {
  const { courses, progress, stats } = useData();

  // Calculate completion percentage for each course
  const getCourseProgress = (courseId: string) => {
    const courseProgress = progress.filter(p => p.courseId === courseId);
    if (courseProgress.length === 0) return 0;
    const completed = courseProgress.filter(p => p.completed).length;
    return Math.round((completed / courseProgress.length) * 100);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back!</h1>
        <p className="text-slate-500">Pick up where you left off in your learning journey.</p>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-indigo-100 text-sm font-medium">Courses in Progress</p>
              <h3 className="text-2xl font-bold">{stats?.coursesInProgress ?? 0}</h3>
            </div>
          </div>
          <div className="w-full bg-black/20 rounded-full h-1.5 mt-2">
            <div className="bg-white h-full rounded-full" style={{ width: `${Math.min((stats?.coursesInProgress ?? 0) * 50, 100)}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-green-100 text-green-600 rounded-xl">
               <Clock className="w-6 h-6" />
             </div>
             <div>
               <p className="text-slate-500 text-sm font-medium">Learning Time</p>
               <h3 className="text-2xl font-bold text-slate-800">{stats?.learningTimeFormatted ?? '0m'}</h3>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
               <PlayCircle className="w-6 h-6" />
             </div>
             <div>
               <p className="text-slate-500 text-sm font-medium">Modules Completed</p>
               <h3 className="text-2xl font-bold text-slate-800">{stats?.modulesCompleted ?? 0}</h3>
             </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Your Courses</h2>
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Belum ada kursus yang tersedia</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              const courseProgress = getCourseProgress(String(course.id));
              return (
                <div key={course.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                       <Link 
                         to={`/student/course/${course.id}`} 
                         className="w-full bg-white text-slate-900 py-2 rounded-lg font-semibold text-center hover:bg-indigo-50 transition-colors"
                       >
                         Continue Learning
                       </Link>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">{course.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium border-t border-slate-100 pt-4">
                      <span>{course.modules.length} Modules</span>
                      <span className="text-indigo-600">{courseProgress}% Complete</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
