import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../../context/DataContext';
import { AuditoryBlock, Course, Module, KinestheticBlock, VisualBlock, VisualQuizQuestion } from '../../types';
import { ArrowLeft, Save, Video, Music, Upload, PlayCircle, Image as ImageIcon, Trash2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../../lib/api';

// ── Custom Image Blot dengan support align ───────────────────────────────────
const BlockEmbed = Quill.import('blots/block/embed') as any;

class ResizableImage extends BlockEmbed {
  static blotName = 'resizable-image';
  static tagName = 'figure';

  static create(value: { src: string; width?: string; align?: string }) {
    const node = document.createElement('figure') as HTMLElement;
    const img = document.createElement('img');

    const src = typeof value === 'string' ? value : value.src;
    const width = typeof value !== 'string' ? (value.width || '100%') : '100%';
    const align = typeof value !== 'string' ? (value.align || 'left') : 'left';

    img.setAttribute('src', src);
    img.style.width = width;
    img.style.height = 'auto';
    img.style.maxWidth = '100%';
    img.style.cursor = 'pointer';
    img.style.display = 'block';

    node.style.margin = '8px 0';
    node.style.padding = '0';
    node.style.display = 'block';

    if (align === 'center') {
      node.style.textAlign = 'center';
      img.style.margin = '0 auto';
    } else if (align === 'right') {
      node.style.textAlign = 'right';
      img.style.marginLeft = 'auto';
    } else {
      node.style.textAlign = 'left';
      img.style.margin = '0';
    }

    node.setAttribute('data-src', src);
    node.setAttribute('data-width', width);
    node.setAttribute('data-align', align);
    node.appendChild(img);
    return node;
  }

  static value(node: HTMLElement) {
    return {
      src: node.getAttribute('data-src') || '',
      width: node.getAttribute('data-width') || '100%',
      align: node.getAttribute('data-align') || 'left',
    };
  }
}

Quill.register(ResizableImage, true);

// ── Custom Audio Blot ─────────────────────────────────────────────────────────
class AudioEmbed extends BlockEmbed {
  static blotName = 'audio-embed';
  static tagName = 'div';

  static create(value: { src: string }) {
    const node = document.createElement('div') as HTMLElement;
    const audio = document.createElement('audio');
    const source = document.createElement('source');

    source.setAttribute('src', value.src);
    source.setAttribute('type', 'audio/mpeg');
    
    audio.setAttribute('controls', '');
    audio.setAttribute('style', 'width: 100%; max-width: 600px; margin: 12px 0;');
    audio.appendChild(source);
    
    node.setAttribute('data-audio-src', value.src);
    node.setAttribute('data-blot-name', 'audio-embed');
    node.style.margin = '12px 0';
    node.appendChild(audio);
    
    return node;
  }

  static value(node: HTMLElement) {
    return { src: node.getAttribute('data-audio-src') || '' };
  }
}

Quill.register(AudioEmbed, true);

const Size = Quill.import('attributors/style/size') as any;
Size.whitelist = ['10px','12px','14px','16px','18px','20px','24px','28px','32px','36px','48px'];
Quill.register(Size, true);

const Font = Quill.import('attributors/style/font') as any;
Font.whitelist = ['sans-serif','serif','monospace'];
Quill.register(Font, true);

const Align = Quill.import('attributors/style/align') as any;
Quill.register(Align, true);

const buildModules = (includeAudio: boolean = false) => ({
  toolbar: {
    container: [
      [{ font: ['sans-serif','serif','monospace'] }],
      [{ size: ['10px','12px','14px','16px','18px','20px','24px','28px','32px','36px','48px'] }],
      [{ header: [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ...(includeAudio ? [['audio']] : []),
      ['clean'],
    ],
    handlers: {
      image: function (this: any) {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) return;
          const quill = this.quill;
          ;(async () => {
            try {
              const formData = new FormData();
              formData.append('file', file);
              const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, 'resizable-image', {
                src: res.data.url,
                width: '100%',
                align: 'left',
              });
              quill.setSelection(range.index + 1);
            } catch (err) {
              console.error('Upload gambar gagal:', err);
            }
          })();
        };
      },
      audio: function (this: any) {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'audio/*');
        input.click();
        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) return;
          const quill = this.quill;
          ;(async () => {
            try {
              const formDataUpload = new FormData();
              formDataUpload.append('file', file);
              const res = await api.post('/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, 'audio-embed', { src: res.data.url });
              quill.setSelection(range.index + 1);
            } catch (err) {
              console.error('Upload audio gagal:', err);
            }
          })();
        };
      },
    },
  },
  clipboard: { matchVisual: false },
});

const richFormats = [
  'font', 'size', 'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'align',
  'list', 'bullet',
  'link', 'resizable-image', 'audio-embed',
];

const quillStyle = `
  .ql-toolbar.ql-snow { border-radius: 0.75rem 0.75rem 0 0; background: #f8fafc; flex-wrap: wrap; }
  .ql-container.ql-snow { border-radius: 0 0 0.75rem 0.75rem; }
  .ql-editor { min-height: 220px; font-size: 14px; }
  .ql-editor figure { margin: 8px 0; }
  .ql-editor figure img { max-width: 100%; cursor: pointer; height: auto; }
  .ql-editor figure img:hover { outline: 2px solid #6366f1; border-radius: 2px; }
  .ql-snow .ql-size.ql-picker .ql-picker-label::before,
  .ql-snow .ql-size.ql-picker .ql-picker-item::before {
    content: attr(data-value) !important;
  }
  .ql-snow .ql-size.ql-picker .ql-picker-label[data-value]::before,
  .ql-snow .ql-size.ql-picker .ql-picker-item[data-value]::before {
    content: attr(data-value) !important;
  }
  .ql-snow .ql-size.ql-picker .ql-picker-label:not([data-value])::before,
  .ql-snow .ql-size.ql-picker .ql-picker-item:not([data-value])::before {
    content: 'Normal' !important;
  }
  .ql-size .ql-picker-item[data-value="10px"]::before  { font-size: 10px !important; }
  .ql-size .ql-picker-item[data-value="12px"]::before  { font-size: 12px !important; }
  .ql-size .ql-picker-item[data-value="14px"]::before  { font-size: 14px !important; }
  .ql-size .ql-picker-item[data-value="16px"]::before  { font-size: 16px !important; }
  .ql-size .ql-picker-item[data-value="18px"]::before  { font-size: 18px !important; }
  .ql-size .ql-picker-item[data-value="20px"]::before  { font-size: 20px !important; }
  .ql-size .ql-picker-item[data-value="24px"]::before  { font-size: 24px !important; }
  .ql-size .ql-picker-item[data-value="28px"]::before  { font-size: 28px !important; }
  .ql-size .ql-picker-item[data-value="32px"]::before  { font-size: 32px !important; }
  .ql-size .ql-picker-item[data-value="36px"]::before  { font-size: 36px !important; }
  .ql-size .ql-picker-item[data-value="48px"]::before  { font-size: 48px !important; }
`;

interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  includeAudio?: boolean;
}

const RichEditor: React.FC<RichEditorProps> = ({ value, onChange, placeholder, includeAudio = false }) => {
  const quillRef = useRef<ReactQuill>(null);
  const modulesRef = useRef(buildModules(includeAudio));

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      const figure = img.parentElement as HTMLElement;
      if (!figure || figure.tagName !== 'FIGURE') return;

      const currentWidth = figure.getAttribute('data-width') || '100%';
      const currentAlign = figure.getAttribute('data-align') || 'left';

      const newWidth = window.prompt(
        `Ukuran gambar (contoh: 300px atau 50%)\nAlign: ketik "left", "center", atau "right" setelah ukuran, pisahkan dengan spasi\nContoh: "300px center"`,
        `${currentWidth} ${currentAlign}`
      );

      if (!newWidth || !quillRef.current) return;

      const parts = newWidth.trim().split(/\s+/);
      const width = parts[0];
      const align = (['left','center','right'].includes(parts[1])) ? parts[1] : currentAlign;

      const editor = quillRef.current.getEditor();
      const blot = Quill.find(figure);
      if (blot) {
        const index = editor.getIndex(blot);
        const src = figure.getAttribute('data-src') || img.getAttribute('src') || '';
        editor.deleteText(index, 1);
        editor.insertEmbed(index, 'resizable-image', { src, width, align });
        editor.setSelection({ index: index + 1, length: 0 });
      }
    }
  };

  return (
    <div onClick={handleClick}>
      <style>{quillStyle}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modulesRef.current}
        formats={richFormats}
        placeholder={placeholder ?? 'Tulis di sini...'}
        style={{ borderRadius: '0.75rem' }}
      />
      <p className="text-xs text-slate-400 mt-1 pl-1">
        💡 Klik gambar untuk mengatur ukuran & posisi (kiri/tengah/kanan)
      </p>
    </div>
  );
};

interface TeacherEditModuleProps {
  course: Course;
  module: Module | null;
  onClose: () => void;
  isCreating?: boolean;
}

export function TeacherEditModule({ course, module, onClose, isCreating = false }: TeacherEditModuleProps) {
  const navigate = useNavigate();
  const { updateModule, addModule } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultFormData = {
    title: '',
    description: '',
    visualText: '',
    visualImages: [] as string[],
    visualDiagrams: [] as string[],
    visualVideoUrl: '',
    visualBlocks: [] as VisualBlock[],
    auditoryBlocks: [] as AuditoryBlock[],
    auditoryTranscript: '',
    kinestheticActivityType: 'tiered-blocks' as const,
    kinestheticInstructions: 'Kerjakan latihan kinestetik berikut',
    kinestheticBlocks: [] as KinestheticBlock[],
    kinestheticLearningMaterial: '',
    kinestheticDemoVideoUrl: '',
  };

  function buildLegacyVisualBlocks(visual?: {
    text?: string;
    images?: string[];
    diagrams?: string[];
    videoUrl?: string;
    blocks?: VisualBlock[];
  }): VisualBlock[] {
    if (visual?.blocks?.length) {
      return visual.blocks;
    }

    const blocks: VisualBlock[] = [];

    if (visual?.text) {
      blocks.push({
        id: 'legacy-visual-text',
        section: 1,
        type: 'material',
        title: 'Materi Utama',
        content: visual.text,
      });
    }

    if (visual?.videoUrl) {
      blocks.push({
        id: 'legacy-visual-video',
        section: 1,
        type: 'video',
        title: 'Video Pendukung',
        url: visual.videoUrl,
      });
    }

    if (visual?.images?.length) {
      blocks.push({
        id: 'legacy-visual-images',
        section: 1,
        type: 'image',
        title: 'Gambar Pendukung',
        urls: visual.images,
      });
    }

    if (visual?.diagrams?.length) {
      blocks.push({
        id: 'legacy-visual-diagrams',
        section: 1,
        type: 'diagram',
        title: 'Diagram Pendukung',
        urls: visual.diagrams,
      });
    }

    if (blocks.length === 0) {
      blocks.push({
        id: 'legacy-visual-empty',
        section: 1,
        type: 'material',
        title: 'Materi Visual',
        content: 'Belum ada konten visual. Tambahkan block baru untuk mulai menyusun materi.',
      });
    }

    return blocks;
  }

  function createEmptyVisualQuestion(): VisualQuizQuestion {
    return {
      text: '',
      options: ['', ''],
      correctOptionIndex: 0,
    };
  }

  function updateVisualQuestion(
    questions: VisualQuizQuestion[],
    questionIndex: number,
    patch: Partial<VisualQuizQuestion>
  ): VisualQuizQuestion[] {
    return questions.map((question, currentIndex) => {
      if (currentIndex !== questionIndex) {
        return question;
      }

      return {
        ...question,
        ...patch,
      };
    });
  }

  function getNextVisualSectionNumber(): number {
    const sections = (formData.visualBlocks || []).map((block) => block.section || 1);
    return sections.length > 0 ? Math.max(...sections) + 1 : 1;
  }

  function createVisualBlock(sectionNumber: number, type: VisualBlock['type'] = 'material'): VisualBlock {
    return {
      id: Date.now().toString(),
      section: sectionNumber,
      type,
      title: '',
      content: type === 'material' ? '' : undefined,
      url: type === 'video' ? '' : undefined,
      urls: type === 'image' || type === 'diagram' ? [''] : undefined,
      questions: type === 'quiz' ? [createEmptyVisualQuestion()] : undefined,
    };
  }

  function createAuditoryBlock(sectionNumber: number, type: AuditoryBlock['type'] = 'material'): AuditoryBlock {
    return {
      id: Date.now().toString(),
      section: sectionNumber,
      type,
      title: '',
      content: type === 'material' ? '' : undefined,
      url: type === 'audio' ? '' : undefined,
      questions: type === 'quiz' ? [createEmptyVisualQuestion()] : undefined,
    };
  }

  function buildLegacyAuditoryBlocks(auditory?: {
    transcript?: string;
    audioUrl?: string;
    blocks?: AuditoryBlock[];
  }): AuditoryBlock[] {
    if (auditory?.blocks?.length) {
      return auditory.blocks;
    }

    const blocks: AuditoryBlock[] = [];

    if (auditory?.transcript) {
      blocks.push({
        id: 'legacy-auditory-material',
        section: 1,
        type: 'material',
        title: 'Materi Audio',
        content: auditory.transcript,
      });
    }

    if (auditory?.audioUrl) {
      blocks.push({
        id: 'legacy-auditory-audio',
        section: 1,
        type: 'audio',
        title: 'Audio Pendukung',
        url: auditory.audioUrl,
      });
    }

    if (blocks.length === 0) {
      blocks.push({
        id: 'legacy-auditory-empty',
        section: 1,
        type: 'material',
        title: 'Materi Audio',
        content: 'Belum ada konten audio. Tambahkan block baru untuk mulai menyusun materi.',
      });
    }

    return blocks;
  }

  function getNextAuditorySectionNumber(): number {
    const sections = (formData.auditoryBlocks || []).map((block) => block.section || 1);
    return sections.length > 0 ? Math.max(...sections) + 1 : 1;
  }

  function createKinestheticQuizBlock(sectionNumber: number): KinestheticBlock {
    return {
      id: Date.now().toString(),
      section: sectionNumber,
      type: 'quiz',
      questions: [createEmptyVisualQuestion()],
      content: '',
    };
  }

  function getNextKinestheticSectionNumber(): number {
    const sections = (formData.kinestheticBlocks || []).map((block) => block.section || 1);
    return sections.length > 0 ? Math.max(...sections) + 1 : 1;
  }

  const legacyKinestheticBlocks: KinestheticBlock[] = module?.content.kinesthetic.blocks?.length
    ? module.content.kinesthetic.blocks
    : buildLegacyKinestheticBlocks(module?.content.kinesthetic);

  const [formData, setFormData] = useState({
    title: module?.title || defaultFormData.title,
    description: module?.description || defaultFormData.description,
    visualText: module?.content.visual.text || defaultFormData.visualText,
    visualImages: module?.content.visual.images ?? defaultFormData.visualImages,
    visualDiagrams: module?.content.visual.diagrams ?? defaultFormData.visualDiagrams,
    visualVideoUrl: module?.content.visual.videoUrl ?? defaultFormData.visualVideoUrl,
    visualBlocks: buildLegacyVisualBlocks(module?.content.visual),
    auditoryBlocks: buildLegacyAuditoryBlocks(module?.content.auditory),
    auditoryTranscript: module?.content.auditory.transcript ?? defaultFormData.auditoryTranscript,
    kinestheticActivityType: module?.content.kinesthetic.blocks?.length
      ? 'tiered-blocks'
      : (module?.content.kinesthetic.activityType ?? defaultFormData.kinestheticActivityType),
    kinestheticInstructions: module?.content.kinesthetic.instructions ?? defaultFormData.kinestheticInstructions,
    kinestheticBlocks: legacyKinestheticBlocks,
    kinestheticLearningMaterial: module?.content.kinesthetic.learningMaterial ?? defaultFormData.kinestheticLearningMaterial,
    kinestheticDemoVideoUrl: module?.content.kinesthetic.demoVideoUrl ?? defaultFormData.kinestheticDemoVideoUrl,
  });

  function buildLegacyKinestheticBlocks(kinesthetic?: {
    learningMaterial?: string;
    instructions?: string;
    items?: string[];
  }): KinestheticBlock[] {
    const blocks: KinestheticBlock[] = [];

    if (kinesthetic?.learningMaterial) {
      blocks.push({
        id: 'legacy-material',
        section: 1,
        type: 'material',
        content: kinesthetic.learningMaterial,
      });
    }

    if (kinesthetic?.instructions || (kinesthetic?.items && kinesthetic.items.length > 0)) {
      blocks.push({
        id: 'legacy-practice',
        section: 1,
        type: 'practice-text',
        instructions: kinesthetic?.instructions || 'Kerjakan latihan berikut',
        content: kinesthetic?.items && kinesthetic.items.length > 0
          ? `Susun atau baca item berikut: ${kinesthetic.items.join(', ')}`
          : 'Latihan interaktif akan muncul di sini setelah blok baru dibuat.',
      });
    }

    if (blocks.length === 0) {
      blocks.push({
        id: 'legacy-empty',
        section: 1,
        type: 'material',
        content: 'Konten kinestetik lama belum punya blok berjenjang. Silakan tambah block baru.',
      });
    }

    return blocks;
  }

  const handleFileUpload = async (
    fieldName: keyof typeof formData,
    type: 'video' | 'audio' | 'image' = 'video'
  ) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    if (type === 'video') input.setAttribute('accept', 'video/*');
    if (type === 'audio') input.setAttribute('accept', 'audio/*');
    if (type === 'image') input.setAttribute('accept', 'image/*');
    
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      
      const toastId = toast.loading(`Mengunggah ${type}...`);
      try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        const res = await api.post('/upload', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFormData(prev => ({ ...prev, [fieldName]: res.data.url }));
        toast.success(`${type} berhasil diunggah!`, { id: toastId });
      } catch (err) {
        console.error(err);
        toast.error(`Gagal mengunggah ${type}.`, { id: toastId });
      }
    };
  };

  const handleImageListUpload = async (isForDiagrams: boolean = false) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      
      const toastId = toast.loading('Mengunggah gambar...');
      try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        const res = await api.post('/upload', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        if (isForDiagrams) {
          setFormData(prev => ({
            ...prev,
            visualDiagrams: [...(prev.visualDiagrams as string[]), res.data.url]
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            visualImages: [...(prev.visualImages as string[]), res.data.url]
          }));
        }
        toast.success('Gambar ditambahkan!', { id: toastId });
      } catch (err) {
        console.error(err);
        toast.error('Gagal mengunggah gambar.', { id: toastId });
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const moduleData = {
        title: formData.title,
        description: formData.description,
        content: {
          visual: {
            text: formData.visualText,
            images: Array.isArray(formData.visualImages) ? formData.visualImages : [],
            diagrams: Array.isArray(formData.visualDiagrams) ? formData.visualDiagrams : [],
            videoUrl: formData.visualVideoUrl,
            blocks: formData.visualBlocks || [],
          },
          auditory: {
            transcript: formData.auditoryTranscript,
            blocks: formData.auditoryBlocks || [],
          },
          kinesthetic: {
            activityType: (formData.kinestheticBlocks || []).length > 0
              ? 'tiered-blocks'
              : formData.kinestheticActivityType,
            instructions: formData.kinestheticInstructions,
            blocks: formData.kinestheticBlocks || [],
            learningMaterial: formData.kinestheticLearningMaterial,
            demoVideoUrl: formData.kinestheticDemoVideoUrl,
          },
        },
      };

      if (isCreating || !module) {
        // Create new module
        await api.post(`/courses/${course.id}/modules`, moduleData);
        toast.success('Modul berhasil dibuat!');
      } else {
        // Update existing module
        await updateModule(course.id, module.id, moduleData);
        toast.success('Modul berhasil diperbarui!');
      }
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan modul';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={onClose}
        className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
      </button>

      <h1 className="text-3xl font-bold text-slate-900">
        {isCreating ? 'Buat Modul Baru' : `Edit Modul: ${module?.title}`}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* ── Basic Info ──────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Informasi Dasar</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Judul Modul *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi</label>
            <RichEditor
              value={formData.description}
              onChange={(val) => setFormData({ ...formData, description: val })}
              placeholder="Deskripsi singkat tentang modul ini"
            />
          </div>
        </div>

        {/* ── Visual Learning ────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            👁️ Konten Visual (Block Dinamis)
          </h2>

          <div className="bg-blue-50/60 rounded-lg p-4 border border-blue-200 text-sm text-blue-900">
            <p className="font-semibold mb-1">💡 Tips: Susun visual sebagai block yang fleksibel</p>
            <p>Gunakan block materi, video, gambar, atau diagram sesuai kebutuhan topik. Guru bebas mengatur urutan dan jumlah block.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                const nextSection = getNextVisualSectionNumber();
                setFormData({
                  ...formData,
                  visualBlocks: [...(formData.visualBlocks || []), createVisualBlock(nextSection, 'material')],
                });
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              + Tambah Section
            </button>

            <button
              type="button"
              onClick={() => {
                const nextSection = getNextVisualSectionNumber();
                setFormData({
                  ...formData,
                  visualBlocks: [...(formData.visualBlocks || []), createVisualBlock(nextSection, 'quiz')],
                });
              }}
              className="px-4 py-2 rounded-lg border border-indigo-200 text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition-colors"
            >
              + Tambah Section Quiz
            </button>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-lg max-h-[32rem] overflow-y-auto">
            {(formData.visualBlocks || []).map((block, idx) => (
              <div key={block.id || idx} className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    value={block.title || ''}
                    onChange={(e) => {
                      const newBlocks = [...(formData.visualBlocks || [])];
                      newBlocks[idx].title = e.target.value;
                      setFormData({ ...formData, visualBlocks: newBlocks });
                    }}
                    placeholder={`Judul block / section ${idx + 1}`}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={block.section || 1}
                      onChange={(e) => {
                        const newBlocks = [...(formData.visualBlocks || [])];
                        newBlocks[idx].section = Math.max(1, Number(e.target.value) || 1);
                        setFormData({ ...formData, visualBlocks: newBlocks });
                      }}
                      className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      title="Section"
                    />
                    <select
                      value={block.type}
                      onChange={(e) => {
                        const newBlocks = [...(formData.visualBlocks || [])];
                        newBlocks[idx].type = e.target.value as VisualBlock['type'];
                        setFormData({ ...formData, visualBlocks: newBlocks });
                      }}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium"
                    >
                      <option value="material">📚 Materi</option>
                      <option value="video">🎬 Video</option>
                      <option value="image">🖼️ Gambar</option>
                      <option value="diagram">🧩 Diagram</option>
                      <option value="quiz">📝 Quiz</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const newBlocks = formData.visualBlocks?.filter((_, i) => i !== idx) ?? [];
                        setFormData({ ...formData, visualBlocks: newBlocks });
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {block.type === 'material' && (
                  <RichEditor
                    value={block.content || ''}
                    onChange={(val) => {
                      const newBlocks = [...(formData.visualBlocks || [])];
                      newBlocks[idx].content = val;
                      setFormData({ ...formData, visualBlocks: newBlocks });
                    }}
                    placeholder="Tulis materi visual di block ini"
                  />
                )}

                {block.type === 'video' && (
                  <input
                    type="url"
                    value={block.url || ''}
                    onChange={(e) => {
                      const newBlocks = [...(formData.visualBlocks || [])];
                      newBlocks[idx].url = e.target.value;
                      setFormData({ ...formData, visualBlocks: newBlocks });
                    }}
                    placeholder="URL video"
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                )}

                {(block.type === 'image' || block.type === 'diagram') && (
                  <textarea
                    value={(block.urls || []).join('\n')}
                    onChange={(e) => {
                      const newBlocks = [...(formData.visualBlocks || [])];
                      newBlocks[idx].urls = e.target.value
                        .split('\n')
                        .map((item) => item.trim())
                        .filter(Boolean);
                      setFormData({ ...formData, visualBlocks: newBlocks });
                    }}
                    placeholder="Satu URL per baris"
                    className="w-full p-2 border border-slate-300 rounded text-sm min-h-24 resize-vertical"
                  />
                )}

                {block.type === 'quiz' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Quiz Section</p>
                        <p className="text-xs text-slate-500">Tambahkan pertanyaan dan opsi jawaban di sini, tanpa JSON mentah.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newBlocks = [...(formData.visualBlocks || [])];
                          newBlocks[idx].questions = [
                            ...(newBlocks[idx].questions || []),
                            createEmptyVisualQuestion(),
                          ];
                          setFormData({ ...formData, visualBlocks: newBlocks });
                        }}
                        className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        + Tambah Soal
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(block.questions || []).map((question, questionIndex) => (
                        <div key={questionIndex} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <label className="block text-sm font-medium text-slate-700">Pertanyaan {questionIndex + 1}</label>
                              <textarea
                                value={question.text}
                                onChange={(e) => {
                                  const newBlocks = [...(formData.visualBlocks || [])];
                                  newBlocks[idx].questions = updateVisualQuestion(
                                    newBlocks[idx].questions || [],
                                    questionIndex,
                                    { text: e.target.value }
                                  );
                                  setFormData({ ...formData, visualBlocks: newBlocks });
                                }}
                                placeholder="Tulis pertanyaan quiz di sini"
                                className="w-full p-3 border border-slate-300 rounded-lg text-sm min-h-20 resize-vertical"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const newBlocks = [...(formData.visualBlocks || [])];
                                newBlocks[idx].questions = (newBlocks[idx].questions || []).filter((_, i) => i !== questionIndex);
                                setFormData({ ...formData, visualBlocks: newBlocks });
                              }}
                              className="text-red-600 hover:text-red-700 text-sm font-medium whitespace-nowrap"
                            >
                              Hapus Soal
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-slate-700">Opsi Jawaban</p>
                              <button
                                type="button"
                                onClick={() => {
                                  const newBlocks = [...(formData.visualBlocks || [])];
                                  const questions = [...(newBlocks[idx].questions || [])];
                                  questions[questionIndex] = {
                                    ...questions[questionIndex],
                                    options: [...questions[questionIndex].options, ''],
                                  };
                                  newBlocks[idx].questions = questions;
                                  setFormData({ ...formData, visualBlocks: newBlocks });
                                }}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                              >
                                + Tambah Opsi
                              </button>
                            </div>

                            <div className="grid gap-3">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name={`correct-${idx}-${questionIndex}`}
                                    checked={question.correctOptionIndex === optionIndex}
                                    onChange={() => {
                                      const newBlocks = [...(formData.visualBlocks || [])];
                                      newBlocks[idx].questions = updateVisualQuestion(
                                        newBlocks[idx].questions || [],
                                        questionIndex,
                                        { correctOptionIndex: optionIndex }
                                      );
                                      setFormData({ ...formData, visualBlocks: newBlocks });
                                    }}
                                    className="h-4 w-4 text-indigo-600"
                                    title="Set jawaban benar"
                                  />

                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newBlocks = [...(formData.visualBlocks || [])];
                                      const questions = [...(newBlocks[idx].questions || [])];
                                      const options = [...questions[questionIndex].options];
                                      options[optionIndex] = e.target.value;
                                      questions[questionIndex] = {
                                        ...questions[questionIndex],
                                        options,
                                      };
                                      newBlocks[idx].questions = questions;
                                      setFormData({ ...formData, visualBlocks: newBlocks });
                                    }}
                                    placeholder={`Opsi ${optionIndex + 1}`}
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                  />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newBlocks = [...(formData.visualBlocks || [])];
                                      const questions = [...(newBlocks[idx].questions || [])];
                                      const options = questions[questionIndex].options.filter((_, i) => i !== optionIndex);
                                      const nextCorrectIndex = questions[questionIndex].correctOptionIndex >= options.length
                                        ? Math.max(0, options.length - 1)
                                        : questions[questionIndex].correctOptionIndex;
                                      questions[questionIndex] = {
                                        ...questions[questionIndex],
                                        options,
                                        correctOptionIndex: nextCorrectIndex,
                                      };
                                      newBlocks[idx].questions = questions;
                                      setFormData({ ...formData, visualBlocks: newBlocks });
                                    }}
                                    disabled={question.options.length <= 2}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      {(block.questions || []).length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                          Belum ada soal. Klik tombol <span className="font-semibold text-indigo-600">Tambah Soal</span> untuk memulai quiz section ini.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {(formData.visualBlocks || []).length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">Belum ada visual block. Klik tombol tambah block di bawah.</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              const newBlock: VisualBlock = {
                ...createVisualBlock(getNextVisualSectionNumber(), 'material'),
              };
              setFormData({
                ...formData,
                visualBlocks: [...(formData.visualBlocks || []), newBlock],
              });
            }}
            className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors"
          >
            + Tambah Block Visual
          </button>
        </div>

        {/* ── Auditory Learning ──────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-600" />
            🎧 Konten Audio (Block Dinamis)
          </h2>
          
          <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-200 text-sm text-purple-900">
            <p className="font-semibold mb-2">💡 Tips: Susun audio sebagai section yang bertahap</p>
            <p>Gunakan block materi, audio, atau quiz agar siswa fokus per bagian dan bisa lanjut setelah lulus evaluasi.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                const nextSection = getNextAuditorySectionNumber();
                setFormData({
                  ...formData,
                  auditoryBlocks: [...(formData.auditoryBlocks || []), createAuditoryBlock(nextSection, 'material')],
                });
              }}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              + Tambah Section
            </button>

            <button
              type="button"
              onClick={() => {
                const nextSection = getNextAuditorySectionNumber();
                setFormData({
                  ...formData,
                  auditoryBlocks: [...(formData.auditoryBlocks || []), createAuditoryBlock(nextSection, 'quiz')],
                });
              }}
              className="px-4 py-2 rounded-lg border border-purple-200 text-purple-700 text-sm font-semibold hover:bg-purple-50 transition-colors"
            >
              + Tambah Section Quiz
            </button>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-lg max-h-[32rem] overflow-y-auto">
            {(formData.auditoryBlocks || []).map((block, idx) => (
              <div key={block.id || idx} className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    value={block.title || ''}
                    onChange={(e) => {
                      const newBlocks = [...(formData.auditoryBlocks || [])];
                      newBlocks[idx].title = e.target.value;
                      setFormData({ ...formData, auditoryBlocks: newBlocks });
                    }}
                    placeholder={`Judul block / section ${idx + 1}`}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={block.section || 1}
                      onChange={(e) => {
                        const newBlocks = [...(formData.auditoryBlocks || [])];
                        newBlocks[idx].section = Math.max(1, Number(e.target.value) || 1);
                        setFormData({ ...formData, auditoryBlocks: newBlocks });
                      }}
                      className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      title="Section"
                    />
                    <select
                      value={block.type}
                      onChange={(e) => {
                        const newBlocks = [...(formData.auditoryBlocks || [])];
                        newBlocks[idx].type = e.target.value as AuditoryBlock['type'];
                        if (e.target.value === 'quiz' && (!newBlocks[idx].questions || newBlocks[idx].questions.length === 0)) {
                          newBlocks[idx].questions = [createEmptyVisualQuestion()];
                        }
                        setFormData({ ...formData, auditoryBlocks: newBlocks });
                      }}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium"
                    >
                      <option value="material">📚 Materi</option>
                      <option value="audio">🎵 Audio</option>
                      <option value="quiz">📝 Quiz</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const newBlocks = formData.auditoryBlocks?.filter((_, i) => i !== idx) ?? [];
                        setFormData({ ...formData, auditoryBlocks: newBlocks });
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {block.type === 'material' && (
                  <RichEditor
                    value={block.content || ''}
                    onChange={(val) => {
                      const newBlocks = [...(formData.auditoryBlocks || [])];
                      newBlocks[idx].content = val;
                      setFormData({ ...formData, auditoryBlocks: newBlocks });
                    }}
                    placeholder="Tulis materi audio di block ini"
                    includeAudio={true}
                  />
                )}

                {block.type === 'audio' && (
                  <input
                    type="url"
                    value={block.url || ''}
                    onChange={(e) => {
                      const newBlocks = [...(formData.auditoryBlocks || [])];
                      newBlocks[idx].url = e.target.value;
                      setFormData({ ...formData, auditoryBlocks: newBlocks });
                    }}
                    placeholder="URL audio"
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                )}

                {block.type === 'quiz' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Quiz Section</p>
                        <p className="text-xs text-slate-500">Tambah pertanyaan dan opsi tanpa JSON mentah.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newBlocks = [...(formData.auditoryBlocks || [])];
                          newBlocks[idx].questions = [
                            ...(newBlocks[idx].questions || []),
                            createEmptyVisualQuestion(),
                          ];
                          setFormData({ ...formData, auditoryBlocks: newBlocks });
                        }}
                        className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
                      >
                        + Tambah Soal
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(block.questions || []).map((question, questionIndex) => (
                        <div key={questionIndex} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <label className="block text-sm font-medium text-slate-700">Pertanyaan {questionIndex + 1}</label>
                              <textarea
                                value={question.text}
                                onChange={(e) => {
                                  const newBlocks = [...(formData.auditoryBlocks || [])];
                                  newBlocks[idx].questions = updateVisualQuestion(
                                    newBlocks[idx].questions || [],
                                    questionIndex,
                                    { text: e.target.value }
                                  );
                                  setFormData({ ...formData, auditoryBlocks: newBlocks });
                                }}
                                placeholder="Tulis pertanyaan quiz di sini"
                                className="w-full p-3 border border-slate-300 rounded-lg text-sm min-h-20 resize-vertical"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const newBlocks = [...(formData.auditoryBlocks || [])];
                                newBlocks[idx].questions = (newBlocks[idx].questions || []).filter((_, i) => i !== questionIndex);
                                setFormData({ ...formData, auditoryBlocks: newBlocks });
                              }}
                              className="text-red-600 hover:text-red-700 text-sm font-medium whitespace-nowrap"
                            >
                              Hapus Soal
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-slate-700">Opsi Jawaban</p>
                              <button
                                type="button"
                                onClick={() => {
                                  const newBlocks = [...(formData.auditoryBlocks || [])];
                                  const questions = [...(newBlocks[idx].questions || [])];
                                  questions[questionIndex] = {
                                    ...questions[questionIndex],
                                    options: [...questions[questionIndex].options, ''],
                                  };
                                  newBlocks[idx].questions = questions;
                                  setFormData({ ...formData, auditoryBlocks: newBlocks });
                                }}
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                              >
                                + Tambah Opsi
                              </button>
                            </div>

                            <div className="grid gap-3">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name={`auditory-correct-${idx}-${questionIndex}`}
                                    checked={question.correctOptionIndex === optionIndex}
                                    onChange={() => {
                                      const newBlocks = [...(formData.auditoryBlocks || [])];
                                      newBlocks[idx].questions = updateVisualQuestion(
                                        newBlocks[idx].questions || [],
                                        questionIndex,
                                        { correctOptionIndex: optionIndex }
                                      );
                                      setFormData({ ...formData, auditoryBlocks: newBlocks });
                                    }}
                                    className="h-4 w-4 text-purple-600"
                                    title="Set jawaban benar"
                                  />

                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newBlocks = [...(formData.auditoryBlocks || [])];
                                      const questions = [...(newBlocks[idx].questions || [])];
                                      const options = [...questions[questionIndex].options];
                                      options[optionIndex] = e.target.value;
                                      questions[questionIndex] = {
                                        ...questions[questionIndex],
                                        options,
                                      };
                                      newBlocks[idx].questions = questions;
                                      setFormData({ ...formData, auditoryBlocks: newBlocks });
                                    }}
                                    placeholder={`Opsi ${optionIndex + 1}`}
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                  />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newBlocks = [...(formData.auditoryBlocks || [])];
                                      const questions = [...(newBlocks[idx].questions || [])];
                                      const options = questions[questionIndex].options.filter((_, i) => i !== optionIndex);
                                      const nextCorrectIndex = questions[questionIndex].correctOptionIndex >= options.length
                                        ? Math.max(0, options.length - 1)
                                        : questions[questionIndex].correctOptionIndex;
                                      questions[questionIndex] = {
                                        ...questions[questionIndex],
                                        options,
                                        correctOptionIndex: nextCorrectIndex,
                                      };
                                      newBlocks[idx].questions = questions;
                                      setFormData({ ...formData, auditoryBlocks: newBlocks });
                                    }}
                                    disabled={question.options.length <= 2}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      {(block.questions || []).length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                          Belum ada soal. Klik tombol <span className="font-semibold text-purple-600">Tambah Soal</span> untuk memulai quiz section ini.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {(formData.auditoryBlocks || []).length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">Belum ada auditory block. Klik tombol tambah block di bawah.</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              const newBlock = createAuditoryBlock(getNextAuditorySectionNumber(), 'material');
              setFormData({
                ...formData,
                auditoryBlocks: [...(formData.auditoryBlocks || []), newBlock],
              });
            }}
            className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-purple-500 text-slate-600 hover:text-purple-600 font-medium text-sm transition-colors"
          >
            + Tambah Block Audio
          </button>
        </div>

        {/* ── Kinesthetic Learning (Tiered + SQL Practice) ──────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-600" />
            👐 Konten Kinestetik (Tiered + SQL Practice)
          </h2>

          <div className="bg-orange-50/50 rounded-lg p-4 border border-orange-200 text-sm text-orange-900">
            <p className="font-semibold mb-2">💡 Tips: Susun kinestetik sebagai section bertahap</p>
            <p>Setiap section bisa berisi materi, praktik teks, praktik SQL, atau quiz untuk membuka section berikutnya.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                const nextSection = getNextKinestheticSectionNumber();
                setFormData({
                  ...formData,
                  kinestheticBlocks: [...(formData.kinestheticBlocks || []), {
                    ...createVisualBlock(nextSection, 'material'),
                    type: 'material',
                    content: '',
                  } as any],
                });
              }}
              className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
            >
              + Tambah Section
            </button>

            <button
              type="button"
              onClick={() => {
                const nextSection = getNextKinestheticSectionNumber();
                setFormData({
                  ...formData,
                  kinestheticBlocks: [...(formData.kinestheticBlocks || []), createKinestheticQuizBlock(nextSection)],
                });
              }}
              className="px-4 py-2 rounded-lg border border-orange-200 text-orange-700 text-sm font-semibold hover:bg-orange-50 transition-colors"
            >
              + Tambah Section Quiz
            </button>
          </div>

          {/* Blocks Container */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            {(formData.kinestheticBlocks || []).map((block, idx) => (
              <div key={block.id || idx} className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    value={block.content || block.instructions || block.sampleSql || ''}
                    onChange={() => {
                      // no-op label field placeholder; actual block content is edited below
                    }}
                    placeholder={`Block / Section ${idx + 1}`}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    readOnly
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={block.section || 1}
                      onChange={(e) => {
                        const newBlocks = [...(formData.kinestheticBlocks || [])];
                        newBlocks[idx].section = Math.max(1, Number(e.target.value) || 1);
                        setFormData({ ...formData, kinestheticBlocks: newBlocks });
                      }}
                      className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      title="Section"
                    />
                  <select
                    value={block.type}
                    onChange={(e) => {
                      const newBlocks = [...(formData.kinestheticBlocks || [])];
                      newBlocks[idx].type = e.target.value as any;
                      if (e.target.value === 'quiz' && (!newBlocks[idx].questions || newBlocks[idx].questions.length === 0)) {
                        newBlocks[idx].questions = [createEmptyVisualQuestion()];
                      }
                      setFormData({ ...formData, kinestheticBlocks: newBlocks });
                    }}
                    className="px-3 py-1 border border-slate-300 rounded text-sm font-medium"
                  >
                    <option value="material">📚 Materi</option>
                    <option value="practice-text">✍️ Praktik Teks</option>
                    <option value="practice-sql">🔍 Praktik SQL</option>
                    <option value="quiz">📝 Quiz</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const newBlocks = formData.kinestheticBlocks?.filter((_, i) => i !== idx);
                      setFormData({ ...formData, kinestheticBlocks: newBlocks });
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Hapus
                  </button>
                  </div>
                </div>

                {/* Content for material block (rich editor) */}
                {block.type === 'material' && (
                  <div>
                    <RichEditor
                      value={block.content || ''}
                      onChange={(val: string) => {
                        const newBlocks = [...(formData.kinestheticBlocks || [])];
                        newBlocks[idx].content = val;
                        setFormData({ ...formData, kinestheticBlocks: newBlocks });
                      }}
                      placeholder="Tulis materi pembelajaran..."
                    />
                  </div>
                )}

                {/* Practice-text block */}
                {block.type === 'practice-text' && (
                  <>
                    <input
                      type="text"
                      value={block.instructions || ''}
                      onChange={(e) => {
                        const newBlocks = [...(formData.kinestheticBlocks || [])];
                        newBlocks[idx].instructions = e.target.value;
                        setFormData({ ...formData, kinestheticBlocks: newBlocks });
                      }}
                      placeholder="Instruksi praktik..."
                      className="w-full p-2 border border-slate-300 rounded text-sm"
                    />
                    <textarea
                      value={block.content || ''}
                      onChange={(e) => {
                        const newBlocks = [...(formData.kinestheticBlocks || [])];
                        newBlocks[idx].content = e.target.value;
                        setFormData({ ...formData, kinestheticBlocks: newBlocks });
                      }}
                      placeholder="Konten praktik (bisa berupa soal, latihan, dll)..."
                      className="w-full p-2 border border-slate-300 rounded text-sm min-h-20 resize-vertical"
                    />
                  </>
                )}

                {/* Practice-SQL block */}
                {block.type === 'practice-sql' && (
                  <>
                    <input
                      type="text"
                      value={block.instructions || ''}
                      onChange={(e) => {
                        const newBlocks = [...(formData.kinestheticBlocks || [])];
                        newBlocks[idx].instructions = e.target.value;
                        setFormData({ ...formData, kinestheticBlocks: newBlocks });
                      }}
                      placeholder="Instruksi SQL (contoh: SELECT semua users)"
                      className="w-full p-2 border border-slate-300 rounded text-sm"
                    />
                    <textarea
                      value={block.sampleSql || ''}
                      onChange={(e) => {
                        const newBlocks = [...(formData.kinestheticBlocks || [])];
                        newBlocks[idx].sampleSql = e.target.value;
                        setFormData({ ...formData, kinestheticBlocks: newBlocks });
                      }}
                      placeholder="Sample SQL (optional, untuk referensi siswa)"
                      className="w-full p-2 border border-slate-300 rounded text-sm min-h-20 font-mono text-xs resize-vertical"
                    />
                  </>
                )}

                {block.type === 'quiz' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Quiz Section</p>
                        <p className="text-xs text-slate-500">Tambahkan pertanyaan dan opsi tanpa JSON mentah.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newBlocks = [...(formData.kinestheticBlocks || [])];
                          newBlocks[idx].questions = [
                            ...(newBlocks[idx].questions || []),
                            createEmptyVisualQuestion(),
                          ];
                          setFormData({ ...formData, kinestheticBlocks: newBlocks });
                        }}
                        className="px-3 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
                      >
                        + Tambah Soal
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(block.questions || []).map((question, questionIndex) => (
                        <div key={questionIndex} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <label className="block text-sm font-medium text-slate-700">Pertanyaan {questionIndex + 1}</label>
                              <textarea
                                value={question.text}
                                onChange={(e) => {
                                  const newBlocks = [...(formData.kinestheticBlocks || [])];
                                  newBlocks[idx].questions = updateVisualQuestion(
                                    newBlocks[idx].questions || [],
                                    questionIndex,
                                    { text: e.target.value }
                                  );
                                  setFormData({ ...formData, kinestheticBlocks: newBlocks });
                                }}
                                placeholder="Tulis pertanyaan quiz di sini"
                                className="w-full p-3 border border-slate-300 rounded-lg text-sm min-h-20 resize-vertical"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const newBlocks = [...(formData.kinestheticBlocks || [])];
                                newBlocks[idx].questions = (newBlocks[idx].questions || []).filter((_, i) => i !== questionIndex);
                                setFormData({ ...formData, kinestheticBlocks: newBlocks });
                              }}
                              className="text-red-600 hover:text-red-700 text-sm font-medium whitespace-nowrap"
                            >
                              Hapus Soal
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-slate-700">Opsi Jawaban</p>
                              <button
                                type="button"
                                onClick={() => {
                                  const newBlocks = [...(formData.kinestheticBlocks || [])];
                                  const questions = [...(newBlocks[idx].questions || [])];
                                  questions[questionIndex] = {
                                    ...questions[questionIndex],
                                    options: [...questions[questionIndex].options, ''],
                                  };
                                  newBlocks[idx].questions = questions;
                                  setFormData({ ...formData, kinestheticBlocks: newBlocks });
                                }}
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                              >
                                + Tambah Opsi
                              </button>
                            </div>

                            <div className="grid gap-3">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name={`kinesthetic-correct-${idx}-${questionIndex}`}
                                    checked={question.correctOptionIndex === optionIndex}
                                    onChange={() => {
                                      const newBlocks = [...(formData.kinestheticBlocks || [])];
                                      newBlocks[idx].questions = updateVisualQuestion(
                                        newBlocks[idx].questions || [],
                                        questionIndex,
                                        { correctOptionIndex: optionIndex }
                                      );
                                      setFormData({ ...formData, kinestheticBlocks: newBlocks });
                                    }}
                                    className="h-4 w-4 text-orange-600"
                                    title="Set jawaban benar"
                                  />

                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newBlocks = [...(formData.kinestheticBlocks || [])];
                                      const questions = [...(newBlocks[idx].questions || [])];
                                      const options = [...questions[questionIndex].options];
                                      options[optionIndex] = e.target.value;
                                      questions[questionIndex] = {
                                        ...questions[questionIndex],
                                        options,
                                      };
                                      newBlocks[idx].questions = questions;
                                      setFormData({ ...formData, kinestheticBlocks: newBlocks });
                                    }}
                                    placeholder={`Opsi ${optionIndex + 1}`}
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                  />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newBlocks = [...(formData.kinestheticBlocks || [])];
                                      const questions = [...(newBlocks[idx].questions || [])];
                                      const options = questions[questionIndex].options.filter((_, i) => i !== optionIndex);
                                      const nextCorrectIndex = questions[questionIndex].correctOptionIndex >= options.length
                                        ? Math.max(0, options.length - 1)
                                        : questions[questionIndex].correctOptionIndex;
                                      questions[questionIndex] = {
                                        ...questions[questionIndex],
                                        options,
                                        correctOptionIndex: nextCorrectIndex,
                                      };
                                      newBlocks[idx].questions = questions;
                                      setFormData({ ...formData, kinestheticBlocks: newBlocks });
                                    }}
                                    disabled={question.options.length <= 2}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      {(block.questions || []).length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                          Belum ada soal. Klik tombol <span className="font-semibold text-orange-600">Tambah Soal</span> untuk memulai quiz section ini.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {(formData.kinestheticBlocks || []).length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">Belum ada block. Klik "Tambah Block" di bawah.</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                const nextSection = getNextKinestheticSectionNumber();
                setFormData({
                  ...formData,
                  kinestheticBlocks: [...(formData.kinestheticBlocks || []), {
                    id: Date.now().toString(),
                    section: nextSection,
                    type: 'material',
                    content: '',
                  }],
                });
              }}
              className="w-full sm:w-auto py-2 px-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-orange-500 text-slate-600 hover:text-orange-600 font-medium text-sm transition-colors"
            >
              + Tambah Section
            </button>

            <button
              type="button"
              onClick={() => {
                const nextSection = getNextKinestheticSectionNumber();
                setFormData({
                  ...formData,
                  kinestheticBlocks: [...(formData.kinestheticBlocks || []), createKinestheticQuizBlock(nextSection)],
                });
              }}
              className="w-full sm:w-auto py-2 px-4 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 text-slate-600 hover:text-orange-600 font-medium text-sm transition-colors"
            >
              + Tambah Section Quiz
            </button>
          </div>

          {/* Add Block Button */}
          <button
            type="button"
            onClick={() => {
              const newBlock: KinestheticBlock = {
                id: Date.now().toString(),
                section: getNextKinestheticSectionNumber(),
                type: 'material',
                content: '',
              };
              setFormData({
                ...formData,
                kinestheticBlocks: [...(formData.kinestheticBlocks || []), newBlock],
              });
            }}
            className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-orange-500 text-slate-600 hover:text-orange-600 font-medium text-sm transition-colors"
          >
            + Tambah Block
          </button>
        </div>

        {/* ── Submit ────────────────────────────────── */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Modul'}
          </button>
        </div>
      </form>
    </div>
  );
}
