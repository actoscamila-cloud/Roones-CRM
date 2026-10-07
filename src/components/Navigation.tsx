import React, { useState } from 'react';
import { useCRM, ActiveView } from '../context/CRMContext';
import { getSystemDateStrings } from '../utils/dateUtils';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Calendar,
  Sparkles,
  Users,
  Kanban,
  CheckSquare,
  Clock,
  RefreshCw,
  Building2,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  id: ActiveView;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description?: string;
}

interface NavSection {
  title: string;
  subtitle: string;
  items: NavItem[];
}

export const Navigation: React.FC = () => {
  const { activeView, setActiveView, state, selectedClientId } = useCRM();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { todayStr } = getSystemDateStrings();

  // Calculate late tasks count for badge
  const lateCount =
    state?.tasks.filter((t) => t.status === 'atrasada' || (t.date < todayStr && t.status !== 'concluida'))
      .length || 0;

  const todayTasksCount =
    state?.tasks.filter((t) => t.date === todayStr && t.status !== 'concluida').length || 0;

  const activeClient = state?.clients.find((c) => c.id === selectedClientId);

  // 3 Didactic Sections (Requirement 1)
  const navSections: NavSection[] = [
    {
      title: 'Rotina & Inteligência',
      subtitle: 'Foco imediato e copiloto',
      items: [
        {
          id: 'meu-dia',
          label: 'Meu Dia',
          mobileLabel: 'Meu Dia',
          icon: Calendar,
          badge: lateCount > 0 ? lateCount : undefined,
          description: 'Cockpit e prioridades',
        },
        {
          id: 'chat',
          label: 'Chat com Iza',
          mobileLabel: 'Iza IA',
          icon: Sparkles,
          description: 'Copiloto comercial 24h',
        },
      ],
    },
    {
      title: 'Operação Ativa',
      subtitle: 'Trabalho de carteira e funil',
      items: [
        {
          id: 'clientes',
          label: 'Clientes',
          mobileLabel: 'Clientes',
          icon: Building2,
          description: 'Clínicas parceiras',
        },
        {
          id: 'pacientes',
          label: 'Pacientes',
          mobileLabel: 'Pacientes',
          icon: Users,
          description: 'Base de leads e contatos',
        },
        {
          id: 'pipeline',
          label: 'Pipeline',
          mobileLabel: 'Pipeline',
          icon: Kanban,
          description: 'Funil e negociações',
        },
        {
          id: 'tarefas',
          label: 'Tarefas & Lembretes',
          mobileLabel: 'Tarefas',
          icon: CheckSquare,
          badge: todayTasksCount > 0 ? todayTasksCount : undefined,
          description: 'Agenda do operador',
        },
        {
          id: 'follow-ups',
          label: 'Central de Follow-ups',
          mobileLabel: 'Follow-ups',
          icon: Clock,
          description: 'Cadência de retorno',
        },
      ],
    },
    {
      title: 'Inteligência de Vendas',
      subtitle: 'Resultados e governança',
      items: [
        {
          id: 'reativacao',
          label: 'Reativação',
          mobileLabel: 'Reativação',
          icon: RefreshCw,
          description: 'Resgate de inativos (+90d)',
        },
        {
          id: 'relatorios',
          label: 'Relatórios',
          mobileLabel: 'Relatórios',
          icon: BarChart3,
          description: 'Métricas de conversão',
        },
        {
          id: 'config',
          label: 'Minha Conta & IA',
          mobileLabel: 'Minha Conta',
          icon: Settings,
          description: 'Perfil e auditoria da IA',
        },
      ],
    },
  ];

  return (
    <>
      {/* Desktop Sidebar with 3 Didactic Groups */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 bg-white p-4 shrink-0 justify-between min-h-[calc(100vh-61px)]">
        <div className="space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <div className="px-3 mb-1.5 flex items-baseline justify-between">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  {section.title}
                </span>
              </div>

              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#0F2042] text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-blue-300' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            isActive
                              ? 'bg-rose-500 text-white'
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
          ))}

          {/* Quick Client & Account Info Box */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">
              Operação SDR
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1 truncate">
              {activeClient ? activeClient.name : 'Todas as Clínicas (Visão Geral)'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>{state?.clients.length || 0} clínicas ativas</span>
              <span>·</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Iza 24h
              </span>
            </div>
          </div>
        </div>

        {/* PWA Install in Desktop Sidebar */}
        <div className="pt-2">
          <PWAInstallButton variant="sidebar" />
        </div>

        {/* Bottom helper */}
        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Roones CRM</span>
          <span className="text-[10px] text-slate-400">Camila Rocha</span>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg">
        {/* Meu Dia */}
        <button
          onClick={() => setActiveView('meu-dia')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg relative min-w-[54px] min-h-[44px] transition-colors ${
            activeView === 'meu-dia' ? 'text-[#0F2042] font-semibold' : 'text-slate-500'
          }`}
        >
          <div className="relative">
            <Calendar className={`w-5 h-5 ${activeView === 'meu-dia' ? 'text-[#0F2042] stroke-[2.2]' : 'text-slate-400'}`} />
            {lateCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {lateCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Meu Dia</span>
        </button>

        {/* Chat Iza */}
        <button
          onClick={() => setActiveView('chat')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg relative min-w-[54px] min-h-[44px] transition-colors ${
            activeView === 'chat' ? 'text-[#0F2042] font-semibold' : 'text-slate-500'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${activeView === 'chat' ? 'text-[#0F2042] stroke-[2.2]' : 'text-slate-400'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Iza IA</span>
        </button>

        {/* Clientes */}
        <button
          onClick={() => setActiveView('clientes')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg relative min-w-[54px] min-h-[44px] transition-colors ${
            activeView === 'clientes' ? 'text-[#0F2042] font-semibold' : 'text-slate-500'
          }`}
        >
          <Building2 className={`w-5 h-5 ${activeView === 'clientes' ? 'text-[#0F2042] stroke-[2.2]' : 'text-slate-400'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Clientes</span>
        </button>

        {/* Pipeline */}
        <button
          onClick={() => setActiveView('pipeline')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg relative min-w-[54px] min-h-[44px] transition-colors ${
            activeView === 'pipeline' ? 'text-[#0F2042] font-semibold' : 'text-slate-500'
          }`}
        >
          <Kanban className={`w-5 h-5 ${activeView === 'pipeline' ? 'text-[#0F2042] stroke-[2.2]' : 'text-slate-400'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Pipeline</span>
        </button>

        {/* All Views Menu Sheet Trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg relative min-w-[54px] min-h-[44px] transition-colors ${
            ['pacientes', 'tarefas', 'follow-ups', 'reativacao', 'relatorios', 'config'].includes(activeView)
              ? 'text-[#0F2042] font-semibold'
              : 'text-slate-500'
          }`}
        >
          <Menu className="w-5 h-5 text-slate-400" />
          <span className="text-[10px] tracking-tight mt-0.5">Menu</span>
        </button>
      </nav>

      {/* Mobile Drawer/Modal for Full Didactic Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-150">
          <div className="bg-white rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#0F2042] font-display">
                  Navegação Didática do CRM
                </h3>
                <p className="text-[11px] text-slate-500">Todas as áreas operacionais de Camila</p>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {navSections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-1.5">
                  <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {section.title}
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveView(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                            isActive
                              ? 'bg-[#0F2042] text-white font-semibold'
                              : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-200' : 'text-slate-500'}`} />
                            <div className="text-left">
                              <div className="font-medium">{item.label}</div>
                              {item.description && (
                                <div className={`text-[10px] ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${isActive ? 'text-blue-200' : 'text-slate-300'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* In-App PWA Install Option in Mobile Drawer */}
            <div className="pt-2 border-t border-slate-100">
              <PWAInstallButton variant="menu-item" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
