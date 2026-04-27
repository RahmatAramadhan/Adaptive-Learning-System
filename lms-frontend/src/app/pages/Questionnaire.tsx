import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import api from '../../lib/api';
import { toast } from 'sonner';

// 14 pertanyaan kuesioner VAK
const QUESTIONS = [
  { id: 'q1', text: 'Ketika pembelajaran, kegiatan yang paling saya sukai adalah…', options: { a: 'Membuat catatan materi yang rapi', b: 'Menjelaskan materi atau bercerita ke teman', c: 'Menulis ulang atau menyalin materi praktikum (menulis ulang kode/sintaks)' } },
  { id: 'q2', text: 'Saat membaca materi atau sintaks (code) yang panjang, saya lebih suka…', options: { a: 'Membaca dalam hati dengan cepat', b: 'Membaca dengan bersuara (bergumam)', c: 'Membaca sambil menunjuk tulisan dengan jari' } },
  { id: 'q3', text: 'Saat belajar di kelas, saya paling mudah paham jika…', options: { a: 'Membaca materi dari modul/layar', b: 'Mendengarkan penjelasan dari guru', c: 'Langsung bergerak atau mempraktikkannya' } },
  { id: 'q4', text: 'Saya mudah mengingat informasi pelajaran dari apa yang…', options: { a: 'Saya lihat langsung', b: 'Saya dengarkan', c: 'Saya kerjakan/tulis sendiri' } },
  { id: 'q5', text: 'Ketika membuat catatan pelajaran, saya…', options: { a: 'Membuat catatan yang disertai coretan gambar/sketsa', b: 'Jarang mencatat karena lebih suka fokus mendengarkan', c: 'Banyak mencatat teks saja tanpa tambahan gambar' } },
  { id: 'q6', text: 'Jika guru bertanya, saya biasanya menjawab dengan…', options: { a: 'Singkat dan langsung ke intinya (ya/tidak)', b: 'Panjang lebar dan suka bercerita', c: 'Diiringi dengan banyak gerakan tangan atau tubuh' } },
  { id: 'q7', text: 'Saat suasana lingkungan belajar saya ramai, saya…', options: { a: 'Tetap bisa fokus belajar di depan komputer', b: 'Sangat mudah terganggu konsentrasi', c: 'Merasa gelisah dan ingin beranjak dari kursi' } },
  { id: 'q8', text: 'Untuk menghafal syntax atau rumus, cara yang saya gunakan adalah…', options: { a: 'Membayangkan bentuk kodenya didalam pikiran', b: 'Mengucapkannya berulang-ulang dengan suara', c: 'Menulis atau mengetik secara berulang kode tersebut' } },
  { id: 'q9', text: 'Saat mengobrol atau berdiskusi dengan teman, saya lebih suka…', options: { a: 'Bertatap muka secara langsung', b: 'Melalui telepon atau panggilan suara', c: 'Mengobrol dengan posisi berdekatan atau memperhatikan gerakan tubuhnya' } },
  { id: 'q10', text: 'Gaya atau tempo saya berbicara sehari-hari cenderung…', options: { a: 'Cepat dan kadang terburu-buru', b: 'Berirama dan intonasinya jelas (enak didengar)', c: 'Terkadang lambat karena banyak menggunakan bahasa tubuh' } },
  { id: 'q11', text: 'Saat mengerjakan tugas/modul, saya lebih suka…', options: { a: 'Mengikuti petunjuk gambar atau flowchart', b: 'Mengerjakannya sambil berbicara atau berdiskusi', c: 'Langsung memegang mouse/komputer sambil berbicara atau mencatat' } },
  { id: 'q12', text: 'Di waktu luang atau saat istirahat, saya lebih sering…', options: { a: 'Menonton video, film, atau membuat desain', b: 'Mendengarkan musik atau podcast', c: 'Bermain game e-sport atau beraktivitas fisik' } },
  { id: 'q13', text: 'Ketika dijelaskan, saya merasa paling cepat paham jika diajari dengan cara…', options: { a: 'Melihat guru mendemonstrasikan materinya di layar proyektor', b: 'Berdiskusi tanya jawab membahas materi secara lisan', c: 'Langsung mengerjakan project atau mempraktikkannya' } },
  { id: 'q14', text: 'Secara umum, hal yang paling saya sukai adalah…', options: { a: 'Gambar, desain visual, atau fotografi', b: 'Musik, audio, atau bernyanyi', c: 'Permainan (games) atau aktivitas yang menggerakkan tubuh' } },
];

export function Questionnaire() {
  const { refreshUser } = useAuth();
  const navigate        = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const answered = Object.keys(answers).length;
  const total    = QUESTIONS.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answered < total) { toast.error('Jawab semua pertanyaan terlebih dahulu.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/questionnaire/submit', { answers });
      await refreshUser();
      toast.success(`Gaya belajar kamu: ${res.data.learning_style.result.toUpperCase()}!`);
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Kuesioner Gaya Belajar</h1>
          <p className="text-slate-500">Jawab {total} pertanyaan berikut dengan jujur untuk menemukan gaya belajar terbaikmu (VAK).</p>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(answered / total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{answered}/{total} pertanyaan dijawab</p>
        </div>

        {/* Questions */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {QUESTIONS.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <p className="font-semibold text-slate-800">
                <span className="text-indigo-600 mr-2">{idx + 1}.</span>
                {q.text}
              </p>
              <div className="space-y-2">
                {(Object.entries(q.options) as [string, string][]).map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      answers[q.id] === key
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={key}
                      className="accent-indigo-600"
                      checked={answers[q.id] === key}
                      onChange={() => setAnswers(prev => ({ ...prev, [q.id]: key }))}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading || answered < total}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
          >
            {loading ? 'Memproses...' : 'Lihat Hasil Gaya Belajar Saya →'}
          </button>
        </form>
      </div>
    </div>
  );
}
