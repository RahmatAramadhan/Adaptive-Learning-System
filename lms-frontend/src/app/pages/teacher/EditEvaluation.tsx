import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm, useFieldArray } from 'react-hook-form';
import { Evaluation, Question } from '../../types';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/api';

interface ModuleOption {
  id: string;
  title: string;
}

interface CourseOption {
  id: string;
  title: string;
  modules: ModuleOption[];
}

export function EditEvaluation() {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const formInitializedRef = useRef(false);

  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<Evaluation>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  const courseId = watch('courseId');

  // Load courses first
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat daftar kursus');
      }
    };
    loadCourses();
  }, []);

  // Load evaluation
  useEffect(() => {
    const loadEvaluation = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/evaluations/${evaluationId}`);
        console.log('Raw evaluation response:', res.data);
        
        // Transform snake_case to camelCase and parse options if they're strings
        const transformedData = {
          ...res.data,
          courseId: res.data.course_id,
          moduleId: res.data.module_id,
          title: res.data.title,
          questions: res.data.questions.map((q: any) => ({
            id: q.id,
            text: q.text,
            correctOptionIndex: q.correct_option_index,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || [])
          }))
        };
        
        console.log('Transformed evaluation:', transformedData);
        setEvaluation(transformedData);
        
        // Reset form with transformed data - this will populate all fields including questions
        reset(transformedData);
        formInitializedRef.current = true;
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat evaluasi');
      } finally {
        setLoading(false);
      }
    };
    loadEvaluation();
  }, [evaluationId, reset]);

  // After courses are loaded and evaluation is loaded, ensure courseId is set
  useEffect(() => {
    if (!evaluation || !formInitializedRef.current || courses.length === 0) return;
    
    console.log('Setting courseId:', evaluation.courseId);
    setValue('courseId', String(evaluation.courseId));
  }, [evaluation, courses, setValue]);

  // Load modules when course changes
  useEffect(() => {
    if (!courseId) {
      setModules([]);
      return;
    }
    console.log('Looking for course:', courseId);
    const course = courses.find(c => String(c.id) === String(courseId));
    console.log('Found course:', course);
    if (course) {
      const coursesModules = course.modules || [];
      console.log('Setting modules:', coursesModules);
      setModules(coursesModules);
      
      // After modules are loaded, set moduleId if evaluation is loaded
      if (evaluation && evaluation.moduleId) {
        console.log('Setting moduleId:', evaluation.moduleId);
        setValue('moduleId', String(evaluation.moduleId));
      }
    }
  }, [courseId, courses, evaluation, setValue]);

  const onSubmit = async (data: Evaluation) => {
    if (!data.courseId) {
      toast.error('Pilih kursus terlebih dahulu');
      return;
    }

    if (!data.moduleId) {
      toast.error('Pilih modul terlebih dahulu');
      return;
    }

    if (data.questions.length === 0) {
      toast.error('Minimal 1 pertanyaan harus ada');
      return;
    }

    for (const q of data.questions) {
      if (!q.text?.trim()) {
        toast.error('Semua pertanyaan harus memiliki teks');
        return;
      }
      if (q.options.some((opt: string) => !opt?.trim())) {
        toast.error('Semua opsi harus diisi');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        course_id: data.courseId,
        module_id: data.moduleId,
        title: data.title,
        questions: data.questions.map((q: Question) => ({
          text: q.text,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex
        }))
      };

      await api.put(`/evaluations/${evaluationId}`, payload);
      toast.success('Evaluasi berhasil diperbarui!');
      navigate('/teacher/evaluations');
    } catch (err) {
      console.error(err);
      toast.error('Gagal memperbarui evaluasi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Memuat evaluasi...</div>;
  }

  if (!evaluation) {
    return <div className="text-center py-12">Evaluasi tidak ditemukan</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <button 
        onClick={() => navigate('/teacher/evaluations')}
        className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Evaluasi
      </button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Evaluasi</h1>
        <p className="text-slate-500">{evaluation.title}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Judul Evaluasi *</label>
              <input 
                {...register("title", { required: 'Judul wajib diisi' })} 
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="cth: Ujian Tengah Semester"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Kursus *</label>
              <select 
                {...register("courseId", { required: 'Pilih kursus' })} 
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Pilih kursus...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              {errors.courseId && <p className="text-red-500 text-sm mt-1">{errors.courseId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Modul *</label>
              <select 
                {...register("moduleId", { required: 'Pilih modul' })} 
                disabled={!courseId}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                <option value="">{courseId ? 'Pilih modul...' : 'Pilih kursus terlebih dahulu'}</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
              {errors.moduleId && <p className="text-red-500 text-sm mt-1">{errors.moduleId.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {fields.map((field: any, index: number) => (
            <div key={field.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <button 
                type="button" 
                onClick={() => remove(index)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pertanyaan {index + 1}</label>
                  <textarea 
                    {...register(`questions.${index}.text` as const)} 
                    className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-medium resize-none"
                    placeholder="Masukkan teks pertanyaan..."
                    rows={2}
                  />
                </div>
                
                <fieldset className="space-y-3">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Pilihan Jawaban</label>
                  {[0, 1, 2, 3].map((optIndex) => (
                    <div key={optIndex} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <input 
                        type="radio" 
                        value={optIndex}
                        {...register(`questions.${index}.correctOptionIndex` as const)}
                        className="w-4 h-4 text-indigo-600 mt-1 cursor-pointer"
                      />
                      <input 
                        {...register(`questions.${index}.options.${optIndex}` as const)}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        placeholder={`Pilihan ${optIndex + 1}`}
                      />
                    </div>
                  ))}
                </fieldset>
              </div>
            </div>
          ))}

          <button 
            type="button" 
            onClick={() => append({ 
              id: Math.random().toString(), 
              text: '', 
              options: ['', '', '', ''], 
              correctOptionIndex: 0 
            })}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 font-medium hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Tambah Pertanyaan
          </button>
        </div>

        <div className="flex justify-between pt-6 border-t border-slate-200">
          <button 
            type="button"
            onClick={() => navigate('/teacher/evaluations')}
            className="px-8 py-3 text-slate-600 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" /> {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}
