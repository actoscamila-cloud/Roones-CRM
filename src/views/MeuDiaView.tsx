import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { getSystemDateStrings, formatDateBR } from '../utils/dateUtils';
import {
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Send,
  Mic,
  Plus,
  Flame,
  MessageCircle,
  Building2,
  Briefcase,
  Check,
} from 'lucide-react';

interface MeuDiaViewProps {
  onOpenNewTaskModal?: () => void;
  onOpenNewPatientModal?: () => void;
}

export const MeuDiaView: React.FC<MeuDiaViewProps> = ({ onOpenNewTaskModal, onOpenNewPatientModal }) => {
  const {
    state,
    completeTask,
    setActiveView,
    setSelectedPatientId,
    sendChatMessage,
    selectedClientId,
    setSelectedClientId,
  } = useCRM();
  const [quickInput, setQuickInput] = useState('');

  if (!state) return null;

  const { todayStr, tomorrowStr } = getSystemDateStrings();

  const selectedClient = state.clients.find((c) => c.id === selectedClientId);

  // Filter tasks and opps by selected client if active, always keeping internal SDR tasks visible
  const poolTasks = selectedClientId === 'todos'
    ? state.tasks
    : state.tasks.filter((t) => t.clientId === selectedClientId || (!t.clientId && t.category === 'interna'));

  const poolOpportunities = selectedClientId === 'todos'
    ? state.opportunities
    : state.opportunities.filter((o) => o.clientId === selectedClientId);

  const poolPatients = selectedClientId === 'todos'
    ? state.patients
    : state.patients.filter((p) => p.clientId === selectedClientId);

  // Metrics
  const todayTasks = poolTasks.filter((t) => t.date === todayStr && t.status !== 'concluida');
  const lateTasks = poolTasks.filter(
    (t) => t.status === 'atrasada' || (t.date < todayStr && t.status !== 'concluida')
  );
  const followUps = poolTasks.filter(
    (t) => t.category === 'follow-up' && t.status !== 'concluida'
  );
  const priorityOpportunities = poolOpportunities.filter(
    (o) => o.stage === 'proposta' || o.stage === 'aguardando_decisao'
  );

  // IA Daily Diagnostic Insights
  const oppsWithoutNextAction = poolOpportunities.filter(
    (o) => (!o.nextAction || o.nextAction.trim() === '') && o.stage !== 'fechado' && o.stage !== 'perdido'
  );
  const inactiveReactivation = poolPatients.filter((p) => p.status === 'inativo');

  // Breakdown by client for the "POR CLIENTE" section
  const clientBreakdown = state.clients.map((client) => {
    const cTasks = state.tasks.filter((t) => t.clientId === client.id && t.date === todayStr && t.status !== 'concluida');
    const cFollowUps = state.tasks.filter((t) => t.clientId === client.id && t.category === 'follow-up' && t.status !== 'concluida');
    const cLate = state.tasks.filter(
      (t) => t.clientId === client.id && (t.status === 'atrasada' || (t.date < todayStr && t.status !== 'concluida'))
    );
    const cOpps = state.opportunities.filter((o) => o.clientId === client.id && o.stage !== 'fechado' && o.stage !== 'perdido');
    return {
      client,
      todayCount: cTasks.length,
      followUpCount: cFollowUps.length,
      lateCount: cLate.length,
      oppCount: cOpps.length,
    };
  });

  const internalTasks = state.tasks.filter(
    (t) => (!t.clientId || t.category === 'interna') && t.date === todayStr && t.status !== 'concluida'
  );
  const internalLate = state.tasks.filter(
    (t) => (!t.clientId || t.category === 'interna') && (t.status === 'atrasada' || (t.date < todayStr && t.status !== 'concluida'))
  );

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    const text = quickInput;
    setQuickInput('');
    sendChatMessage(text);
    setActiveView('chat');
  };

  const handleOpenWhatsApp = (task: (typeof poolTasks)[0]) => {
    const patient = state.patients.find((p) => p.id === task.patientId);
    const phone = patient ? patient.phone.replace(/\D/g, '') : '';
    const firstName = patient ? patient.name.split(' ')[0] : 'Olá';
    const clinic = task.clientName || 'nossa clínica parceira';
    const message = encodeURIComponent(
      `Olá ${firstName}! Aqui é a Camila da ${clinic}. Entro em contato para dar seguimento ao seu procedimento. Como posso te auxiliar hoje?`
    );
    if (phone) {
      window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    } else {
      sendChatMessage(`Iza, gere uma mensagem de abordagem rápida para a tarefa: "${task.title}"`);
      setActiveView('chat');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Greeting and Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-blue-900 tracking-wide uppercase mb-1">
            Painel Operacional · Domingo, 04 de Outubro
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F2042] font-display">
            Bom dia, {state.currentUser.name.split(' ')[0]} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {selectedClient
              ? `Visualizando atividades comerciais de: ${selectedClient.name}`
              : `Panorama consolidado de todas as suas ${state.clients.length} clínicas e contas parceiras.`}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          {selectedClientId !== 'todos' && (
            <button
              onClick={() => setSelectedClientId('todos')}
              className="col-span-2 sm:col-span-1 px-3 py-2 bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs font-medium rounded-xl border border-blue-200 transition-colors text-center"
            >
              Ver Todas as Clínicas
            </button>
          )}
          <button
            onClick={() => setActiveView('chat')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#0F2042] hover:bg-[#1A365D] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Falar com a Iza</span>
          </button>
          {onOpenNewTaskModal && (
            <button
              onClick={onOpenNewTaskModal}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Tarefa</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero de Produtividade Unificado (Requirement 3: As 3 Respostas em 1 Clique) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* 1. O que está pegando fogo? */}
          <div className="p-5 flex flex-col justify-between space-y-3 bg-white">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  1. O que está pegando fogo?
                </span>
                {lateTasks.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    Ação imediata
                  </span>
                )}
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-slate-900 font-display">
                  {lateTasks.length}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {lateTasks.length === 0
                    ? 'Nenhuma pendência atrasada. Fluxo em dia!'
                    : `${lateTasks.length} tarefa(s) ou follow-ups perderam o prazo.`}
                </p>
              </div>
            </div>

            {lateTasks.length > 0 ? (
              <button
                onClick={() => {
                  sendChatMessage('Iza, como devo priorizar e resolver as tarefas atrasadas de hoje?');
                  setActiveView('chat');
                }}
                className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>Resolver pendências com a Iza</span>
              </button>
            ) : (
              <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sem atrasos pendentes</span>
              </div>
            )}
          </div>

          {/* 2. O que preciso bater hoje? */}
          <div className="p-5 flex flex-col justify-between space-y-3 bg-white">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0F2042]" />
                  2. O que preciso bater hoje?
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  Meta da rotina
                </span>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-slate-900 font-display flex items-baseline gap-2">
                  <span>{todayTasks.length}</span>
                  <span className="text-xs font-normal text-slate-400">tarefas</span>
                  <span className="text-slate-300">·</span>
                  <span>{followUps.length}</span>
                  <span className="text-xs font-normal text-slate-400">follow-ups</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {priorityOpportunities.length} oportunidades quentes aguardando fechamento.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveView('tarefas')}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Ver agenda do dia ({todayTasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* 3. Recomendação da Iza para agora */}
          <div className="p-5 flex flex-col justify-between space-y-3 bg-gradient-to-br from-slate-50/80 to-blue-50/50">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                  3. Recomendação da Iza
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Tempo real
                </span>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-800 leading-relaxed">
                  {lateTasks.length > 0
                    ? `Priorize os ${lateTasks.length} contatos atrasados antes do meio-dia para resgatar o interesse no tempo certo.`
                    : oppsWithoutNextAction.length > 0
                    ? `Existem ${oppsWithoutNextAction.length} oportunidades sem próxima ação. Defina retornos com Iza para não perder o funil.`
                    : `Ritmo excelente! Foque agora nas oportunidades em proposta para acelerar fechamentos da semana.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sendChatMessage('Iza, o que recomenda priorizar exatamente agora para maximizar conversão?');
                setActiveView('chat');
              }}
              className="w-full py-2 px-3 bg-[#0F2042] hover:bg-[#1A365D] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Executar orientação da Iza</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SEÇÃO OBRIGATÓRIA: POR CLIENTE (Requisito 5 do Briefing) */}
      {/* ======================================================== */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-900" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Atividades por Cliente
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Clique no card para filtrar a visão pelo cliente
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {clientBreakdown.map(({ client, todayCount, followUpCount, lateCount, oppCount }) => {
            const isSelected = selectedClientId === client.id;
            return (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(isSelected ? 'todos' : client.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-900 bg-blue-50/60 ring-2 ring-blue-900/20 shadow-xs'
                    : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/70 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {client.name}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-blue-900 shrink-0"></span>
                  )}
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tarefas hoje:</span>
                    <span className="font-semibold text-slate-900">{todayCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Follow-ups:</span>
                    <span className="font-semibold text-indigo-700">{followUpCount}</span>
                  </div>
                  {lateCount > 0 && (
                    <div className="flex items-center justify-between text-rose-600 font-medium">
                      <span>Atrasadas:</span>
                      <span>{lateCount}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{client.doctorOrOwner}</span>
                  <span className="text-blue-900 font-medium hover:underline">
                    {isSelected ? 'Limpar filtro' : 'Filtrar'}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Minhas Tarefas Internas */}
          <button
            onClick={() => setSelectedClientId('todos')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedClientId === 'todos'
                ? 'border-slate-300 bg-slate-50/80 hover:bg-slate-100/80'
                : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                Minhas Tarefas Internas
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tarefas hoje:</span>
                <span className="font-semibold text-slate-900">{internalTasks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Categoria:</span>
                <span className="font-medium text-slate-600">Interna / Geral</span>
              </div>
              {internalLate.length > 0 && (
                <div className="flex items-center justify-between text-rose-600 font-medium">
                  <span>Atrasadas:</span>
                  <span>{internalLate.length}</span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Sem cliente vinculado</span>
              <span className="text-slate-600 font-medium">Geral</span>
            </div>
          </button>
        </div>
      </div>

      {/* Proactive Alert: Opportunities without next action */}
      {oppsWithoutNextAction.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-bold">
                {oppsWithoutNextAction.length} oportunidades estão sem próxima ação definida
              </div>
              <div className="text-[11px] text-amber-700 mt-0.5">
                Oportunidades em aberto sem acompanhamento agendado correm risco de esfriar.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sendChatMessage('Quais oportunidades estão sem próxima ação?');
              setActiveView('chat');
            }}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors self-start sm:self-auto shadow-xs"
          >
            Organizar com a Iza
          </button>
        </div>
      )}

      {/* IA Commercial Diagnostic Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0F2042] to-[#1E3A8A] text-white shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-200">
              Diagnóstico da Iza para Hoje
            </span>
          </div>
          <span className="text-[11px] text-blue-200">Atualizado em tempo real</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-2">
          {/* Item 1 */}
          <button
            onClick={() => setActiveView('pipeline')}
            className="text-left p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
          >
            <div className="text-base font-bold font-display">{oppsWithoutNextAction.length}</div>
            <div className="text-xs text-blue-100 mt-0.5">Oportunidades sem próxima ação</div>
          </button>

          {/* Item 2 */}
          <button
            onClick={() => setActiveView('follow-ups')}
            className="text-left p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
          >
            <div className="text-base font-bold font-display">{lateTasks.length}</div>
            <div className="text-xs text-blue-100 mt-0.5">Follow-ups em atraso</div>
          </button>

          {/* Item 3 */}
          <button
            onClick={() => setActiveView('pipeline')}
            className="text-left p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
          >
            <div className="text-base font-bold font-display">{poolOpportunities.length}</div>
            <div className="text-xs text-blue-100 mt-0.5">Interessadas em procedimentos</div>
          </button>

          {/* Item 4 */}
          <button
            onClick={() => setActiveView('reativacao')}
            className="text-left p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
          >
            <div className="text-base font-bold font-display">{inactiveReactivation.length}</div>
            <div className="text-xs text-blue-100 mt-0.5">Pacientes para reativação (+120d)</div>
          </button>
        </div>
      </div>

      {/* Conversational Quick Input Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#0F2042]">
          <Sparkles className="w-3.5 h-3.5 text-blue-800" />
          <span>Como a Iza pode te ajudar agora?</span>
          <span className="text-slate-400 font-normal">
            (Ex: "Cadastre a Ana 11999999999", "Quem chamar hoje?", "Agendar retorno para segunda")
          </span>
        </div>

        <form onSubmit={handleQuickSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Digite ou envie instrução para a Iza operar o CRM..."
            className="flex-1 py-2.5 pl-4 pr-12 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:bg-white focus:border-blue-900 transition-all text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="px-4 py-2.5 bg-[#0F2042] hover:bg-[#1A365D] disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enviar para a Iza</span>
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs text-slate-600">
          <span className="text-slate-400 text-[11px] shrink-0">Atalhos rápidos:</span>
          <button
            type="button"
            onClick={() => {
              sendChatMessage('Quem eu preciso chamar hoje?');
              setActiveView('chat');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs shrink-0 transition-colors"
          >
            Quem chamar hoje?
          </button>
          <button
            type="button"
            onClick={() => {
              sendChatMessage('Quais oportunidades estão sem próxima ação agendada?');
              setActiveView('chat');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs shrink-0 transition-colors"
          >
            Oportunidades sem retorno
          </button>
          <button
            type="button"
            onClick={() => {
              sendChatMessage('Quais são as prioridades comerciais de hoje?');
              setActiveView('chat');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs shrink-0 transition-colors"
          >
            Prioridades do dia
          </button>
          <button
            type="button"
            onClick={() => {
              sendChatMessage('Criar uma tarefa interna para conferir os contatos e orçamentos hoje.');
              setActiveView('chat');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs shrink-0 transition-colors"
          >
            Criar tarefa para hoje
          </button>
        </div>
      </div>

      {/* Two Column Grid: Prioridades & Atrasados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Prioridades do Dia */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Prioridades Comerciais do Dia
                </h3>
              </div>
              <button
                onClick={() => setActiveView('tarefas')}
                className="text-xs text-blue-900 font-medium hover:underline flex items-center gap-1"
              >
                Ver todas ({todayTasks.length})
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Parabéns! Todas as tarefas programadas para hoje foram concluídas.
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-slate-200/70 bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {task.title}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-600 font-medium">
                          {task.clientName || 'Interna'}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2 flex-wrap">
                        {task.time && <span>Horário: {task.time}</span>}
                        {task.time && <span>·</span>}
                        <span>{task.category}</span>
                        {task.patientId && (
                          <>
                            <span>·</span>
                            <button
                              onClick={() => {
                                setSelectedPatientId(task.patientId!);
                                setActiveView('pacientes');
                              }}
                              className="text-blue-900 hover:underline font-medium"
                            >
                              Ver ficha
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 sm:border-0 sm:pt-0 sm:shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => handleOpenWhatsApp(task)}
                        className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                        title="Chamar paciente no WhatsApp com texto da Iza"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => completeTask(task.id)}
                        className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                        title="Concluir tarefa"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Concluir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Atrasados (Urgent Action Required) */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-rose-950 font-display">
                  Atrasadas & Sem Acompanhamento
                </h3>
              </div>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                {lateTasks.length} pendência(s)
              </span>
            </div>

            {lateTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhuma tarefa em atraso no momento. Operação 100% em dia!
              </div>
            ) : (
              <div className="space-y-3">
                {lateTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-rose-200/80 bg-rose-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {task.title}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-600 font-medium">
                          {task.clientName || 'Interna'}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-rose-600 font-semibold">
                          Prazo: {task.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {task.description || 'Follow-up sem retorno recente'}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-rose-700 font-medium mt-2 flex-wrap">
                        {task.patientId && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedPatientId(task.patientId!);
                                setActiveView('pacientes');
                              }}
                              className="hover:underline text-rose-800 font-semibold"
                            >
                              Abrir paciente
                            </button>
                            <span>·</span>
                          </>
                        )}
                        <span>{task.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-rose-200/50 sm:border-0 sm:pt-0 sm:shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => handleOpenWhatsApp(task)}
                        className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        title="Acionar paciente com mensagem da Iza"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => completeTask(task.id)}
                        className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Concluir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick reassurance notice */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Regra SDR: Nenhuma oportunidade sem próxima ação.</span>
            <button
              onClick={() => setActiveView('pipeline')}
              className="text-blue-900 font-semibold hover:underline"
            >
              Auditar Pipeline →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Shortcuts Footer */}
      <div className="bg-slate-100/70 p-4 rounded-xl border border-slate-200/60 flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs font-medium text-slate-600">
          Atalhos complementares da rotina:
        </span>
        <div className="flex items-center gap-2 flex-wrap text-xs font-medium">
          <button
            onClick={() => setActiveView('pacientes')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Buscar Paciente
          </button>
          <button
            onClick={() => setActiveView('follow-ups')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Ver Follow-ups
          </button>
          <button
            onClick={() => setActiveView('pipeline')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Ver Pipeline Kanban
          </button>
          <button
            onClick={() => setActiveView('reativacao')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Reativação Inteligente
          </button>
        </div>
      </div>
    </div>
  );
};
