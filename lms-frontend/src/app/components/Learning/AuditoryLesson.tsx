import React from 'react';
import { AuditoryContent } from '../../types';
import { motion } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { DdlPracticeCard } from './DdlPracticeCard';

interface Props {
  content: AuditoryContent;
}

export function AuditoryLesson({ content }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Volume2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">🎧 Konten Audio</h3>
            <p className="text-purple-200 text-sm">Dengarkan dan ikuti materi pembelajaran</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Render HTML content with embedded audio */}
          <div 
            className="prose prose-sm max-w-none space-y-4"
            dangerouslySetInnerHTML={{ __html: content.transcript || '<p>Belum ada konten audio</p>' }}
            style={{
              color: '#475569',
              lineHeight: '1.6',
            }}
          />
          
          {/* Styling untuk audio players */}
          <style>{`
            .prose audio {
              width: 100%;
              max-width: 600px;
              margin: 16px 0;
              outline: none;
              border-radius: 8px;
            }
            
            .prose audio::-webkit-media-controls-panel {
              background-color: #f1f5f9;
            }
            
            .prose audio::-webkit-media-controls-mute-button {
              cursor: pointer;
            }
            
            .prose p {
              margin: 12px 0;
            }
            
            .prose p:first-child {
              margin-top: 0;
            }
          `}</style>
        </div>
      </div>

      <DdlPracticeCard
        title="DDL Practice"
        subtitle="Latihan struktur database: create, alter, rename, drop, truncate"
        accentClassName="from-purple-600 to-indigo-600"
        accentTextClassName="text-purple-100"
      />
    </motion.div>
  );
}
