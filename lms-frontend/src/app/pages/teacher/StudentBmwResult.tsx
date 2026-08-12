import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Briefcase, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../../lib/api';

interface StudentDetail {
  id: number;
  name: string;
  email: string;
  class: { name: string } | null;
  bmw_mapping: {
    dominant_result: string;
    bekerja_score: number;
    melanjutkan_score: number;
    wirausaha_score: number;
    open_answers: Record<string, string>;
    closed_answers: Record<string, number>;
  } | null;
}

export function StudentBmwResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/students/${id}`)
      .then(res => {
        setStudent(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Memuat data...</div>;
  }

  if (!student || !student.bmw_mapping) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Data Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-4">Siswa ini belum mengisi pemetaan BMW atau data tidak ada.</p>
        <button onClick={() => navigate(-1)} className="text-indigo-600 font-medium hover:underline">Kembali</button>
      </div>
    );
  }

  const bmw = student.bmw_mapping;
  const bPct = Math.round(((bmw.bekerja_score || 0) / 15) * 100);
  const mPct = Math.round(((bmw.melanjutkan_score || 0) / 15) * 100);
  const wPct = Math.round(((bmw.wirausaha_score || 0) / 15) * 100);

  const dominant = bmw.dominant_result?.toLowerCase() || '';
  const isBekerjaDom = dominant === 'bekerja';
  const isMelanjutkanDom = dominant === 'melanjutkan';
  const isWirausahaDom = dominant === 'wirausaha';

  const openQuestions = [
    { key: 'q1', text: 'Apa rencana kalian setelah lulus dari SMK? (Bekerja/Melanjutkan/Wirausaha)' },
    { key: 'q2', text: 'Apa pertimbangan positif kalian mengambil rencana tersebut?' },
    { key: 'q3', text: 'Apa rencana yang disarankan oleh orang tua setelah kalian lulus SMK? (Bekerja/Melanjutkan/Wirausaha)' },
    { key: 'q4', text: 'Apa alasan positif yang diambil orang tua dalam memberikan rencana tersebut?' },
    { key: 'q5', text: 'Apa cita-cita yang ingin kalian capai?' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/teacher/students')}
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-600" /> Detail Pemetaan BMW
          </h1>
          <p className="text-slate-500">{student.name} • {student.class?.name || 'Belum ada kelas'}</p>
        </div>
      </div>

      {/* Ringkasan Skor */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Kecenderungan Minat</h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className={`p-6 rounded-xl border transition-colors ${isBekerjaDom ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
            <div className={`text-sm font-semibold mb-2 ${isBekerjaDom ? 'text-emerald-600' : 'text-slate-500'}`}>Bekerja</div>
            <div className={`text-4xl font-bold ${isBekerjaDom ? 'text-emerald-700' : 'text-slate-700'}`}>{bPct}%</div>
            <div className="text-xs text-slate-400 mt-2">Skor: {bmw.bekerja_score}/15</div>
          </div>
          <div className={`p-6 rounded-xl border transition-colors ${isMelanjutkanDom ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
            <div className={`text-sm font-semibold mb-2 ${isMelanjutkanDom ? 'text-emerald-600' : 'text-slate-500'}`}>Melanjutkan</div>
            <div className={`text-4xl font-bold ${isMelanjutkanDom ? 'text-emerald-700' : 'text-slate-700'}`}>{mPct}%</div>
            <div className="text-xs text-slate-400 mt-2">Skor: {bmw.melanjutkan_score}/15</div>
          </div>
          <div className={`p-6 rounded-xl border transition-colors ${isWirausahaDom ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
            <div className={`text-sm font-semibold mb-2 ${isWirausahaDom ? 'text-emerald-600' : 'text-slate-500'}`}>Wirausaha</div>
            <div className={`text-4xl font-bold ${isWirausahaDom ? 'text-emerald-700' : 'text-slate-700'}`}>{wPct}%</div>
            <div className="text-xs text-slate-400 mt-2">Skor: {bmw.wirausaha_score}/15</div>
          </div>
        </div>
      </div>

      {/* Jawaban Terbuka */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Jawaban Refleksi (Esai)</h3>
        <div className="space-y-4">
          {openQuestions.map((q, i) => (
            <div key={q.key} className="bg-slate-50/50 rounded-xl p-5 border border-slate-100">
              <div className="text-sm font-semibold text-slate-700 mb-2">{i + 1}. {q.text}</div>
              <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                {bmw.open_answers?.[q.key] || <span className="italic text-slate-400">Tidak ada jawaban</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Jawaban Tertutup (Pilihan Ya/Tidak) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Detail Jawaban Pilihan</h3>
        
        {['bekerja', 'melanjutkan', 'wirausaha'].map((kategori) => {
          const listSoal = closedQuestionsList.filter(q => q.category === kategori);
          
          return (
            <div key={kategori} className="mb-8 last:mb-0">
              <h4 className="text-lg font-bold text-indigo-900 capitalize mb-4 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                Pernyataan {kategori}
              </h4>
              <div className="space-y-2">
                {listSoal.map((soal, index) => {
                  const jawaban = bmw.closed_answers?.[soal.key];
                  const isYa = jawaban === 1 || jawaban === "1"; 

                  return (
                    <div key={soal.key} className="flex gap-4 items-start p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-100 last:border-0">
                      <div className="w-6 text-slate-400 font-medium shrink-0">{index + 1}.</div>
                      <div className="flex-1 text-slate-700 text-sm">{soal.text}</div>
                      <div className="shrink-0 w-24 flex justify-end">
                        {isYa ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ya
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">
                            <XCircle className="w-3.5 h-3.5" /> Tidak
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// ── DATA PERTANYAAN TERTUTUP (Sesuai Dokumen) ──
const closedQuestionsList = [
  // BEKERJA
  { key: 'b_1', category: 'bekerja', text: 'Saya lebih tertarik segera memperoleh penghasilan daripada melanjutkan pendidikan.' },
  { key: 'b_2', category: 'bekerja', text: 'Saya senang bekerja dengan aturan dan tanggung jawab yang jelas.' },
  { key: 'b_3', category: 'bekerja', text: 'Saya merasa nyaman menjadi bagian dari sebuah organisasi atau perusahaan.' },
  { key: 'b_4', category: 'bekerja', text: 'Saya menyukai pekerjaan yang memiliki target yang jelas.' },
  { key: 'b_5', category: 'bekerja', text: 'Saya lebih senang menerapkan keterampilan daripada mempelajari teori baru.' },
  { key: 'b_6', category: 'bekerja', text: 'Saya mudah menyesuaikan diri dengan lingkungan kerja yang baru.' },
  { key: 'b_7', category: 'bekerja', text: 'Saya disiplin dalam mengikuti aturan yang berlaku.' },
  { key: 'b_8', category: 'bekerja', text: 'Saya mampu bekerja sama dengan orang lain dalam sebuah tim.' },
  { key: 'b_9', category: 'bekerja', text: 'Saya siap menerima arahan dari atasan.' },
  { key: 'b_10', category: 'bekerja', text: 'Saya merasa percaya diri menghadapi dunia kerja.' },
  { key: 'b_11', category: 'bekerja', text: 'Saya mampu menyelesaikan tugas sesuai tenggat waktu.' },
  { key: 'b_12', category: 'bekerja', text: 'Saya senang memperoleh pengalaman kerja secara langsung.' },
  { key: 'b_13', category: 'bekerja', text: 'Saya bertanggung jawab terhadap pekerjaan yang diberikan.' },
  { key: 'b_14', category: 'bekerja', text: 'Saya lebih memilih pekerjaan yang memberikan penghasilan tetap.' },
  { key: 'b_15', category: 'bekerja', text: 'Saya merasa menjadi karyawan sesuai dengan kepribadian saya.' },

  // MELANJUTKAN (KULIAH)
  { key: 'm_1', category: 'melanjutkan', text: 'Saya senang mempelajari hal-hal baru secara mendalam.' },
  { key: 'm_2', category: 'melanjutkan', text: 'Saya menikmati kegiatan belajar meskipun tidak diwajibkan.' },
  { key: 'm_3', category: 'melanjutkan', text: 'Saya tertarik memperluas wawasan melalui pendidikan yang lebih tinggi.' },
  { key: 'm_4', category: 'melanjutkan', text: 'Saya suka membaca atau mencari informasi untuk menambah pengetahuan.' },
  { key: 'm_5', category: 'melanjutkan', text: 'Saya senang berdiskusi mengenai berbagai topik pembelajaran.' },
  { key: 'm_6', category: 'melanjutkan', text: 'Saya ingin menjadi ahli di bidang yang saya minati.' },
  { key: 'm_7', category: 'melanjutkan', text: 'Saya memiliki motivasi untuk terus meningkatkan kemampuan akademik.' },
  { key: 'm_8', category: 'melanjutkan', text: 'Saya menikmati tantangan dalam menyelesaikan tugas yang membutuhkan pemikiran.' },
  { key: 'm_9', category: 'melanjutkan', text: 'Saya merasa pendidikan tinggi penting untuk masa depan saya.' },
  { key: 'm_10', category: 'melanjutkan', text: 'Saya memiliki rasa ingin tahu yang tinggi terhadap berbagai ilmu pengetahuan.' },
  { key: 'm_11', category: 'melanjutkan', text: 'Saya senang mengikuti pelatihan, seminar, atau kegiatan belajar lainnya.' },
  { key: 'm_12', category: 'melanjutkan', text: 'Saya memiliki target pendidikan yang ingin saya capai.' },
  { key: 'm_13', category: 'melanjutkan', text: 'Saya bersedia menginvestasikan waktu untuk belajar lebih lama demi masa depan.' },
  { key: 'm_14', category: 'melanjutkan', text: 'Saya percaya bahwa belajar sepanjang hayat merupakan hal yang penting.' },
  { key: 'm_15', category: 'melanjutkan', text: 'Saya merasa nyaman berada dalam lingkungan akademik.' },

  // WIRAUSAHA
  { key: 'w_1', category: 'wirausaha', text: 'Saya senang mencari peluang yang dapat menghasilkan keuntungan.' },
  { key: 'w_2', category: 'wirausaha', text: 'Saya sering memiliki ide untuk membuat produk atau jasa baru.' },
  { key: 'w_3', category: 'wirausaha', text: 'Saya senang mencoba hal-hal baru meskipun ada risiko gagal.' },
  { key: 'w_4', category: 'wirausaha', text: 'Saya percaya diri dalam mengambil keputusan.' },
  { key: 'w_5', category: 'wirausaha', text: 'Saya mampu melihat peluang dari suatu masalah.' },
  { key: 'w_6', category: 'wirausaha', text: 'Saya tertarik membangun usaha milik sendiri.' },
  { key: 'w_7', category: 'wirausaha', text: 'Saya senang memimpin kegiatan atau kelompok.' },
  { key: 'w_8', category: 'wirausaha', text: 'Saya mudah beradaptasi terhadap perubahan.' },
  { key: 'w_9', category: 'wirausaha', text: 'Saya tidak mudah menyerah ketika menghadapi kegagalan.' },
  { key: 'w_10', category: 'wirausaha', text: 'Saya mampu memotivasi diri sendiri untuk mencapai tujuan.' },
  { key: 'w_11', category: 'wirausaha', text: 'Saya senang menawarkan ide atau produk kepada orang lain.' },
  { key: 'w_12', category: 'wirausaha', text: 'Saya berani mengambil risiko yang telah diperhitungkan.' },
  { key: 'w_13', category: 'wirausaha', text: 'Saya suka mencari cara agar pekerjaan menjadi lebih efektif dan menguntungkan.' },
  { key: 'w_14', category: 'wirausaha', text: 'Saya merasa tertantang untuk menciptakan sesuatu yang bernilai bagi orang lain.' },
  { key: 'w_15', category: 'wirausaha', text: 'Saya ingin menciptakan lapangan pekerjaan bagi orang lain.' }
];