import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useData } from '../../context/DataContext';
import { VisualLesson } from '../../components/Learning/VisualLesson';
import { AuditoryLesson } from '../../components/Learning/AuditoryLesson';
import { KinestheticLesson } from '../../components/Learning/KinestheticLesson';
import { LearningStyle } from '../../types';
import { Eye, Headphones, Hand, ArrowLeft, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { TeacherEditModule } from './EditModule';

export function TeacherLessonView() {
  const { courseId, moduleId } = useParams();
  const { courses } = useData();
  const navigate = useNavigate();
  const [activeStyle, setActiveStyle] = useState<LearningStyle>('visual');
  const [isEditingModule, setIsEditingModule] = useState(false);

  const course = courses.find(c => c.id === courseId);
  const module = course?.modules.find(m => m.id === moduleId);

  if (!course || !module) {
    return (
      <div className="text-center p-10 text-slate-500">
        <p>Module not found</p>
        <button onClick={() => navigate('/teacher')} className="text-indigo-600 hover:underline mt-4">
          Back to dashboard
        </button>
      </div>
    );
  }

  if (isEditingModule) {
    return <TeacherEditModule course={course} module={module} onClose={() => setIsEditingModule(false)} />;
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate(`/teacher/course/${courseId}`)} 
        className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Course
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{module.title}</h1>
          <p className="text-slate-500 mt-1">{course.title}</p>
          <p className="text-sm text-slate-400 mt-2">{module.description}</p>
        </div>
        
        <div className="flex gap-4 items-center">
          {/* Style Switcher */}
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <StyleButton 
              active={activeStyle === 'visual'} 
              onClick={() => setActiveStyle('visual')}
              icon={Eye}
              label="Visual"
            />
            <StyleButton 
              active={activeStyle === 'auditory'} 
              onClick={() => setActiveStyle('auditory')}
              icon={Headphones}
              label="Auditory"
            />
            <StyleButton 
              active={activeStyle === 'kinesthetic'} 
              onClick={() => setActiveStyle('kinesthetic')}
              icon={Hand}
              label="Kinesthetic"
            />
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditingModule(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStyle}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeStyle === 'visual' && <VisualLesson content={module.content.visual} />}
          {activeStyle === 'auditory' && <AuditoryLesson content={module.content.auditory} />}
          {activeStyle === 'kinesthetic' && <KinestheticLesson content={module.content.kinesthetic} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StyleButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
        active 
          ? "bg-slate-900 text-white shadow-md" 
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
