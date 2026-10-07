import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { getSystemDateStrings } from '../utils/dateUtils';
import { PWAInstallButton } from './PWAInstallButton';
import { SyncIndicator } from './SyncIndicator';
import {
  Sparkles,
  Search,
  RotateCcw,
  User as UserIcon,
  X,
  Phone,
  ArrowRight,
  Building2,
  ChevronDown,
  Filter,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    state,
    resetDatabase,
    clearDatabase,
    setActiveView,
    setSelectedPatientId,
    searchQuery,
    setSearchQuery,
    selectedClientId,
    setSelectedClientId,
  } = useCRM();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const { todayStr } = getSystemDateStrings();

  const lateTasksCount =
    state?.tasks.filter((t) => t.status === 'atrasada' || (t.date < todayStr && t.status !== 'concluida')).length ||
    0;

  const handleReset = async () => {
    if (confirm('Deseja limpar todos os dados fictícios para começar a usar o CRM com seus dados reais?')) {
      setIsResetting(true);
      await clearDatabase();
      setIsResetting(false);
    }
  };

  const selectedClient = state?.clients.find((c) => c.id === selectedClientId);
  const activeLeadsCount = selectedClient
    ? state?.patients.filter((p) => p.clientId === selectedClient.id && p.status === 'ativo').length || 0
    : 0;

  const filteredPatients = searchQuery.trim()
    ? state?.patients.filter((p) => {
        const matchesClient = selectedClientId === 'todos' || p.clientId === selectedClientId;
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone.includes(searchQuery) ||
          p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesClient && matchesSearch;
      }) || []
    : [];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Global Client Selector */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0 cursor-pointer" onClick={() => setActiveView('meu-dia')}>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#0F2042] truncate font-display">
                Roones CRM
              </h1>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                Camila Rocha · SDR Multiclínicas
              </p>
            </div>

            {/* Global Client Filter Selector */}
            <div className="relative flex items-center min-w-0">
              <div className="flex items-center gap-1.5 bg-slate-100/90 hover:bg-slate-200/80 transition-colors border border-slate-200/90 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs max-w-[140px] sm:max-w-[220px]">
                <Building2 className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">Cliente:</span>
                <div className="relative flex-1 min-w-0">
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-transparent text-slate-900 font-semibold text-xs focus:outline-none cursor-pointer pr-4 truncate appearance-none"
                    aria-label="Selecionar cliente"
                  >
                    <option value="todos">Todos ({state?.clients.length || 0})</option>
                    {state?.clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Persistent Clinic Context Indicator (Requirement 4) */}
            {selectedClient ? (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-blue-50/90 border border-blue-200/90 rounded-lg text-xs text-blue-950 animate-in fade-in duration-150">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Operando em: <strong className="font-semibold text-blue-950">{selectedClient.name}</strong></span>
                <span className="text-blue-300">·</span>
                <span className="text-blue-800 font-medium">{activeLeadsCount} leads ativos</span>
                <button
                  onClick={() => setSelectedClientId('todos')}
                  className="ml-1 text-slate-400 hover:text-slate-700 text-[11px] hover:underline"
                  title="Voltar para visão consolidada de todas as clínicas"
                >
                  (Ver todos)
                </button>
              </div>
            ) : (
              <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-100/80 border border-slate-200/70 rounded-lg text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Visão Consolidada: <strong className="font-semibold text-slate-800">{state?.clients.length || 0} Clínicas</strong></span>
                <span className="text-slate-300">·</span>
                <span>{state?.patients.length || 0} pacientes na carteira</span>
              </div>
            )}
          </div>

          {/* Search Trigger (Desktop & Mobile) */}
          <div className="flex-1 max-w-sm mx-2 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={
                  selectedClient
                    ? `Buscar em ${selectedClient.shortName}...`
                    : 'Buscar paciente, procedimento...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchModal(true)}
                className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-900/30 focus:border-blue-900 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Cloud Sync Status Indicator */}
            <SyncIndicator />

            {/* In-App PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Quick AI Trigger (Desktop only, on mobile it is in the bottom bar) */}
            <button
              onClick={() => setActiveView('chat')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2042] hover:bg-[#1A365D] text-white text-xs sm:text-sm font-medium rounded-lg shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Falar com a Iza</span>
            </button>

            {/* Reset / Clear Button */}
            <button
              onClick={handleReset}
              disabled={isResetting}
              title="Limpar dados fictícios para uso real"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Clinic Context Bar */}
      {selectedClient && (
        <div className="bg-[#0F2042] text-white text-[11px] px-3.5 py-1.5 flex items-center justify-between lg:hidden border-b border-blue-950">
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-blue-300 shrink-0" />
            <span className="truncate">
              Operando em: <strong className="font-semibold text-blue-100">{selectedClient.name}</strong> ({activeLeadsCount} leads)
            </span>
          </div>
          <button
            onClick={() => setSelectedClientId('todos')}
            className="text-blue-200 hover:text-white font-medium ml-2 text-[10px] shrink-0 underline"
          >
            Ver todas
          </button>
        </div>
      )}

      {/* Global Search Results Dropdown/Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-4 sm:pt-16 px-3 sm:px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input Bar inside Modal for Mobile & Quick Search */}
            <div className="p-3 border-b border-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder={selectedClient ? `Buscar em ${selectedClient.shortName}...` : 'Buscar paciente, telefone ou tag...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg"
              >
                Fechar
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {!searchQuery.trim() ? (
                <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                  <p className="font-medium text-slate-700">Digite para buscar pacientes da carteira</p>
                  <p className="text-slate-400">Pesquise por nome, telefone ou procedimento de interesse</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Nenhum paciente encontrado com "{searchQuery}".
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
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {pat.phone}
                        </span>
                        <span>·</span>
                        <span>{pat.clientName || pat.origin}</span>
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

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                {filteredPatients.length} resultado(s)
              </span>
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setActiveView('pacientes');
                }}
                className="text-xs text-blue-900 font-semibold hover:underline px-2 py-1"
              >
                Abrir diretório de pacientes →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
