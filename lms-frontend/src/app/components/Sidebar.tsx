import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen,
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  LogOut,
  BrainCircuit,
  FileQuestion,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  if (!currentUser) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-slate-900 text-white border-r border-slate-800 transition-all duration-300 overflow-hidden",
      collapsed ? 'w-20' : 'w-64'
    )}>
      <div className={cn(
        "p-6 flex items-center",
        collapsed ? 'flex-col justify-center gap-3' : 'justify-between gap-3'
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <BrainCircuit className="w-8 h-8 text-indigo-400 flex-shrink-0" />
          {!collapsed && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent truncate">
              AdaptiveLMS
            </h1>
          )}
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors",
            collapsed && 'self-center mt-1'
          )}
          aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
          title={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className={cn("flex flex-col flex-1 gap-1", collapsed ? 'px-2' : 'px-3')}>
        {!collapsed && (
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {currentUser.role === 'guru' ? 'Instructor' : 'Student'}
          </div>
        )}

        {currentUser.role === 'siswa' && (
          <>
            <NavItem to="/student" icon={LayoutDashboard} label="Dashboard" end collapsed={collapsed} />
            <NavItem to="/student/evaluations" icon={FileQuestion} label="Evaluations" collapsed={collapsed} />
          </>
        )}

        {currentUser.role === 'guru' && (
          <>
            <NavItem to="/teacher" icon={LayoutDashboard} label="Overview" end collapsed={collapsed} />
            <NavItem to="/teacher/students" icon={Users} label="Manajemen Siswa" collapsed={collapsed} />
            <NavItem to="/teacher/modules" icon={BookOpen} label="Kelola Materi" collapsed={collapsed} />
            
            {!collapsed && (
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">
                Evaluasi
              </div>
            )}
            <NavItem to="/teacher/evaluations" icon={FileQuestion} label="Kelola Evaluasi" collapsed={collapsed} />
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className={cn("flex items-center mb-2", collapsed ? 'justify-center px-0 gap-0' : 'gap-3 px-3 py-2')}>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
            {currentUser.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{currentUser.role}</p>
            </div>
          )}
        </div>
        <button 
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-md transition-colors",
            collapsed && 'justify-center'
          )}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, end, collapsed }: { to: string, icon: any, label: string, end?: boolean, collapsed?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        collapsed && 'justify-center px-2',
        isActive 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      )}
      title={label}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && label}
    </NavLink>
  );
}
