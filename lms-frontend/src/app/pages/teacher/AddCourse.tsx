import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router';
import { useData } from '../../context/DataContext';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/api';

interface CourseForm {
  title: string;
  description: string;
  thumbnail?: string;
}

export function AddCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, addCourse, updateCourse } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const courseId = id ? parseInt(id) : null;

  const { register, handleSubmit, reset, setValue, watch } = useForm<CourseForm>({
    defaultValues: {
      title: '',
      description: '',
    }
  });

  // Load course data saat edit
  useEffect(() => {
    if (!courseId) return;

    const courseFromContext = courses.find(c => c.id === courseId);
    if (courseFromContext) {
      setValue('title', courseFromContext.title);
      setValue('description', courseFromContext.description);
      setThumbnail(courseFromContext.thumbnail || '');
      setIsLoading(false);
    } else if (courses.length > 0) {
      setIsLoading(true);
      api.get(`/courses/${courseId}`)
        .then(res => {
          setValue('title', res.data.title);
          setValue('description', res.data.description);
          setThumbnail(res.data.thumbnail || '');
        })
        .catch(err => {
          console.error('Failed to load course:', err);
          toast.error('Gagal memuat data kursus.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [courseId, courses, setValue]);

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      
      setIsUploadingImage(true);
      const toastId = toast.loading('Mengunggah gambar cover...');
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Upload response:', res.data); // DEBUG
        const uploadedUrl = res.data.url;
        setThumbnail(uploadedUrl);
        toast.success('Gambar cover berhasil diunggah!', { id: toastId });
      } catch (err) {
        console.error('Upload error:', err); // DEBUG
        toast.error('Gagal mengunggah gambar cover.', { id: toastId });
      } finally {
        setIsUploadingImage(false);
      }
    };
  };

  const onSubmit = async (data: CourseForm) => {
    const toastId = toast.loading(courseId ? 'Memperbarui kursus...' : 'Membuat kursus...');
    try {
      if (courseId) {
        // Update mode: HANYA update title, description, dan thumbnail
        // Jangan kirim modules agar tidak di-delete di backend
        await updateCourse(courseId, {
          title: data.title,
          description: data.description,
          thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80',
        });
        toast.success('Kursus berhasil diperbarui!', { id: toastId });
        navigate('/teacher/modules');
      } else {
        // Create mode: buat course baru tanpa modules
        await addCourse({
          ...data,
          thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80',
          modules: [],
        });
        toast.success('Kursus berhasil dibuat!', { id: toastId });
        reset();
        navigate('/teacher/modules');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan kursus. Coba lagi.', { id: toastId });
    }
  };

  return (
    <div className="w-full space-y-8 pb-20 px-8">
      <button
        onClick={() => navigate(courseId ? '/teacher/modules' : '/teacher')}
        className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali
      </button>

      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          {courseId ? 'Edit Kursus' : 'Buat Kursus Baru'}
        </h1>
        <p className="text-lg text-slate-500">
          {courseId ? 'Ubah informasi kursus Anda' : 'Buat kursus pembelajaran adaptif baru'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Memuat data kursus...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Course Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Informasi Kursus</h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Judul Kursus *</label>
              <input
                {...register('title', { required: 'Judul kursus harus diisi' })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors text-base"
                placeholder="Contoh: Basis Data untuk SMK"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Deskripsi Kursus</label>
              <textarea
                {...register('description')}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors text-base resize-vertical"
                rows={8}
                placeholder="Jelaskan apa yang akan dipelajari siswa di kursus ini..."
              />
            </div>
          </div>

          {/* Course Cover Image Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Gambar Cover Kursus</h2>

            {thumbnail ? (
              <div className="space-y-4">
                <div className="relative group rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={thumbnail}
                    alt="Course cover"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={isUploadingImage}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingImage ? 'Mengunggah...' : 'Ganti Gambar'}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setThumbnail('')}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <X className="w-4 h-4" />
                  Hapus Gambar
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                onClick={handleImageUpload}
              >
                <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-base font-semibold text-slate-700 mb-2">Pilih Gambar Cover</p>
                <p className="text-sm text-slate-500 mb-4">
                  Klik di sini atau seret gambar untuk mengunggah
                </p>
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={isUploadingImage}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {isUploadingImage ? 'Mengunggah...' : 'Unggah Gambar'}
                </button>
              </div>
            )}
          </div>

          {/* Info Box untuk Edit Mode */}
          {courseId && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
              <p className="text-base text-indigo-900 font-medium">
                💡 Untuk menambah atau mengatur modul pembelajaran, silakan ke halaman <strong>Kelola Materi</strong>
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 justify-end pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate(courseId ? '/teacher/modules' : '/teacher')}
              className="px-8 py-3 border border-slate-300 rounded-lg font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
            >
              <Save className="w-5 h-5" />
              {courseId ? 'Simpan Perubahan' : 'Buat Kursus'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
