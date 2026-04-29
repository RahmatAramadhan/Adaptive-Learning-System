import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../../context/DataContext';
import { Course, Module, KinestheticBlock } from '../../types';
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
    auditoryTranscript: '',
    kinestheticActivityType: 'tiered-blocks' as const,
    kinestheticInstructions: 'Kerjakan latihan kinestetik berikut',
    kinestheticBlocks: [] as KinestheticBlock[],
    kinestheticLearningMaterial: '',
    kinestheticDemoVideoUrl: '',
  };

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
        type: 'material',
        content: kinesthetic.learningMaterial,
      });
    }

    if (kinesthetic?.instructions || (kinesthetic?.items && kinesthetic.items.length > 0)) {
      blocks.push({
        id: 'legacy-practice',
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
          },
          auditory: {
            transcript: formData.auditoryTranscript,
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
            👁️ Konten Visual (Baca & Tonton)
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Konten Teks</label>
            <RichEditor
              value={formData.visualText}
              onChange={(val) => setFormData({ ...formData, visualText: val })}
              placeholder="Konten teks untuk pelajar visual"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 border border-dashed border-slate-300 rounded-xl hover:border-blue-500 transition-colors bg-slate-50">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Video className="w-4 h-4 text-blue-500" /> Unggah Video Pelajaran
              </label>
              <button
                type="button"
                onClick={() => handleFileUpload('visualVideoUrl', 'video')}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 px-4 py-2 border border-slate-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Pilih File Video
              </button>
              {formData.visualVideoUrl && (
                <div className="mt-2">
                  <p className="text-xs text-green-600 flex items-center gap-1 mb-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block" /> Video terlampir
                  </p>
                  <p className="text-xs text-slate-500 truncate">{formData.visualVideoUrl}</p>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visualVideoUrl: '' })}
                    className="text-xs text-red-600 hover:text-red-700 mt-1"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border border-dashed border-slate-300 rounded-xl hover:border-blue-500 transition-colors bg-slate-50">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <ImageIcon className="w-4 h-4 text-blue-500" /> Tambah Gambar Pelengkap
              </label>
              <button
                type="button"
                onClick={() => handleImageListUpload(false)}
                className="block w-full text-sm text-slate-500 px-4 py-2 border border-slate-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Pilih File Gambar
              </button>
              {(formData.visualImages as string[]).length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(formData.visualImages as string[]).map((imgUrl: string, imgIdx: number) => (
                    <div key={imgIdx} className="relative group">
                      <img src={imgUrl} alt={`img-${imgIdx}`}
                        className="w-full h-20 object-cover rounded-lg border border-slate-200" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            visualImages: (prev.visualImages as string[]).filter((_: string, i: number) => i !== imgIdx)
                          }));
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Auditory Learning ──────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-600" />
            🎧 Konten Audio (Dengarkan)
          </h2>
          
          <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-200 text-sm text-purple-900">
            <p className="font-semibold mb-2">💡 Tips: Gunakan editor di bawah untuk menggabungkan teks dan audio</p>
            <p>Klik tombol 🎵 di toolbar untuk menambahkan file audio. Anda bisa menambahkan unlimited audio dengan teks yang selang-seling!</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Konten Teks + Audio Transkrip</label>
            <RichEditor
              value={formData.auditoryTranscript}
              onChange={(val) => setFormData({ ...formData, auditoryTranscript: val })}
              placeholder="Tulis teks, tambahkan audio... Ulangi sesuai kebutuhan!"
              includeAudio={true}
            />
            <p className="text-xs text-slate-500 mt-2">📌 Struktur: Teks → Audio → Teks → Audio (unlimited)</p>
          </div>
        </div>

        {/* ── Kinesthetic Learning (Tiered + SQL Practice) ──────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-600" />
            👐 Konten Kinestetik (Tiered + SQL Practice)
          </h2>

          <div className="bg-orange-50/50 rounded-lg p-4 border border-orange-200 text-sm text-orange-900">
            <p className="font-semibold mb-2">💡 Tips: Buat urutan: Materi → Praktik → Materi → Praktik</p>
            <p>Praktik bisa berupa teks interaktif atau SQL editor dengan visualisasi hasil</p>
          </div>

          {/* Blocks Container */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            {(formData.kinestheticBlocks || []).map((block, idx) => (
              <div key={block.id || idx} className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <select
                    value={block.type}
                    onChange={(e) => {
                      const newBlocks = [...(formData.kinestheticBlocks || [])];
                      newBlocks[idx].type = e.target.value as any;
                      setFormData({ ...formData, kinestheticBlocks: newBlocks });
                    }}
                    className="px-3 py-1 border border-slate-300 rounded text-sm font-medium"
                  >
                    <option value="material">📚 Materi</option>
                    <option value="practice-text">✍️ Praktik Teks</option>
                    <option value="practice-sql">🔍 Praktik SQL</option>
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
              </div>
            ))}
            {(formData.kinestheticBlocks || []).length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">Belum ada block. Klik "Tambah Block" di bawah.</p>
            )}
          </div>

          {/* Add Block Button */}
          <button
            type="button"
            onClick={() => {
              const newBlock: KinestheticBlock = {
                id: Date.now().toString(),
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
