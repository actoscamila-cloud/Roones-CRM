import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  Sparkles,
  Search,
  RotateCcw,
  User as UserIcon,
  X,
  Phone,
  ArrowRight,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { state, resetDatabase, setActiveView, setSelectedPatientId, searchQuery, setSearchQuery } = useCRM();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const lateTasksCount = state?.tasks.filter((t) => t.status === 'atrasada' || (t.date < '2026-10-04' && t.status === 'pendente')).length || 0;

  const handleReset = async () => {
    if (confirm('Deseja restaurar os dados de demonstração da clínica para o estado original?')) {
      setIsResetting(true);
      await resetDatabase();
      setIsResetting(false);
    }
  };

  const filteredPatients = searchQuery.trim()
    ? state?.patients.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ) || []
    : [];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Clinic Branding */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#0F2042] truncate font-display">
                  Roones CRM
                </h1>
                <span className="hidden md:inline-flex items-center text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-slate-600 truncate max-w-[140px]">
                  {state?.clinic?.name || 'Estética Avançada'}
                </span>
              </div>
              <p className="text-xs text-slate-600 truncate hidden sm:block">
                CRM inteligente com assistente 24h
              </p>
            </div>
          </div>

          {/* Search Trigger (Desktop & Mobile) */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar paciente, procedimento, histórico..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchModal(true)}
                className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-900/30 focus:border-blue-900 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Quick AI Trigger */}
            <button
              onClick={() => setActiveView('chat')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2042] hover:bg-[#1A365D] text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span className="hidden sm:inline">Falar com a Iza</span>
              <span className="sm:hidden">Iza</span>
            </button>

            {/* Reset Demo State Button */}
            <button
              onClick={handleReset}
              disabled={isResetting}
              title="Restaurar dados de demonstração"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Global Search Results Dropdown/Modal */}
      {showSearchModal && searchQuery && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Search className="w-4 h-4 text-slate-400" />
                Resultados para "{searchQuery}"
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Nenhum paciente encontrado com esse termo. Tente buscar por nome, telefone ou procedimento.
                </div>
              ) : (
                filteredPatients.map((pat) => (
                  <button
                    key={pat.id}
                    onClick={() => {
                      setSelectedPatientId(pat.id);
                      setShowSearchModal(false);
                      setActiveView('pacientes');
                    }}
                    className="w-full p-3 text-left hover:bg-slate-50 flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-900">
                        {pat.name}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {pat.phone}
                        </span>
                        <span>·</span>
                        <span>{pat.origin}</span>
                        {pat.nextAction && (
                          <>
                            <span>·</span>
                            <span className="text-blue-700 font-medium truncate max-w-xs">
                              Próx: {pat.nextAction}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </button>
                ))
              )}
            </div>

            <div className="p-2 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setActiveView('pacientes');
                }}
                className="text-xs text-blue-900 font-medium hover:underline px-2 py-1"
              >
                Ver todos os pacientes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
