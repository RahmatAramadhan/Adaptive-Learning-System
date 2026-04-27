import React from 'react';
import { VisualContent } from '../../types';
import { motion } from 'motion/react';

interface Props {
  content: VisualContent;
}

export function VisualLesson({ content }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {content.videoUrl && (
          <div className="aspect-video bg-slate-900 w-full relative group">
             {/* Simple Video Player */}
             <video 
               src={content.videoUrl} 
               controls 
               className="w-full h-full object-cover"
               poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80"
             >
               Your browser does not support the video tag.
             </video>
          </div>
        )}
        
        <div className="p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </span>
            Visual Exploration
          </h3>
          
          <div 
            className="prose prose-lg max-w-none text-slate-600 mb-8 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4 [&_img]:rounded-xl [&_img]:my-4 [&_a]:text-blue-600 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: content.text }}
          />

          {content.images && content.images.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6 mt-8 border-t border-slate-100 pt-8">
              {content.images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden shadow-md">
                  <img 
                    src={img} 
                    alt={`Visual aid ${idx + 1}`} 
                    className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white font-medium">Figure {idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {content.diagrams && content.diagrams.length > 0 && (
            <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-700 mb-4">Key Diagrams</h4>
              <div className="grid gap-4">
                {content.diagrams.map((diag, idx) => (
                   <img key={idx} src={diag} alt="Diagram" className="rounded-lg border border-slate-200 bg-white p-2" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
