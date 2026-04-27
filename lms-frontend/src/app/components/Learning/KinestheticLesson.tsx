import React, { useState } from 'react';
import { KinestheticContent } from '../../types';
import { Reorder, motion } from "motion/react";
import { Hand, CheckCircle2, RotateCcw, BookOpen, PlayCircle } from 'lucide-react';

interface Props {
  content: KinestheticContent;
}

export function KinestheticLesson({ content }: Props) {
  const [items, setItems] = useState(content.items);
  const [completed, setCompleted] = useState(false);

  // Mock checking logic
  const handleCheck = () => {
    setCompleted(true);
  };

  const handleReset = () => {
    setCompleted(false);
    // Shuffle
    setItems([...items].sort(() => Math.random() - 0.5));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* 1. Learning Material Section - THEORY FIRST */}
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

      {/* 2. Demonstration Video Section */}
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
              <video 
                src={content.demoVideoUrl} 
                controls 
                className="w-full h-full object-contain"
              />
           </div>
        </div>
      )}

      {/* 3. Interactive Activity Section */}
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
              <span className="bg-white text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">!</span>
              Task Instructions
            </h4>
            <p className="text-orange-50 leading-relaxed">
              {content.instructions}
            </p>
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
             {/* Using Reorder from Motion for drag and drop list simulation */}
             <Reorder.Group axis="y" values={items} onReorder={setItems} className="w-full space-y-3">
               {items.map((item) => (
                 <Reorder.Item key={item} value={item}>
                   <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing flex items-center justify-between group hover:border-orange-300 hover:shadow-md transition-all">
                     <span className="font-medium text-slate-700">{item}</span>
                     <div className="text-slate-300 group-hover:text-orange-400">
                       <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" /></svg>
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
