import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  LogOut,
  BrainCircuit,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  School,
  Compass,
  Briefcase
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = React.useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const [showLearningModal, setShowLearningModal] = useState(false);
  const [showBmwModal, setShowBmwModal] = useState(false);

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

  const handleLearningClick = () => {
    if (currentUser.has_learning_style) {
      setShowLearningModal(true);
    } else {
      navigate('/questionnaire');
    }
  };

  const handleBmwClick = () => {
    // Note: Pastikan has_bmw_mapping ada di tipe AuthUser
    if ((currentUser as any).has_bmw_mapping) {
      setShowBmwModal(true);
    } else {
      navigate('/bmw-mapping');
    }
  };

  return (
    <>
      <div
        className={cn(
          'flex flex-col h-full bg-slate-900 text-white border-r border-slate-800 transition-all duration-300 overflow-hidden relative z-40',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <div
          className={cn(
            'p-6 flex items-center',
            collapsed ? 'flex-col justify-center gap-3' : 'justify-between gap-3'
          )}
        >
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
              'p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors',
              collapsed && 'self-center mt-1'
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <div
          className={cn(
            'flex flex-col flex-1 gap-1 overflow-y-auto',
            collapsed ? 'px-2' : 'px-3'
          )}
        >
          {!collapsed && (
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {currentUser.role === 'guru' ? 'Instructor' : 'Student'}
            </div>
          )}

          {/* ===================== SISWA ===================== */}

          {currentUser.role === 'siswa' && (
            <>
              <NavItem to="/student" icon={LayoutDashboard} label="Dashboard" end collapsed={collapsed} />
              <NavItem to="/student/evaluations" icon={FileQuestion} label="Evaluations" collapsed={collapsed} />

              {!collapsed && (
                <div className="px-3 py-2 mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Asesmen Diri
                </div>
              )}

              <SidebarActionItem
                icon={Compass}
                label="Gaya Belajar"
                collapsed={collapsed}
                onClick={handleLearningClick}
                isCompleted={currentUser.has_learning_style}
              />
              <SidebarActionItem
                icon={Briefcase}
                label="Pemetaan BMW"
                collapsed={collapsed}
                onClick={handleBmwClick}
                isCompleted={(currentUser as any).has_bmw_mapping}
              />
            
            </>
          )}

          {/* ===================== GURU ===================== */}

          {currentUser.role === 'guru' && (
            <>
              <NavItem to="/teacher" icon={LayoutDashboard} label="Dashboard" end collapsed={collapsed} />
              <NavItem to="/teacher/students" icon={Users} label="Manajemen Siswa" collapsed={collapsed} />
              <NavItem to="/teacher/classes" icon={School} label="Manajemen Kelas" collapsed={collapsed} />
              <NavItem to="/teacher/modules" icon={BookOpen} label="Kelola Materi" collapsed={collapsed} />

              {!collapsed && (
                <div className="px-3 py-2 mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Evaluasi
                </div>
              )}

              <NavItem to="/teacher/evaluations" icon={FileQuestion} label="Kelola Evaluasi" collapsed={collapsed} />
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div
            className={cn(
              'flex items-center mb-2',
              collapsed
                ? 'justify-center px-0 gap-0'
                : 'gap-3 px-3 py-2'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
              {currentUser.name.charAt(0)}
            </div>

            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">
                  {currentUser.name}
                </p>

                <p className="text-xs text-slate-400 capitalize truncate">
                  {currentUser.role}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-md transition-colors',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </div>

      {/* MODAL HASIL GAYA BELAJAR */}
      {showLearningModal && currentUser.learning_style && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Gaya Belajar</h3>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
              <span className="text-xs uppercase tracking-wider text-indigo-500 font-bold">Kecenderungan</span>
              <h4 className="text-2xl font-extrabold text-indigo-700 uppercase mt-1">
                {currentUser.learning_style.result}
              </h4>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                <span>Visual</span>
                <span className="font-bold">{currentUser.learning_style.visual_percentage}%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                <span>Auditori</span>
                <span className="font-bold">{currentUser.learning_style.auditory_percentage}%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                <span>Kinestetik</span>
                <span className="font-bold">{currentUser.learning_style.kinesthetic_percentage}%</span>
              </div>
            </div>

            <button
              onClick={() => setShowLearningModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL HASIL PEMETAAN BMW */}
      {showBmwModal && (currentUser as any).bmw_mapping && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Pemetaan BMW</h3>
            </div>

            {(() => {
              const bmw = (currentUser as any).bmw_mapping;
              // Konversi ke persentase (Skor / 15 * 100) dan amankan dari nilai kosong
              const bPct = Math.round(((bmw.bekerja_score || 0) / 15) * 100);
              const mPct = Math.round(((bmw.melanjutkan_score || 0) / 15) * 100);
              const wPct = Math.round(((bmw.wirausaha_score || 0) / 15) * 100);

              return (
                <>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                    <span className="text-xs uppercase tracking-wider text-emerald-600 font-bold">Jalur Karier</span>
                    <h4 className="text-2xl font-extrabold text-emerald-700 mt-1">
                      {bmw.dominant_result || 'Belum Ditentukan'}
                    </h4>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                      <span>Persentase Bekerja</span>
                      <span className="font-bold">{bPct}%</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                      <span>Persentase Melanjutkan</span>
                      <span className="font-bold">{mPct}%</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                      <span>Persentase Wirausaha</span>
                      <span className="font-bold">{wPct}%</span>
                    </div>
                  </div>
                </>
              );
            })()}

            <button
              onClick={() => setShowBmwModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── KOMPONEN PENDUKUNG NAVIGASI ──

function NavItem({
  to,
  icon: Icon,
  label,
  end,
  collapsed,
}: {
  to: string;
  icon: any;
  label: string;
  end?: boolean;
  collapsed?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
          collapsed && 'justify-center px-2',
          isActive
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        )
      }
      title={collapsed ? label : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

function SidebarActionItem({
  icon: Icon,
  label,
  collapsed,
  onClick,
  isCompleted
}: {
  icon: any;
  label: string;
  collapsed?: boolean;
  onClick: () => void;
  isCompleted: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group text-slate-400 hover:text-white hover:bg-slate-800',
        collapsed ? 'justify-center px-2' : 'justify-between'
      )}
      title={collapsed ? label : undefined}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </div>

      {!collapsed && (
        <span className={cn(
          "shrink-0 w-2 h-2 rounded-full",
          isCompleted ? "bg-emerald-500" : "bg-amber-500"
        )} />
      )}
    </button>
  );
}