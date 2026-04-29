import React, { createContext, useContext, useEffect, useState } from 'react';
import { Course, Evaluation, StudentProgress, UserStats } from '../types';
import api from '../../lib/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  courses: Course[];
  evaluations: Evaluation[];
  progress: StudentProgress[];
  stats: UserStats | null;
  loadingCourses: boolean;
  addCourse: (course: Omit<Course, 'id'>) => Promise<Course>;
  updateCourse: (id: string, course: Partial<Omit<Course, 'id'>>) => Promise<Course>;
  updateModule: (courseId: string, moduleId: string, module: any) => Promise<void>;
  addEvaluation: (evaluation: Omit<Evaluation, 'id'>) => Promise<Evaluation>;
  updateProgress: (progress: Omit<StudentProgress, 'studentId'>) => Promise<void>;
  fetchCourses: () => Promise<void>;
  fetchEvaluations: () => Promise<void>;
  fetchStats: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ── Helper: ubah format API module ke format frontend ─────────────────────────
function normalizeModule(m: any) {
  const content = typeof m.content === 'string' ? JSON.parse(m.content) : (m.content ?? {});
  const kinestheticBlocks = content?.kinesthetic?.blocks ?? [];
  return {
    id: String(m.id),
    title: m.title ?? '',
    description: m.description ?? '',
    content: {
      visual: {
        text: content?.visual?.text ?? '',
        images: content?.visual?.images ?? [],
        diagrams: content?.visual?.diagrams ?? [],
        videoUrl: content?.visual?.videoUrl ?? '',
      },
      auditory: {
        audioUrl: content?.auditory?.audioUrl ?? '',
        transcript: content?.auditory?.transcript ?? '',
      },
      kinesthetic: {
        activityType: kinestheticBlocks.length > 0
          ? 'tiered-blocks'
          : (content?.kinesthetic?.activityType ?? 'drag-drop'),
        instructions: content?.kinesthetic?.instructions ?? '',
        items: content?.kinesthetic?.items ?? [],
        learningMaterial: content?.kinesthetic?.learningMaterial ?? '',
        demoVideoUrl: content?.kinesthetic?.demoVideoUrl ?? '',
        blocks: kinestheticBlocks,
      },
    },
  };
}

function normalizeCourse(c: any): Course {
  return {
    id: String(c.id),
    title: c.title,
    description: c.description ?? '',
    thumbnail: c.thumbnail ?? '',
    modules: (c.modules ?? []).map(normalizeModule),
  };
}

function normalizeEvaluation(e: any): Evaluation {
  return {
    id: String(e.id),
    courseId: String(e.course_id),
    moduleId: e.module_id ? String(e.module_id) : undefined,
    title: e.title,
    questions: (e.questions ?? []).map((q: any) => ({
      id: String(q.id),
      text: q.text,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options ?? []),
      correctOptionIndex: q.correct_option_index,
    })),
  };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [courses, setCourses]         = useState<Course[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [progress, setProgress]       = useState<StudentProgress[]>([]);
  const [stats, setStats]             = useState<UserStats | null>(null);
  const [loadingCourses, setLoading]  = useState(false);

  const clearData = () => {
    setCourses([]);
    setEvaluations([]);
    setProgress([]);
    setStats(null);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses');
      setCourses(res.data.map(normalizeCourse));
    } catch (error) {
      console.error('Gagal fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluations = async () => {
    try {
      const res = await api.get('/evaluations');
      setEvaluations(res.data.map(normalizeEvaluation));
    } catch { /* ignore */ }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats');
      setStats({
        coursesInProgress: res.data.courses_in_progress,
        learningTimeSeconds: res.data.learning_time_seconds,
        learningTimeFormatted: res.data.learning_time_formatted,
        modulesCompleted: res.data.modules_completed,
      });
    } catch (error) {
      console.error('Gagal fetch stats:', error);
    }
  };

  useEffect(() => {
    if (!token) {
      clearData();
      setLoading(false);
      return;
    }

    const refreshData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchCourses(),
          fetchEvaluations(),
          fetchStats(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    refreshData();
  }, [token]);

  const addCourse = async (courseData: Omit<Course, 'id'>): Promise<Course> => {
    const res  = await api.post('/courses', {
      title:       courseData.title,
      description: courseData.description,
      thumbnail:   courseData.thumbnail,
      modules:     courseData.modules,
    });
    const newCourse = normalizeCourse(res.data);
    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  };

  const updateCourse = async (id: string, courseData: Partial<Omit<Course, 'id'>>): Promise<Course> => {
    const res = await api.put(`/courses/${id}`, {
      title:       courseData.title,
      description: courseData.description,
      thumbnail:   courseData.thumbnail,
      modules:     courseData.modules,
    });
    const updatedCourse = normalizeCourse(res.data);
    setCourses(prev => prev.map(c => c.id === id ? updatedCourse : c));
    return updatedCourse;
  };

  const updateModule = async (courseId: string, moduleId: string, moduleData: any): Promise<void> => {
    await api.put(`/courses/${courseId}/modules/${moduleId}`, moduleData);
    // Refresh courses to get updated data
    await fetchCourses();
  };

  const removeCourseFromState = (courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
  };

  const addEvaluation = async (evalData: Omit<Evaluation, 'id'>): Promise<Evaluation> => {
    const res     = await api.post('/evaluations', {
      course_id: evalData.courseId,
      module_id: evalData.moduleId,
      title:     evalData.title,
      questions: evalData.questions.map(q => ({
        text:               q.text,
        options:            q.options,
        correctOptionIndex: q.correctOptionIndex,
      })),
    });
    const newEval = normalizeEvaluation(res.data);
    setEvaluations(prev => [...prev, newEval]);
    return newEval;
  };

  const updateProgress = async (p: Omit<StudentProgress, 'studentId'>) => {
    await api.post('/progress', {
      course_id:  p.courseId,
      module_id:  p.moduleId,
      completed:  p.completed,
      score:      p.score,
      time_spent: p.timeSpent ?? 0,
    });
    // refresh list
    try {
      const res = await api.get('/progress');
      setProgress(res.data.map((r: any) => ({
        studentId: String(r.user_id),
        courseId:  String(r.course_id),
        moduleId:  String(r.module_id),
        completed: r.completed,
        score:     r.score,
        timeSpent: r.time_spent,
      })));
    } catch { /* ignore */ }
  };

  return (
    <DataContext.Provider value={{ courses, evaluations, progress, stats, loadingCourses, addCourse, updateCourse, updateModule, addEvaluation, updateProgress, fetchCourses, fetchEvaluations, fetchStats }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
