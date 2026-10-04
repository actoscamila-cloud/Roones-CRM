import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
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
} from 'lucide-react';

interface MeuDiaViewProps {
  onOpenNewTaskModal?: () => void;
  onOpenNewPatientModal?: () => void;
}

export const MeuDiaView: React.FC<MeuDiaViewProps> = ({ onOpenNewTaskModal, onOpenNewPatientModal }) => {
  const { state, completeTask, setActiveView, setSelectedPatientId, sendChatMessage } = useCRM();
  const [quickInput, setQuickInput] = useState('');

  if (!state) return null;

  const todayStr = '2026-10-04';

  // Metrics
  const todayTasks = state.tasks.filter((t) => t.date === todayStr && t.status !== 'concluida');
  const lateTasks = state.tasks.filter(
    (t) => t.status === 'atrasada' || (t.date < todayStr && t.status !== 'concluida')
  );
  const followUps = state.tasks.filter(
    (t) => t.category === 'follow-up' && t.status !== 'concluida'
  );
  const priorityOpportunities = state.opportunities.filter(
    (o) => o.stage === 'proposta' || o.stage === 'aguardando_decisao'
  );

  // IA Daily Diagnostic Insights
  const oppsWithoutNextAction = state.opportunities.filter((o) => !o.nextAction && o.stage !== 'fechado' && o.stage !== 'perdido');
  const hotLeads = state.patients.filter((p) => p.status === 'lead' || p.tags.includes('Lead Novo'));
  const inactiveReactivation = state.patients.filter((p) => p.status === 'inativo');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    const text = quickInput;
    setQuickInput('');
    sendChatMessage(text);
    setActiveView('chat');
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
            Aqui está o panorama da sua rotina comercial hoje na {state.clinic.name}.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveView('chat')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F2042] hover:bg-[#1A365D] text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Falar com a Iza</span>
          </button>
          {onOpenNewTaskModal && (
            <button
              onClick={onOpenNewTaskModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Tarefa</span>
            </button>
          )}
        </div>
      </div>

      {/* Main KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Tarefas Hoje */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tarefas de Hoje</span>
            <Calendar className="w-4 h-4 text-blue-800" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-display">
            {todayTasks.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {todayTasks.filter((t) => t.priority === 'alta' || t.priority === 'urgente').length} de alta prioridade
          </div>
        </div>

        {/* Follow-ups */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Follow-ups Pendentes</span>
            <Clock className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-display">
            {followUps.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Cadência de retorno ativa
          </div>
        </div>

        {/* Oportunidades Prioritárias */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Oportunidades Quentes</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-display">
            {priorityOpportunities.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Em proposta ou decisão
          </div>
        </div>

        {/* Atrasados */}
        <div
          onClick={() => setActiveView('tarefas')}
          className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs hover:border-rose-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-rose-700 text-xs font-medium">
            <span>Tarefas Atrasadas</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2 font-display">
            {lateTasks.length}
          </div>
          <div className="text-[11px] text-rose-600 mt-1 font-medium">
            Exigem ação imediata
          </div>
        </div>
      </div>

      {/* IA Commercial Diagnostic Card (Requirement 51) */}
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
            <div className="text-base font-bold font-display">{state.opportunities.length}</div>
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

      {/* Conversational Quick Input Bar (Requirement 2 & 30) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#0F2042]">
          <Sparkles className="w-3.5 h-3.5 text-blue-800" />
          <span>Como a Iza pode te ajudar agora?</span>
          <span className="text-slate-400 font-normal">
            (Ex: "Falei com a Juliana", "Quem chamar hoje?", "Cadastre lead")
          </span>
        </div>

        <form onSubmit={handleQuickSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Digite ou mande áudio com o que aconteceu no atendimento..."
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
              sendChatMessage('Falei agora com a Juliana. Ela veio fazer Botox, gostou bastante do resultado e a Dra. comentou sobre preenchimento de olheira. Ela não quis fazer agora, mas falou que talvez faça no mês que vem. Preciso lembrar de chamar depois do dia 10.');
              setActiveView('chat');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs shrink-0 transition-colors"
          >
            Registrar caso Juliana (Botox/Olheiras)
          </button>
          <button
            type="button"
            onClick={() => {
              sendChatMessage('Acabei de falar com a Fernanda. Ela fez Botox no mês passado e gostou muito. Hoje disse que quer fazer Sculptra. Retornar amanhã com as condições.');
              setActiveView('chat');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs shrink-0 transition-colors"
          >
            Registrar caso Fernanda (Sculptra)
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
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {task.title}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
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

                    <button
                      onClick={() => completeTask(task.id)}
                      className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                      title="Concluir tarefa"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Concluir</span>
                    </button>
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
                    className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {task.title}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {task.description || 'Follow-up sem retorno recente'}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-rose-600 font-medium mt-2">
                        <span>Previsto para: {task.date}</span>
                        {task.patientId && (
                          <>
                            <span>·</span>
                            <button
                              onClick={() => {
                                setSelectedPatientId(task.patientId!);
                                setActiveView('pacientes');
                              }}
                              className="hover:underline text-rose-800"
                            >
                              Abrir paciente
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => completeTask(task.id)}
                      className="px-2.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Concluir</span>
                    </button>
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
