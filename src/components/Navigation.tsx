import React from 'react';
import { useCRM, ActiveView } from '../context/CRMContext';
import {
  Calendar,
  Sparkles,
  Users,
  Kanban,
  CheckSquare,
  Clock,
  RefreshCw,
  Settings,
} from 'lucide-react';

interface NavItem {
  id: ActiveView;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Navigation: React.FC = () => {
  const { activeView, setActiveView, state } = useCRM();

  // Calculate late tasks count for badge
  const lateCount =
    state?.tasks.filter((t) => t.status === 'atrasada' || (t.date < '2026-10-04' && t.status === 'pendente'))
      .length || 0;

  const todayTasksCount =
    state?.tasks.filter((t) => t.date === '2026-10-04' && t.status !== 'concluida').length || 0;

  const navItems: NavItem[] = [
    {
      id: 'meu-dia',
      label: 'Meu Dia',
      mobileLabel: 'Meu Dia',
      icon: Calendar,
      badge: lateCount > 0 ? lateCount : undefined,
    },
    {
      id: 'chat',
      label: 'Chat com a Iza (Assistente)',
      mobileLabel: 'Iza 24h',
      icon: Sparkles,
    },
    {
      id: 'pacientes',
      label: 'Pacientes',
      mobileLabel: 'Pacientes',
      icon: Users,
    },
    {
      id: 'pipeline',
      label: 'Pipeline Comercial',
      mobileLabel: 'Pipeline',
      icon: Kanban,
    },
    {
      id: 'tarefas',
      label: 'Tarefas & Lembretes',
      mobileLabel: 'Tarefas',
      icon: CheckSquare,
      badge: todayTasksCount > 0 ? todayTasksCount : undefined,
    },
    {
      id: 'follow-ups',
      label: 'Central Follow-ups',
      mobileLabel: 'Follow-ups',
      icon: Clock,
    },
    {
      id: 'reativacao',
      label: 'Reativação (120d+)',
      mobileLabel: 'Reativar',
      icon: RefreshCw,
    },
    {
      id: 'config',
      label: 'Configurações',
      mobileLabel: 'Ajustes',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 bg-white p-4 shrink-0 justify-between min-h-[calc(100vh-61px)]">
        <div className="space-y-6">
          {/* Section: Navegação Principal */}
          <div>
            <div className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-2">
              Menu Comercial
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#0F2042] text-white shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-blue-200' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-blue-400 text-[#0F2042]'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Clinic Info Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="text-xs font-semibold text-slate-800">
              {state?.clinic.name || 'Clínica Lumina'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {state?.clinic.phone} · Drª Sofia Mendes
            </div>
            <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Assistente Iza 24h Ativa
            </div>
          </div>
        </div>

        {/* Bottom helper */}
        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          <p>Roones CRM v1.0</p>
          <p className="text-[10px] text-slate-400">Operação ágil para SDRs</p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg relative min-w-[56px] min-h-[44px] transition-colors ${
                isActive ? 'text-[#0F2042] font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#0F2042] stroke-[2.2]' : 'text-slate-400'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.mobileLabel}</span>
            </button>
          );
        })}

        {/* More Menu Trigger */}
        <button
          onClick={() => {
            if (activeView === 'follow-ups') setActiveView('reativacao');
            else if (activeView === 'reativacao') setActiveView('config');
            else setActiveView('follow-ups');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg min-w-[56px] min-h-[44px] ${
            ['follow-ups', 'reativacao', 'config'].includes(activeView)
              ? 'text-[#0F2042] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-5 h-5 text-slate-400" />
          <span className="text-[10px] tracking-tight mt-0.5">Mais</span>
        </button>
      </nav>
    </>
  );
};
