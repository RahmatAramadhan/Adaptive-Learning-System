import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../../context/DataContext';
import { Course, Module } from '../../types';
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

const Size = Quill.import('attributors/style/size') as any;
Size.whitelist = ['10px','12px','14px','16px','18px','20px','24px','28px','32px','36px','48px'];
Quill.register(Size, true);

const Font = Quill.import('attributors/style/font') as any;
Font.whitelist = ['sans-serif','serif','monospace'];
Quill.register(Font, true);

const Align = Quill.import('attributors/style/align') as any;
Quill.register(Align, true);

const buildModules = () => ({
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
  'link', 'resizable-image',
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
}

const RichEditor: React.FC<RichEditorProps> = ({ value, onChange, placeholder }) => {
  const quillRef = useRef<ReactQuill>(null);
  const modulesRef = useRef(buildModules());

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
  module: Module;
  onClose: () => void;
}

export function TeacherEditModule({ course, module, onClose }: TeacherEditModuleProps) {
  const navigate = useNavigate();
  const { updateModule } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: module.title,
    description: module.description,
    visualText: module.content.visual.text,
    visualImages: module.content.visual.images ?? [],
    visualDiagrams: module.content.visual.diagrams ?? [],
    visualVideoUrl: module.content.visual.videoUrl ?? '',
    auditoryAudioUrl: module.content.auditory.audioUrl ?? '',
    auditoryTranscript: module.content.auditory.transcript ?? '',
    kinestheticActivityType: module.content.kinesthetic.activityType ?? 'drag-drop',
    kinestheticInstructions: module.content.kinesthetic.instructions ?? '',
    kinestheticItems: module.content.kinesthetic.items ?? [],
    kinestheticLearningMaterial: module.content.kinesthetic.learningMaterial ?? '',
    kinestheticDemoVideoUrl: module.content.kinesthetic.demoVideoUrl ?? '',
  });

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
      const updatedModule = {
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
            audioUrl: formData.auditoryAudioUrl,
            transcript: formData.auditoryTranscript,
          },
          kinesthetic: {
            activityType: formData.kinestheticActivityType,
            instructions: formData.kinestheticInstructions,
            items: Array.isArray(formData.kinestheticItems) ? formData.kinestheticItems : [],
            learningMaterial: formData.kinestheticLearningMaterial,
            demoVideoUrl: formData.kinestheticDemoVideoUrl,
          },
        },
      };

      await updateModule(course.id, module.id, updatedModule);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update module');
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
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Module
      </button>

      <h1 className="text-3xl font-bold text-slate-900">Edit Module: {module.title}</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* ── Basic Info ──────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Module Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
            <RichEditor
              value={formData.description}
              onChange={(val) => setFormData({ ...formData, description: val })}
              placeholder="Module description"
            />
          </div>
        </div>

        {/* ── Visual Learning ────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            👁️ Visual Content (Read & Watch)
          </h2>
          
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Rich Text Content</label>
            <RichEditor
              value={formData.visualText}
              onChange={(val) => setFormData({ ...formData, visualText: val })}
              placeholder="Text content for visual learners"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 border border-dashed border-slate-300 rounded-xl hover:border-blue-500 transition-colors bg-slate-50">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Video className="w-4 h-4 text-blue-500" /> Upload Video Lesson
              </label>
              <button
                type="button"
                onClick={() => handleFileUpload('visualVideoUrl', 'video')}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 px-4 py-2 border border-slate-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Choose Video File
              </button>
              {formData.visualVideoUrl && (
                <div className="mt-2">
                  <p className="text-xs text-green-600 flex items-center gap-1 mb-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block" /> Video attached
                  </p>
                  <p className="text-xs text-slate-500 truncate">{formData.visualVideoUrl}</p>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visualVideoUrl: '' })}
                    className="text-xs text-red-600 hover:text-red-700 mt-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border border-dashed border-slate-300 rounded-xl hover:border-blue-500 transition-colors bg-slate-50">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <ImageIcon className="w-4 h-4 text-blue-500" /> Add Supplementary Image
              </label>
              <button
                type="button"
                onClick={() => handleImageListUpload(false)}
                className="block w-full text-sm text-slate-500 px-4 py-2 border border-slate-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Choose Image File
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
            🎧 Auditory Content (Listen)
          </h2>
          
          <div className="p-4 border border-dashed border-slate-300 rounded-xl hover:border-purple-500 transition-colors bg-slate-50">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Upload className="w-4 h-4 text-purple-500" /> Upload Audio File
            </label>
            <button
              type="button"
              onClick={() => handleFileUpload('auditoryAudioUrl', 'audio')}
              className="block w-full text-sm text-slate-500 px-4 py-2 border border-slate-300 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Choose Audio File
            </button>
            {formData.auditoryAudioUrl && (
              <div className="mt-2">
                <p className="text-xs text-green-600 flex items-center gap-1 mb-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block" /> Audio attached
                </p>
                <p className="text-xs text-slate-500 truncate">{formData.auditoryAudioUrl}</p>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, auditoryAudioUrl: '' })}
                  className="text-xs text-red-600 hover:text-red-700 mt-1"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Transcript</label>
            <RichEditor
              value={formData.auditoryTranscript}
              onChange={(val) => setFormData({ ...formData, auditoryTranscript: val })}
              placeholder="Text version of the audio content"
            />
          </div>
        </div>

        {/* ── Kinesthetic Learning ────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-600" />
            ✋ Kinesthetic Content (Learn & Do)
          </h2>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">1. Practical Theory & Instructions</label>
            <RichEditor
              value={formData.kinestheticLearningMaterial}
              onChange={(val) => setFormData({ ...formData, kinestheticLearningMaterial: val })}
              placeholder="Jelaskan konsep praktik di sini..."
            />
          </div>

          <div className="p-4 border border-dashed border-slate-300 rounded-xl hover:border-orange-500 transition-colors bg-slate-50">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <PlayCircle className="w-4 h-4 text-orange-500" /> Upload Demo/Practical Video
            </label>
            <button
              type="button"
              onClick={() => handleFileUpload('kinestheticDemoVideoUrl', 'video')}
              className="block w-full text-sm text-slate-500 px-4 py-2 border border-slate-300 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Choose Demo Video
            </button>
            {formData.kinestheticDemoVideoUrl && (
              <div className="mt-2">
                <p className="text-xs text-green-600 flex items-center gap-1 mb-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block" /> Demo Video attached
                </p>
                <p className="text-xs text-slate-500 truncate">{formData.kinestheticDemoVideoUrl}</p>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, kinestheticDemoVideoUrl: '' })}
                  className="text-xs text-red-600 hover:text-red-700 mt-1"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100 space-y-4">
            <label className="block text-sm font-bold text-slate-800">2. Interactive Practical Task</label>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Task Instructions</label>
              <RichEditor
                value={formData.kinestheticInstructions}
                onChange={(val) => setFormData({ ...formData, kinestheticInstructions: val })}
                placeholder="Step-by-step instructions for the activity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Task Items (Comma Separated)</label>
              <input
                type="text"
                placeholder="e.g., Item 1, Item 2, Item 3"
                value={(formData.kinestheticItems as string[]).join(', ')}
                onChange={(e) => {
                  const items = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  setFormData({ ...formData, kinestheticItems: items });
                }}
                className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* ── Submit ────────────────────────────────── */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
