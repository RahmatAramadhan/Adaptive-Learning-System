import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import api from '../../lib/api';
import { toast } from 'sonner';

// ── DATA PERTANYAAN ────────────────────────────────────────────────────────
const OPEN_QUESTIONS = [
  { id: 'q1', text: 'Apa rencana kalian setelah lulus dari SMK? (Bekerja/Melanjutkan/Wirausaha)' },
  { id: 'q2', text: 'Apa pertimbangan positif kalian mengambil rencana tersebut?' },
  { id: 'q3', text: 'Apa rencana yang disarankan oleh orang tua setelah kalian lulus SMK? (Bekerja/Melanjutkan/Wirausaha)' },
  { id: 'q4', text: 'Apa alasan positif yang diambil orang tua dalam memberikan rencana tersebut?' },
  { id: 'q5', text: 'Apa cita-cita yang ingin kalian capai?' },
];

const CLOSED_QUESTIONS_SOURCE = [
  // Karakteristik Bekerja
  { id: 'b_1', text: 'Saya lebih tertarik segera memperoleh penghasilan daripada melanjutkan pendidikan.' },
  { id: 'b_2', text: 'Saya senang bekerja dengan aturan dan tanggung jawab yang jelas.' },
  { id: 'b_3', text: 'Saya merasa nyaman menjadi bagian dari sebuah organisasi atau perusahaan.' },
  { id: 'b_4', text: 'Saya menyukai pekerjaan yang memiliki target yang jelas.' },
  { id: 'b_5', text: 'Saya lebih senang menerapkan keterampilan daripada mempelajari teori baru.' },
  { id: 'b_6', text: 'Saya mudah menyesuaikan diri dengan lingkungan kerja yang baru.' },
  { id: 'b_7', text: 'Saya disiplin dalam mengikuti aturan yang berlaku.' },
  { id: 'b_8', text: 'Saya mampu bekerja sama dengan orang lain dalam sebuah tim.' },
  { id: 'b_9', text: 'Saya siap menerima arahan dari atasan.' },
  { id: 'b_10', text: 'Saya merasa percaya diri menghadapi dunia kerja.' },
  { id: 'b_11', text: 'Saya mampu menyelesaikan tugas sesuai tenggat waktu.' },
  { id: 'b_12', text: 'Saya senang memperoleh pengalaman kerja secara langsung.' },
  { id: 'b_13', text: 'Saya bertanggung jawab terhadap pekerjaan yang diberikan.' },
  { id: 'b_14', text: 'Saya lebih memilih pekerjaan yang memberikan penghasilan tetap.' },
  { id: 'b_15', text: 'Saya merasa menjadi karyawan sesuai dengan kepribadian saya.' },
  // Karakteristik Melanjutkan
  { id: 'm_1', text: 'Saya senang mempelajari hal-hal baru secara mendalam.' },
  { id: 'm_2', text: 'Saya menikmati kegiatan belajar meskipun tidak diwajibkan.' },
  { id: 'm_3', text: 'Saya tertarik memperluas wawasan melalui pendidikan yang lebih tinggi.' },
  { id: 'm_4', text: 'Saya suka membaca atau mencari informasi untuk menambah pengetahuan.' },
  { id: 'm_5', text: 'Saya senang berdiskusi mengenai berbagai topik pembelajaran.' },
  { id: 'm_6', text: 'Saya ingin menjadi ahli di bidang yang saya minati.' },
  { id: 'm_7', text: 'Saya memiliki motivasi untuk terus meningkatkan kemampuan akademik.' },
  { id: 'm_8', text: 'Saya menikmati tantangan dalam menyelesaikan tugas yang membutuhkan pemikiran.' },
  { id: 'm_9', text: 'Saya merasa pendidikan tinggi penting untuk masa depan saya.' },
  { id: 'm_10', text: 'Saya memiliki rasa ingin tahu yang tinggi terhadap berbagai ilmu pengetahuan.' },
  { id: 'm_11', text: 'Saya senang mengikuti pelatihan, seminar, atau kegiatan belajar lainnya.' },
  { id: 'm_12', text: 'Saya memiliki target pendidikan yang ingin saya capai.' },
  { id: 'm_13', text: 'Saya bersedia menginvestasikan waktu untuk belajar lebih lama demi masa depan.' },
  { id: 'm_14', text: 'Saya percaya bahwa belajar sepanjang hayat merupakan hal yang penting.' },
  { id: 'm_15', text: 'Saya merasa nyaman berada dalam lingkungan akademik.' },
  // Karakteristik Wirausaha
  { id: 'w_1', text: 'Saya senang mencari peluang yang dapat menghasilkan keuntungan.' },
  { id: 'w_2', text: 'Saya sering memiliki ide untuk membuat produk atau jasa baru.' },
  { id: 'w_3', text: 'Saya senang mencoba hal-hal baru meskipun ada risiko gagal.' },
  { id: 'w_4', text: 'Saya percaya diri dalam mengambil keputusan.' },
  { id: 'w_5', text: 'Saya mampu melihat peluang dari suatu masalah.' },
  { id: 'w_6', text: 'Saya tertarik membangun usaha milik sendiri.' },
  { id: 'w_7', text: 'Saya senang memimpin kegiatan atau kelompok.' },
  { id: 'w_8', text: 'Saya mudah beradaptasi terhadap perubahan.' },
  { id: 'w_9', text: 'Saya tidak mudah menyerah ketika menghadapi kegagalan.' },
  { id: 'w_10', text: 'Saya mampu memotivasi diri sendiri untuk mencapai tujuan.' },
  { id: 'w_11', text: 'Saya senang menawarkan ide atau produk kepada orang lain.' },
  { id: 'w_12', text: 'Saya berani mengambil risiko yang telah diperhitungkan.' },
  { id: 'w_13', text: 'Saya suka mencari cara agar pekerjaan menjadi lebih efektif dan menguntungkan.' },
  { id: 'w_14', text: 'Saya merasa tertantang untuk menciptakan sesuatu yang bernilai bagi orang lain.' },
  { id: 'w_15', text: 'Saya ingin menciptakan lapangan pekerjaan bagi orang lain.' },
];

function shuffleArray(array: any[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function BmwMapping() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  
  // Tiga tahapan: Terbuka -> Penjelasan (Transisi) -> Tertutup
  const [phase, setPhase] = useState<'OPEN' | 'TRANSITION' | 'CLOSED'>('OPEN');
  
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  
  const [closedQuestions, setClosedQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [closedAnswers, setClosedAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    setClosedQuestions(shuffleArray(CLOSED_QUESTIONS_SOURCE));
  }, []);

  // Lanjut dari pertanyaan terbuka ke layar transisi
  const handleToTransition = () => {
    const answeredCount = Object.keys(openAnswers).length;
    if (answeredCount < OPEN_QUESTIONS.length || Object.values(openAnswers).some(val => val.trim() === '')) {
      toast.error('Mohon isi semua pertanyaan terbuka terlebih dahulu.');
      return;
    }
    setPhase('TRANSITION');
  };

const handleAnswerClosed = async (value: number) => {
    const currentQ = closedQuestions[currentQIndex];
    
    const newAnswers = { ...closedAnswers, [currentQ.id]: value };
    setClosedAnswers(newAnswers);

    setTimeout(async () => {
      if (currentQIndex < closedQuestions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
      } else {
        await submitAll(newAnswers);
      }
    }, 150);
  };

  const submitAll = async (finalClosedAnswers: Record<string, number>) => {
    setLoading(true);
    try {
      const res = await api.post('/bmw-mapping/submit', {
        open_answers: openAnswers,
        answers: finalClosedAnswers
      });
      await refreshUser();
      toast.success(`Pemetaan selesai! Kecenderungan kamu: ${res.data.bmw_mapping.dominant_result}`);
      navigate('/student'); 
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message ?? 'Terjadi kesalahan saat menyimpan data.';
      
      toast.error(errorMessage, { duration: 6000 });
      
      if (err?.response?.status === 422) {
        setCurrentQIndex(0);        
        setClosedAnswers({});         
      } else {
        setCurrentQIndex(closedQuestions.length - 1); 
      }
    } finally {
      setLoading(false);
    }
  };

  // ── LAYAR 1: PERTANYAAN TERBUKA ──────────────────────────────────────────────
  if (phase === 'OPEN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
          
          <div className="text-center space-y-5">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Pemetaan Karier (BMW)</h1>
              <p className="text-slate-500 mt-2">Tahap 1: Evaluasi Rencana Karier</p>
            </div>
            
            <div className="bg-emerald-100/50 border border-emerald-200 rounded-2xl p-5 text-emerald-800 text-left shadow-sm">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 shrink-0 mt-0.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold mb-1 text-lg">Informasi Pengisian</h3>
                  <p className="text-sm/relaxed">
                    Kuesioner ini dirancang untuk memetakan potensi karier Anda. Tidak ada jawaban yang benar atau salah, dan hasilnya tidak memengaruhi penilaian akademik. Silakan jawab dengan jujur sesuai dengan minat dan rencana Anda ke depan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {OPEN_QUESTIONS.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <label className="block font-semibold text-slate-800 mb-3 leading-relaxed">
                  <span className="text-emerald-600 mr-2">{idx + 1}.</span>
                  {q.text}
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none resize-y"
                  placeholder="Tuliskan jawaban Anda di sini..."
                  value={openAnswers[q.id] || ''}
                  onChange={(e) => setOpenAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                />
              </div>
            ))}

            <button
              onClick={handleToTransition}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 mt-4 flex justify-center items-center gap-2"
            >
              Lanjut ke Sesi Kuesioner
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LAYAR 2: TRANSISI / INSTRUKSI ────────────────────────────────────────────
  if (phase === 'TRANSITION') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center py-10 px-4">
        <div className="max-w-xl mx-auto w-full bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-8 md:p-12 text-center space-y-8 animate-in zoom-in-95 duration-300">
          
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-white">Tahap 2: Kuesioner Pilihan</h2>
          
          <div className="space-y-5 text-slate-300 text-lg leading-relaxed text-left bg-slate-900/50 p-6 rounded-2xl">
            <p className="flex items-start gap-3">
              <svg className="w-6 h-6 shrink-0 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Pada bagian ini, Anda diminta untuk memilih jawaban <strong>"Ya, Sesuai"</strong> atau <strong>"Tidak Sesuai"</strong> pada setiap pernyataan.</span>
            </p>
            <p className="flex items-start gap-3">
              <svg className="w-6 h-6 shrink-0 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Tidak ada jawaban yang dinilai salah. Seluruh pernyataan ditujukan murni untuk mengenali karakteristik dominan Anda.</span>
            </p>
            <p className="flex items-start gap-3">
              <svg className="w-6 h-6 shrink-0 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Jawablah secara spontan berdasarkan insting pertama Anda. Tingkat kejujuran Anda akan menentukan keakuratan hasil pemetaan.</span>
            </p>
          </div>

          <button
            onClick={() => setPhase('CLOSED')}
            className="w-full py-4 mt-6 bg-emerald-600 hover:bg-emerald-500 text-white text-xl font-bold rounded-2xl transition-colors shadow-lg shadow-emerald-900/50"
          >
            Mulai Pengisian
          </button>
          
        </div>
      </div>
    );
  }

  // ── LAYAR 3: PERTANYAAN TERTUTUP (SATU PER SATU) ─────────────────────────────
  const currentQuestion = closedQuestions[currentQIndex];
  const progressPercent = ((currentQIndex) / closedQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col py-10 px-4">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        
        {/* Header & Progress Bar */}
        <div className="mb-10 space-y-4">
          <p className="text-center text-slate-400 font-medium">
            Pertanyaan {currentQIndex + 1} dari {closedQuestions.length}
          </p>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Card Pertanyaan */}
        <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center leading-snug mb-12">
            "{currentQuestion?.text}"
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              disabled={loading}
              onClick={() => handleAnswerClosed(1)}
              className="py-6 px-4 bg-slate-800 hover:bg-emerald-600 border-2 border-slate-700 hover:border-emerald-500 active:bg-emerald-700 active:border-emerald-600 active:scale-95 text-white text-xl font-bold rounded-2xl transition-all duration-150"
            >
              Ya, Sesuai
            </button>
            
            <button
              disabled={loading}
              onClick={() => handleAnswerClosed(0)}
              className="py-6 px-4 bg-slate-800 hover:bg-rose-600 border-2 border-slate-700 hover:border-rose-500 active:bg-rose-700 active:border-rose-600 active:scale-95 text-white text-xl font-bold rounded-2xl transition-all duration-150"
            >
              Tidak Sesuai
            </button>
          </div>

          {loading && (
             <p className="text-center text-emerald-400 mt-8 animate-pulse font-medium flex items-center justify-center gap-2">
               <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Menyimpan jawaban Anda...
             </p>
          )}
        </div>

      </div>
    </div>
  );
}