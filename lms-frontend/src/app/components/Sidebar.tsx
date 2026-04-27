import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard, 
  Settings, 
  Users, 
  LogOut,
  BrainCircuit,
  FileQuestion
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full w-64 bg-slate-900 text-white border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <BrainCircuit className="w-8 h-8 text-indigo-400" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          AdaptiveLMS
        </h1>
      </div>

      <div className="flex flex-col flex-1 px-3 gap-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {currentUser.role === 'guru' ? 'Instructor' : 'Student'}
        </div>

        {currentUser.role === 'siswa' && (
          <>
            <NavItem to="/student" icon={LayoutDashboard} label="Dashboard" end />
            <NavItem to="/student/courses" icon={BookOpen} label="My Courses" />
            <NavItem to="/student/evaluations" icon={FileQuestion} label="Evaluations" />
            <NavItem to="/student/profile" icon={Settings} label="My Profile" />
          </>
        )}

        {currentUser.role === 'guru' && (
          <>
            <NavItem to="/teacher" icon={LayoutDashboard} label="Overview" end />
            <NavItem to="/teacher/students" icon={Users} label="Manajemen Siswa" />
            <NavItem to="/teacher/modules" icon={BookOpen} label="Kelola Materi" />
            
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">
              Evaluasi
            </div>
            <NavItem to="/teacher/evaluations" icon={FileQuestion} label="Kelola Evaluasi" />
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-400 truncate capitalize">{currentUser.role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, end }: { to: string, icon: any, label: string, end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        isActive 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      )}
    >
      <Icon className="w-5 h-5" />
      {label}
    </NavLink>
  );
}
