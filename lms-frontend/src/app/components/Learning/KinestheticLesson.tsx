import React, { useEffect, useMemo, useState } from 'react';
import { KinestheticContent, KinestheticBlock, QuizQuestion } from '../../types';
import { Reorder, motion } from 'motion/react';
import { Hand, CheckCircle2, RotateCcw, BookOpen, PlayCircle, Code2, Play } from 'lucide-react';
import { executeSqlMock, SqlExecutionResult } from '@/app/utils/sqlMock';

interface Props {
  content: KinestheticContent;
}

interface DdlSchemaColumn {
  name: string;
  type: string;
  constraints: string[];
}

interface DdlSchemaTable {
  name: string;
  columns: DdlSchemaColumn[];
  rowCount: number;
}

export function KinestheticLesson({ content }: Props) {
  const sections = useMemo(() => buildSections(content), [content]);

  if (sections.length > 0) {
    return <SectionedKinestheticLesson sections={sections} />;
  }

  // Old format - existing drag-drop code
  return <DragDropKinestheticLesson content={content} />;
}

type KinestheticSection = {
  sectionNumber: number;
  blocks: KinestheticBlock[];
};

function buildSections(content: KinestheticContent): KinestheticSection[] {
  const blocks = Array.isArray(content.blocks) && content.blocks.length > 0
    ? content.blocks
    : buildLegacyBlocks(content);

  const grouped = new Map<number, KinestheticBlock[]>();

  blocks.forEach((block) => {
    const sectionNumber = Math.max(1, block.section || 1);
    const existing = grouped.get(sectionNumber) || [];
    existing.push(block);
    grouped.set(sectionNumber, existing);
  });

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left - right)
    .map(([sectionNumber, sectionBlocks]) => ({ sectionNumber, blocks: sectionBlocks }));
}

function buildLegacyBlocks(content: KinestheticContent): KinestheticBlock[] {
  const blocks: KinestheticBlock[] = [];

  if (content.learningMaterial) {
    blocks.push({
      id: 'legacy-material',
      section: 1,
      type: 'material',
      content: content.learningMaterial,
    });
  }

  if (content.instructions || (content.items && content.items.length > 0)) {
    blocks.push({
      id: 'legacy-practice',
      section: 1,
      type: 'practice-text',
      instructions: content.instructions || 'Kerjakan latihan berikut',
      content: content.items && content.items.length > 0
        ? `Susun atau baca item berikut: ${content.items.join(', ')}`
        : 'Latihan interaktif akan muncul di sini setelah blok baru dibuat.',
    });
  }

  if (blocks.length === 0) {
    blocks.push({
      id: 'legacy-empty',
      section: 1,
      type: 'material',
      content: 'Konten kinestetik belum dikonfigurasi dalam format berjenjang. Silakan perbarui modul ini dari editor guru.',
    });
  }

  return blocks;
}

function SectionedKinestheticLesson({ sections }: { sections: KinestheticSection[] }) {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<number, number>>>({});
  const [passedSections, setPassedSections] = useState<Record<string, boolean>>({});
  const [sectionFeedback, setSectionFeedback] = useState<Record<string, { type: 'success' | 'error'; message: string }>>({});
  const currentSection = sections[activeSectionIndex];
  const currentSectionPassed = !hasQuiz(currentSection) || Boolean(passedSections[String(activeSectionIndex)]);
  const hasNextSection = activeSectionIndex < sections.length - 1;

  const goToNextSection = () => {
    setActiveSectionIndex((current) => Math.min(sections.length - 1, current + 1));
  };

  useEffect(() => {
    const current = sections[activeSectionIndex];
    if (!current || hasQuiz(current)) {
      return;
    }

    setPassedSections((state) => {
      const key = String(activeSectionIndex);
      if (state[key]) {
        return state;
      }

      return { ...state, [key]: true };
    });
  }, [activeSectionIndex, sections]);

  return (
    <motion.div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 space-y-5">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Hand className="w-6 h-6" />
            </span>
            Kinesthetic Sections
          </h3>
          <p className="text-slate-500">Materi kinestetik dipisahkan per section. Kerjakan quiz di setiap section untuk membuka section berikutnya.</p>

          <div className="flex flex-wrap gap-2">
            {sections.map((section, index) => {
              const isActive = index === activeSectionIndex;
              const isLocked = index > activeSectionIndex && !passedSections[String(index - 1)];

              return (
                <button
                  key={section.sectionNumber}
                  type="button"
                  onClick={() => {
                    if (index <= activeSectionIndex || !isLocked) {
                      setActiveSectionIndex(index);
                    }
                  }}
                  className={[
                    'px-4 py-2 rounded-full text-sm font-semibold border transition-all',
                    isActive
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : isLocked
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:text-orange-600',
                  ].join(' ')}
                  disabled={isLocked}
                >
                  Section {section.sectionNumber}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6 p-8">
          {currentSection && renderSection(
            currentSection,
            activeSectionIndex,
            answers,
            setAnswers,
            passedSections,
            setPassedSections,
            sectionFeedback,
            setSectionFeedback,
            hasNextSection,
            goToNextSection
          )}

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveSectionIndex((current) => Math.max(0, current - 1))}
              disabled={activeSectionIndex === 0}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Prev
            </button>

            <div className="text-sm text-slate-500">
              {currentSectionPassed ? 'Section ini sudah lulus quiz.' : 'Selesaikan quiz untuk lanjut.'}
            </div>

            <button
              type="button"
              onClick={() => setActiveSectionIndex((current) => Math.min(sections.length - 1, current + 1))}
              disabled={!hasNextSection || !currentSectionPassed}
              className="px-4 py-2 rounded-lg bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function hasQuiz(section: KinestheticSection | undefined): boolean {
  return Boolean(section?.blocks.some((block) => block.type === 'quiz' && (block.questions?.length || 0) > 0));
}

function renderSection(
  section: KinestheticSection,
  index: number,
  answers: Record<string, Record<number, number>>,
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, Record<number, number>>>>,
  passedSections: Record<string, boolean>,
  setPassedSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  sectionFeedback: Record<string, { type: 'success' | 'error'; message: string }>,
  setSectionFeedback: React.Dispatch<React.SetStateAction<Record<string, { type: 'success' | 'error'; message: string }>>>,
  hasNextSection: boolean,
  goToNextSection: () => void
) {
  const quizBlock = section.blocks.find((block) => block.type === 'quiz');
  const sectionId = String(index);
  const sectionAnswers = answers[sectionId] || {};
  const quiz = quizBlock?.questions || [];
  const answeredCount = quiz.filter((question, questionIndex) => sectionAnswers[questionIndex] !== undefined).length;

  const evaluateQuiz = () => {
    if (!quiz.length) return;

    const correctCount = quiz.reduce((total, question, questionIndex) => {
      return total + (sectionAnswers[questionIndex] === question.correctOptionIndex ? 1 : 0);
    }, 0);

    const score = (correctCount / quiz.length) * 100;
    if (score >= 70) {
      setPassedSections((current) => ({ ...current, [sectionId]: true }));
      setSectionFeedback((current) => ({
        ...current,
        [sectionId]: {
          type: 'success',
          message: `Jawaban benar. Skor kamu ${score.toFixed(0)}%. Section ini sudah terbuka.`,
        },
      }));

      if (hasNextSection) {
        goToNextSection();
      }
      return;
    }

    setSectionFeedback((current) => ({
      ...current,
      [sectionId]: {
        type: 'error',
        message: `Jawaban masih salah. Skor kamu ${score.toFixed(0)}%. Coba lagi sebelum lanjut ke section berikutnya.`,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        {section.blocks
          .filter((block) => block.type !== 'quiz')
          .map((block, blockIndex) => renderKinestheticBlock(block, blockIndex))}
      </div>

      {quizBlock && quiz.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Evaluasi Section {section.sectionNumber}</p>
            <h4 className="text-xl font-bold text-slate-900 mt-1">{quizBlock.title || 'Quiz singkat'}</h4>
            <p className="text-sm text-slate-500 mt-1">Jawab semua pertanyaan untuk membuka section berikutnya.</p>
          </div>

          <div className="space-y-4">
            {quiz.map((question, questionIndex) => (
              <div key={questionIndex} className="rounded-lg border border-slate-200 p-4 space-y-3 bg-slate-50/80">
                <p className="font-semibold text-slate-900">{questionIndex + 1}. {question.text}</p>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-transparent hover:border-indigo-200 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={`kinesthetic-${sectionId}-q-${questionIndex}`}
                        checked={sectionAnswers[questionIndex] === optionIndex}
                        onChange={() => setAnswers((current) => ({
                          ...current,
                          [sectionId]: {
                            ...(current[sectionId] || {}),
                            [questionIndex]: optionIndex,
                          },
                        }))}
                        className="mt-1 h-4 w-4 text-indigo-600"
                      />
                      <span className="text-slate-800">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="text-sm text-slate-600">Terjawab: <span className="font-semibold text-indigo-600">{answeredCount}/{quiz.length}</span></p>
            <button
              type="button"
              onClick={evaluateQuiz}
              disabled={answeredCount < quiz.length || passedSections[sectionId]}
              className="px-4 py-2 rounded-lg bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700"
            >
              {passedSections[sectionId] ? 'Sudah Lulus' : 'Cek Jawaban'}
            </button>
          </div>

          {sectionFeedback[sectionId] && (
            <div className={[
              'rounded-lg border p-4 text-sm font-medium',
              sectionFeedback[sectionId].type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700',
            ].join(' ')}>
              {sectionFeedback[sectionId].message}
            </div>
          )}
        </div>
      )}

      {!quizBlock && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Section ini belum punya evaluasi. Tombol Next akan terbuka otomatis.
        </div>
      )}
    </div>
  );
}

function renderKinestheticBlock(block: KinestheticBlock, index: number) {
  if (block.type === 'material') {
    return (
      <div key={block.id || index} className="motion-safe:animate-[fadeIn_0.2s_ease-out]">
        <MaterialBlock content={block.content} />
      </div>
    );
  }

  if (block.type === 'practice-text') {
    return (
      <div key={block.id || index} className="motion-safe:animate-[fadeIn_0.2s_ease-out]">
        <PracticeTextBlock block={block} />
      </div>
    );
  }

  if (block.type === 'practice-sql') {
    return (
      <div key={block.id || index} className="motion-safe:animate-[fadeIn_0.2s_ease-out]">
        <PracticeSqlBlock block={block} />
      </div>
    );
  }

  return null;
}

function TieredKinestheticLesson({ blocks }: { blocks: KinestheticBlock[] }) {
  return (
    <motion.div className="space-y-6">
      {blocks.map((block, idx) => (
        <motion.div
          key={block.id || idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          {block.type === 'material' && <MaterialBlock content={block.content} />}
          {block.type === 'practice-text' && <PracticeTextBlock block={block} />}
          {block.type === 'practice-sql' && <PracticeSqlBlock block={block} />}
        </motion.div>
      ))}
    </motion.div>
  );
}

function MaterialBlock({ content }: { content?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-100 p-6 border-b border-slate-200 flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg border border-slate-300 text-slate-700">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Materi Pembelajaran</h3>
          <p className="text-sm text-slate-500">Pelajari konsep ini sebelum praktik</p>
        </div>
      </div>
      <div className="p-8">
        <div
          className="prose prose-lg max-w-none text-slate-700 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900 [&_p]:my-3 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:my-1 [&_img]:rounded-xl [&_img]:my-4 [&_img]:shadow-sm [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600"
          dangerouslySetInnerHTML={{
            __html: content || '<p class="text-slate-400">Belum ada konten materi</p>',
          }}
        />
      </div>
    </div>
  );
}

function PracticeTextBlock({ block }: { block: KinestheticBlock }) {
  const [completed, setCompleted] = useState(false);
  const [answer, setAnswer] = useState('');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden ring-4 ring-amber-500/10">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-white flex items-center gap-4">
        <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <Hand className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">Praktik</h3>
          <p className="text-amber-100 text-sm">Kerjakan latihan berikut</p>
        </div>
      </div>
      <div className="p-8 space-y-4">
        {block.instructions && (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="font-semibold text-amber-900">{block.instructions}</p>
          </div>
        )}

        {block.content && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div
              className="prose prose-sm max-w-none text-slate-700 mb-4"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">Jawaban Anda:</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Tulis jawaban Anda di sini..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-24 resize-vertical"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setCompleted(true);
                  setAnswer('');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                <CheckCircle2 className="w-4 h-4" /> Selesai
              </button>
              <button
                onClick={() => {
                  setCompleted(false);
                  setAnswer('');
                }}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                <RotateCcw className="w-4 h-4" /> Ulang
              </button>
            </div>

            {completed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg"
              >
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Latihan selesai! Lanjut ke bagian berikutnya.</span>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PracticeSqlBlock({ block }: { block: KinestheticBlock }) {
  const [sqlQuery, setSqlQuery] = useState('');
  const [result, setResult] = useState<SqlExecutionResult | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const ddlExamples = [
    {
      label: 'CREATE DATABASE',
      sql: 'CREATE DATABASE smkn5malang;',
    },
    {
      label: 'USE DATABASE',
      sql: 'USE smkn5malang;',
    },
    {
      label: 'CREATE TABLE',
      sql: `CREATE TABLE siswa (
  id_siswa INT AUTO_INCREMENT PRIMARY KEY,
  nis VARCHAR(10) UNIQUE NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  jenis_kelamin ENUM('L', 'P'),
  tanggal_lahir DATE,
  alamat TEXT
);`,
    },
    {
      label: 'ADD COLUMN',
      sql: 'ALTER TABLE siswa ADD no_telepon VARCHAR(15);',
    },
    {
      label: 'MODIFY COLUMN',
      sql: 'ALTER TABLE siswa MODIFY nama_lengkap VARCHAR(150) NOT NULL;',
    },
    {
      label: 'CHANGE COLUMN',
      sql: 'ALTER TABLE siswa CHANGE alamat alamat_domisili TEXT;',
    },
    {
      label: 'RENAME TABLE',
      sql: 'RENAME TABLE siswa TO data_siswa;',
    },
    {
      label: 'TRUNCATE TABLE',
      sql: 'TRUNCATE TABLE data_siswa;',
    },
    {
      label: 'DROP TABLE',
      sql: 'DROP TABLE data_siswa;',
    },
  ];

  const handleExecute = () => {
    const result = executeSqlMock(sqlQuery);
    setResult(result);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden ring-4 ring-blue-500/10">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white flex items-center gap-4">
        <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <Code2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">DDL Practice</h3>
          <p className="text-blue-100 text-sm">Latihan struktur database: create, alter, rename, drop, truncate</p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {block.instructions && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900">{block.instructions}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* SQL Editor */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-slate-900">DDL Query</label>
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {showHelp ? 'Sembunyikan Help' : 'Tampilkan Help'}
              </button>
            </div>
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="ketikkan perintah SQL disini"
              className="w-full p-3 border border-slate-300 rounded-lg font-mono text-sm min-h-40 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />

            {showHelp && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-900 space-y-3">
                <div>
                  <p className="font-semibold">Fokus latihan: DDL</p>
                  <p>Gunakan satu perintah per eksekusi. Mulai dari CREATE TABLE, lalu ALTER, RENAME, TRUNCATE, atau DROP.</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Contoh cepat:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {ddlExamples.map((example) => (
                      <button
                        key={example.label}
                        type="button"
                        onClick={() => setSqlQuery(example.sql)}
                        className="text-left px-3 py-2 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-100 transition-colors"
                      >
                        <span className="font-semibold">{example.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleExecute}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Jalankan DDL
            </button>
          </div>

          {/* Results Visualization */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">Hasil / Visualisasi Struktur</label>
            <div className="border border-slate-300 rounded-lg p-4 min-h-40 bg-slate-50 overflow-auto">
              {result ? (
                result.success ? (
                  <div className="space-y-4">
                    {result.message && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-900">
                        {result.message}
                      </div>
                    )}

                    {result.operation === 'SELECT' && result.columns.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-green-700 mb-3">✓ {result.rowCount} baris ditemukan</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="border-b-2 border-slate-300 bg-slate-100">
                                {result.columns.map((col: string) => (
                                  <th key={col} className="text-left px-2 py-1 font-semibold text-slate-700">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {result.rows.map((row: Record<string, any>, idx: number) => (
                                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-100 transition-colors">
                                  {result.columns.map((col: string) => (
                                    <td key={col} className="px-2 py-1 text-slate-700">
                                      {String(row[col] ?? '-').substring(0, 20)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : result.schema && result.schema.length > 0 ? (
                      <div className="space-y-4">
                        {result.schema.map((table: DdlSchemaTable) => (
                          <div key={table.name} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-100 border-b border-slate-200">
                              <div>
                                <p className="font-bold text-slate-900">{table.name}</p>
                                <p className="text-xs text-slate-500">{table.rowCount} data row</p>
                              </div>
                              <div className="text-xs font-semibold text-slate-600 bg-white px-2 py-1 rounded-full border border-slate-200">
                                {table.columns.length} kolom
                              </div>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="text-left px-3 py-2 font-semibold text-slate-700">Kolom</th>
                                    <th className="text-left px-3 py-2 font-semibold text-slate-700">Tipe</th>
                                    <th className="text-left px-3 py-2 font-semibold text-slate-700">Constraint</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {table.columns.map((column: DdlSchemaColumn) => (
                                    <tr key={`${table.name}-${column.name}`} className="border-b border-slate-100">
                                      <td className="px-3 py-2 font-medium text-slate-800">{column.name}</td>
                                      <td className="px-3 py-2 text-slate-600">{column.type}</td>
                                      <td className="px-3 py-2 text-slate-600">
                                        {column.constraints.length > 0 ? column.constraints.join(', ') : '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">Belum ada struktur tabel yang bisa ditampilkan.</p>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600 text-sm">
                    <p className="font-semibold mb-1">❌ Error:</p>
                    <p>{result.error}</p>
                  </div>
                )
              ) : (
                <p className="text-slate-400 text-sm">Jalankan perintah DDL untuk melihat perubahan struktur tabel...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DragDropKinestheticLesson({ content }: { content: KinestheticContent }) {
  const [items, setItems] = useState(content.items || []);
  const [completed, setCompleted] = useState(false);

  const handleCheck = () => {
    setCompleted(true);
  };

  const handleReset = () => {
    setCompleted(false);
    setItems([...(content.items || [])].sort(() => Math.random() - 0.5));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {content.learningMaterial && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-orange-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Practical Theory</h3>
              <p className="text-sm text-slate-500">Understand the concept before you practice.</p>
            </div>
          </div>
          <div
            className="p-8 prose prose-lg max-w-none text-slate-600 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
            dangerouslySetInnerHTML={{ __html: content.learningMaterial }}
          />
        </div>
      )}

      {content.demoVideoUrl && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-orange-600">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Practical Demonstration</h3>
              <p className="text-sm text-slate-500">Watch how it's done.</p>
            </div>
          </div>
          <div className="aspect-video bg-black">
            <video src={content.demoVideoUrl} controls className="w-full h-full object-contain" />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ring-4 ring-orange-500/10">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Hand className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Practical Exercise</h3>
              <p className="text-orange-100">Apply what you've learned.</p>
            </div>
          </div>
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
              <span className="bg-white text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                !
              </span>
              Task Instructions
            </h4>
            <p className="text-orange-50 leading-relaxed">{content.instructions}</p>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6 flex justify-between items-center">
            <h4 className="font-bold text-slate-700">Interactive Workspace</h4>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button
                onClick={handleCheck}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm text-sm font-medium"
              >
                <CheckCircle2 className="w-4 h-4" /> Check Answer
              </button>
            </div>
          </div>

          <div className="bg-slate-100 rounded-xl p-8 min-h-[300px] border-2 border-dashed border-slate-300 flex flex-col relative">
            <Reorder.Group axis="y" values={items} onReorder={setItems} className="w-full space-y-3">
              {items.map((item) => (
                <Reorder.Item key={item} value={item}>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing flex items-center justify-between group hover:border-orange-300 hover:shadow-md transition-all">
                    <span className="font-medium text-slate-700">{item}</span>
                    <div className="text-slate-300 group-hover:text-orange-400">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                      </svg>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            {items.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <p>No items to interact with</p>
              </div>
            )}

            {completed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10"
              >
                <div className="text-center p-6 bg-white rounded-2xl shadow-xl border border-green-100">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Great Job!</h3>
                  <p className="text-slate-600">You've completed this activity successfully.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
