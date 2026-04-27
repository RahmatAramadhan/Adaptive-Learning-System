import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router';
import { User, UserRole } from '../types';
import { BrainCircuit, BookOpen, Users } from 'lucide-react';

export function Home() {
  const { users } = useData();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (user: User) => {
    login(user.id);
    if (user.role === 'teacher') {
      navigate('/teacher');
    } else {
      navigate('/student');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-2xl mb-6 ring-1 ring-indigo-500/30">
            <BrainCircuit className="w-16 h-16 text-indigo-400" />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
            Adaptive Learning System
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Experience education tailored to your unique learning style. 
            Whether you learn by seeing, hearing, or doing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Student Login Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-indigo-500/50 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Student Access</h2>
                <p className="text-slate-400 text-sm">Continue your learning journey</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Select a User Profile</p>
              {users.filter(u => u.role === 'student').map(user => (
                <button
                  key={user.id}
                  onClick={() => handleLogin(user)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900/50 hover:bg-indigo-600 hover:text-white border border-slate-800 hover:border-indigo-500 transition-all text-left group/btn"
                >
                  <div>
                    <span className="block font-semibold text-slate-200 group-hover/btn:text-white">{user.name}</span>
                    <span className="text-xs text-slate-500 group-hover/btn:text-indigo-200 capitalize">
                      {user.learningStyle} Learner
                    </span>
                  </div>
                  <div className="text-slate-600 group-hover/btn:text-indigo-200">→</div>
                </button>
              ))}
            </div>
          </div>

          {/* Teacher Login Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Teacher Access</h2>
                <p className="text-slate-400 text-sm">Manage content & students</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Select Instructor</p>
              {users.filter(u => u.role === 'teacher').map(user => (
                <button
                  key={user.id}
                  onClick={() => handleLogin(user)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900/50 hover:bg-purple-600 hover:text-white border border-slate-800 hover:border-purple-500 transition-all text-left group/btn"
                >
                  <div>
                    <span className="block font-semibold text-slate-200 group-hover/btn:text-white">{user.name}</span>
                    <span className="text-xs text-slate-500 group-hover/btn:text-purple-200">
                      Administrator
                    </span>
                  </div>
                  <div className="text-slate-600 group-hover/btn:text-purple-200">→</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
