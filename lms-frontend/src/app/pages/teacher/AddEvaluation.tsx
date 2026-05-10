import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Evaluation, Question } from '../../types';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/api';

interface CourseOption {
  id: string;
  title: string;
  modules: { id: string; title: string }[];
}

interface ModuleOption {
  id: string;
  title: string;
}

export function AddEvaluation() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<Evaluation>({
    defaultValues: {
      id: '',
      courseId: '',
      moduleId: '',
      title: '',
      questions: [{ id: '', text: '', options: ['', '', '', ''], correctOptionIndex: 0 }]
    }
  });

  const courseId = watch('courseId');

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  // Load courses on mount
  React.useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        console.log('Fetching courses from API...');
        const res = await api.get('/courses');
        console.log('Courses API Response:', res.data);
        console.log('Response is array?', Array.isArray(res.data));
        console.log('First course modules:', res.data[0]?.modules);
        
        if (!Array.isArray(res.data)) {
          console.warn('Response is not an array!', typeof res.data);
        }
        
        setCourses(res.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        console.error('Error message:', err instanceof Error ? err.message : String(err));
        if (err instanceof Error && 'response' in err) {
          console.error('Response status:', (err as any).response?.status);
          console.error('Response data:', (err as any).response?.data);
        }
        toast.error('Gagal memuat kursus');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  // Load modules when course changes
  React.useEffect(() => {
    if (!courseId) {
      setModules([]);
      return;
    }

    console.log('Looking for course with id:', courseId, 'type:', typeof courseId);
    const course = courses.find(c => String(c.id) === String(courseId));
    console.log('Found course:', course);
    if (course) {
      console.log('Setting modules:', course.modules);
      setModules(course.modules || []);
    } else {
      console.log('Course not found! Available courses:', courses.map(c => ({ id: c.id, type: typeof c.id })));
    }
  }, [courseId, courses]);

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

    // Validate all questions have text and options
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
          correctOptionIndex: Number(q.correctOptionIndex)
        }))
      };

      await api.post('/evaluations', payload);
      toast.success('Evaluasi berhasil dibuat!');
      reset();
      navigate('/teacher/evaluations');
    } catch (err) {
      console.error(err);
      toast.error('Gagal membuat evaluasi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <button 
        onClick={() => navigate('/teacher/evaluations')}
        className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Evaluasi
      </button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Buat Evaluasi Baru</h1>
        <p className="text-slate-500">Desain kuis untuk menilai kemajuan siswa.</p>
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
                disabled={loading}
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
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                disabled={!courseId || modules.length === 0}
              >
                <option value="">
                  {!courseId ? 'Pilih kursus terlebih dahulu...' : modules.length === 0 ? 'Tidak ada modul' : 'Pilih modul...'}
                </option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
              {errors.moduleId && <p className="text-red-500 text-sm mt-1">{errors.moduleId.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <button 
                type="button" 
                onClick={() => remove(index)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                title="Hapus pertanyaan"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pertanyaan {index + 1}</label>
                  <textarea 
                    {...register(`questions.${index}.text` as const, { required: true })} 
                    className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-medium resize-none"
                    placeholder="Masukkan teks pertanyaan..."
                    rows={2}
                  />
                </div>
                
                <fieldset className="space-y-3">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Pilihan Jawaban (pilih yang benar)</label>
                  {[0, 1, 2, 3].map((optIndex) => (
                    <div key={optIndex} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <input 
                        type="radio" 
                        value={String(optIndex)}
                        {...register(`questions.${index}.correctOptionIndex` as const, { required: true })}
                        className="w-4 h-4 text-indigo-600 mt-1 cursor-pointer"
                      />
                      <input 
                        {...register(`questions.${index}.options.${optIndex}` as const, { required: true })}
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
            <Save className="w-5 h-5" /> {submitting ? 'Menyimpan...' : 'Simpan Evaluasi'}
          </button>
        </div>
      </form>
    </div>
  );
}
