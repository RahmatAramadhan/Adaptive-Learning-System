import React, { useState, useRef, useEffect } from 'react';
import { AuditoryContent } from '../../types';
import { motion } from 'motion/react';
import { Play, Pause, FastForward, Rewind, Volume2 } from 'lucide-react';

interface Props {
  content: AuditoryContent;
}

export function AuditoryLesson({ content }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
       // Reset when content changes
       audioRef.current.pause();
       setIsPlaying(false);
       setCurrentTime(0);
    }
  }, [content.audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Volume2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Audio Lesson</h3>
              <p className="text-purple-200">Listen to the lecture content</p>
            </div>
          </div>

          {/* Audio Player UI */}
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/10">
            <audio 
              ref={audioRef} 
              src={content.audioUrl} 
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
            
            <div className="flex items-center justify-center gap-8 mb-6">
               <button 
                 onClick={() => {
                   if (audioRef.current) audioRef.current.currentTime -= 10;
                 }}
                 className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
                >
                  <Rewind className="w-6 h-6" />
                </button>
               
               <button 
                 onClick={togglePlay}
                 className="w-20 h-20 bg-white text-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
               >
                 {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
               </button>
               
               <button 
                 onClick={() => {
                   if (audioRef.current) audioRef.current.currentTime += 10;
                 }}
                 className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
                >
                  <FastForward className="w-6 h-6" />
                </button>
            </div>
            
            <div className="space-y-2">
              <input 
                type="range" 
                min="0" 
                max={duration || 100} 
                value={currentTime} 
                onChange={handleSeek}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
              <div className="flex justify-between text-xs text-purple-200 font-medium font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-slate-800">Transcript</h4>
            <button className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1">
              Download PDF
            </button>
          </div>
          
          <div 
            className="bg-slate-50 rounded-xl p-6 border border-slate-200 max-h-[400px] overflow-y-auto font-serif text-lg leading-relaxed text-slate-700 prose prose-purple [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: content.transcript }}
          />

          {content.podcastLink && (
            <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
              </div>
              <span className="font-medium">Also available on Spotify Podcasts</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
