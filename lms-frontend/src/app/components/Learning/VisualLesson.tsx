import React, { useEffect, useMemo, useState } from 'react';
import { VisualContent, VisualBlock } from '../../types';
import { motion } from 'motion/react';
import { DdlPracticeCard } from './DdlPracticeCard';

interface Props {
  content: VisualContent;
}

export function VisualLesson({ content }: Props) {
  const sections = useMemo(() => buildSections(content), [content]);
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
    const currentSection = sections[activeSectionIndex];
    if (!currentSection || hasQuiz(currentSection)) {
      return;
    }

    setPassedSections((current) => {
      const sectionKey = String(activeSectionIndex);
      if (current[sectionKey]) {
        return current;
      }

      return { ...current, [sectionKey]: true };
    });
  }, [activeSectionIndex, sections]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 space-y-5">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </span>
            Visual Sections
          </h3>
          <p className="text-slate-500">Materi visual dipisahkan per section. Kerjakan quiz di setiap section untuk membuka section berikutnya.</p>

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
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : isLocked
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600',
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
          {sections[activeSectionIndex] && renderSection(
            sections[activeSectionIndex],
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
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <DdlPracticeCard
        title="DDL Practice"
        subtitle="Latihan struktur database: create, alter, rename, drop, truncate"
        accentClassName="from-blue-600 to-indigo-600"
        accentTextClassName="text-blue-100"
      />
    </motion.div>
  );
}

type VisualSection = {
  sectionNumber: number;
  blocks: VisualBlock[];
};

function buildSections(content: VisualContent): VisualSection[] {
  const blocks = content.blocks && content.blocks.length > 0
    ? content.blocks
    : buildLegacyBlocks(content);

  const grouped = new Map<number, VisualBlock[]>();

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

function buildLegacyBlocks(content: VisualContent): VisualBlock[] {
  const blocks: VisualBlock[] = [];

  if (content.text) {
    blocks.push({
      id: 'legacy-visual-text',
      section: 1,
      type: 'material',
      title: 'Materi Utama',
      content: content.text,
    });
  }

  if (content.videoUrl) {
    blocks.push({
      id: 'legacy-visual-video',
      section: 1,
      type: 'video',
      title: 'Video Pendukung',
      url: content.videoUrl,
    });
  }

  if (content.images.length > 0) {
    blocks.push({
      id: 'legacy-visual-images',
      section: 1,
      type: 'image',
      title: 'Gambar Pendukung',
      urls: content.images,
    });
  }

  if (content.diagrams.length > 0) {
    blocks.push({
      id: 'legacy-visual-diagrams',
      section: 1,
      type: 'diagram',
      title: 'Diagram Pendukung',
      urls: content.diagrams,
    });
  }

  return blocks;
}

function hasQuiz(section: VisualSection | undefined): boolean {
  return Boolean(section?.blocks.some((block) => block.type === 'quiz' && (block.questions?.length || 0) > 0));
}

function renderSection(
  section: VisualSection,
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
          .map((block, blockIndex) => renderVisualBlock(block, blockIndex))}
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
                        name={`section-${sectionId}-q-${questionIndex}`}
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
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
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

function renderVisualBlock(block: VisualBlock, index: number) {
  if (block.type === 'material') {
    return (
      <section key={block.id || index} className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 space-y-4">
        <h4 className="text-xl font-bold text-slate-900">{block.title || 'Materi'}</h4>
        <div
          className="prose prose-lg max-w-none text-slate-600 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4 [&_img]:rounded-xl [&_img]:my-4 [&_a]:text-blue-600 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: block.content || '<p>Belum ada konten materi</p>' }}
        />
      </section>
    );
  }

  if (block.type === 'video') {
    return (
      <section key={block.id || index} className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 space-y-4">
        <h4 className="text-xl font-bold text-slate-900">{block.title || 'Video'}</h4>
        {block.url ? (
          <video
            src={block.url}
            controls
            className="w-full rounded-xl bg-slate-900 aspect-video object-cover"
            poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <p className="text-sm text-slate-500">Belum ada URL video.</p>
        )}
      </section>
    );
  }

  if (block.type === 'image' || block.type === 'diagram') {
    return (
      <section key={block.id || index} className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 space-y-4">
        <h4 className="text-xl font-bold text-slate-900">{block.title || (block.type === 'image' ? 'Gambar' : 'Diagram')}</h4>
        <div className={block.type === 'image' ? 'grid md:grid-cols-2 gap-4' : 'grid gap-4'}>
          {(block.urls || []).length > 0 ? (block.urls || []).map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`${block.title || block.type} ${idx + 1}`}
              className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
            />
          )) : (
            <p className="text-sm text-slate-500">Belum ada media untuk block ini.</p>
          )}
        </div>
      </section>
    );
  }

  return null;
}
