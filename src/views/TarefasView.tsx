import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Task, TaskPriority, TaskCategory } from '../types/crm';
import { getSystemDateStrings, formatDateBR } from '../utils/dateUtils';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Plus,
  Filter,
  User,
  Sparkles,
} from 'lucide-react';

interface TarefasViewProps {
  onOpenNewTaskModal?: () => void;
}

export const TarefasView: React.FC<TarefasViewProps> = ({ onOpenNewTaskModal }) => {
  const { state, completeTask, setSelectedPatientId, setActiveView, selectedClientId, sendChatMessage } = useCRM();
  const [tabFilter, setTabFilter] = useState<'hoje' | 'amanha' | 'proximas' | 'todas' | 'atrasadas' | 'concluidas'>('hoje');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [priorityFilter, setPriorityFilter] = useState<string>('todas');

  if (!state) return null;

  const { todayStr, tomorrowStr } = getSystemDateStrings();

  const selectedClient = state.clients.find((c) => c.id === selectedClientId);

  const filteredTasks = state.tasks.filter((t) => {
    // 0. Client filter: se 'todos', exibe todas. Se clínica selecionada, exibe da clínica OU tarefas internas gerais da SDR
    const matchesClient =
      selectedClientId === 'todos' ||
      t.clientId === selectedClientId ||
      (selectedClient && t.clientName && (
        t.clientName.toLowerCase().includes(selectedClient.shortName.toLowerCase()) ||
        selectedClient.name.toLowerCase().includes(t.clientName.toLowerCase()) ||
        t.clientName.toLowerCase().includes(selectedClient.name.toLowerCase())
      )) ||
      (!t.clientId && !t.clientName && (t.category === 'interna' || categoryFilter === 'interna'));

    // 1. Tab date/status filtering
    let matchesTab = true;
    if (tabFilter === 'hoje') {
      matchesTab = t.date === todayStr && t.status !== 'concluida';
    } else if (tabFilter === 'amanha') {
      matchesTab = t.date === tomorrowStr && t.status !== 'concluida';
    } else if (tabFilter === 'proximas') {
      matchesTab = t.date > tomorrowStr && t.status !== 'concluida';
    } else if (tabFilter === 'todas') {
      matchesTab = t.status !== 'concluida';
    } else if (tabFilter === 'atrasadas') {
      matchesTab = t.status === 'atrasada' || (t.date < todayStr && t.status !== 'concluida');
    } else if (tabFilter === 'concluidas') {
      matchesTab = t.status === 'concluida';
    }

    // 2. Category filter
    const matchesCategory = categoryFilter === 'todas' || t.category === categoryFilter;

    // 3. Priority filter
    const matchesPriority = priorityFilter === 'todas' || t.priority === priorityFilter;

    return matchesClient && matchesTab && matchesCategory && matchesPriority;
  });

  const clientMatchHelper = (t: Task) =>
    selectedClientId === 'todos' ||
    t.clientId === selectedClientId ||
    (selectedClient && t.clientName && (
      t.clientName.toLowerCase().includes(selectedClient.shortName.toLowerCase()) ||
      selectedClient.name.toLowerCase().includes(t.clientName.toLowerCase())
    )) ||
    (!t.clientId && !t.clientName);

  const lateCount = state.tasks.filter(
    (t) => clientMatchHelper(t) && (t.status === 'atrasada' || (t.date < todayStr && t.status !== 'concluida'))
  ).length;

  const todayCount = state.tasks.filter(
    (t) => clientMatchHelper(t) && t.date === todayStr && t.status !== 'concluida'
  ).length;

  const tomorrowCount = state.tasks.filter(
    (t) => clientMatchHelper(t) && t.date === tomorrowStr && t.status !== 'concluida'
  ).length;

  const allPendingCount = state.tasks.filter(
    (t) => clientMatchHelper(t) && t.status !== 'concluida'
  ).length;

  const getPriorityStyle = (p: TaskPriority) => {
    switch (p) {
      case 'urgente':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'alta':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'normal':
        return 'text-blue-900 bg-blue-50 border-blue-200';
      case 'baixa':
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#0F2042] font-display">
            Tarefas & Lembretes da SDR
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organização das ações comerciais diárias, follow-ups e retornos
          </p>
        </div>

        {onOpenNewTaskModal && (
          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F2042] hover:bg-[#1A365D] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        )}
      </div>

      {/* Tabs & Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Main Tabs (Zero-pill segmented buttons) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {[
            { id: 'hoje', label: `Hoje (${formatDateBR(todayStr).slice(0, 5)}) · ${todayCount}` },
            { id: 'amanha', label: `Amanhã (${formatDateBR(tomorrowStr).slice(0, 5)}) · ${tomorrowCount}` },
            { id: 'proximas', label: 'Próximos Dias' },
            { id: 'todas', label: `Todas Ativas (${allPendingCount})` },
            { id: 'atrasadas', label: `Atrasadas (${lateCount})` },
            { id: 'concluidas', label: 'Concluídas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabFilter(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                tabFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category & Priority Filters */}
        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Categoria:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700"
            >
              <option value="todas">Todas</option>
              <option value="interna">Interna</option>
              <option value="follow-up">Follow-up</option>
              <option value="lead">Lead</option>
              <option value="orcamento">Orçamento</option>
              <option value="reativacao">Reativação</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Prioridade:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700"
            >
              <option value="todas">Todas</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="normal">Normal</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center p-6 space-y-3">
          <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-800">
            {tabFilter === 'hoje'
              ? 'Nenhuma tarefa pendente para hoje.'
              : 'Nenhuma tarefa nesta categoria.'}
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {tabFilter === 'hoje' && tomorrowCount > 0
              ? `Você tem ${tomorrowCount} tarefa(s) agendada(s) para amanhã e ${allPendingCount} tarefa(s) ativas no total.`
              : 'Você está em dia com esta lista de atividades!'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            {tabFilter !== 'amanha' && tomorrowCount > 0 && (
              <button
                onClick={() => setTabFilter('amanha')}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Ver Tarefas de Amanhã ({tomorrowCount})
              </button>
            )}
            {tabFilter !== 'todas' && allPendingCount > 0 && (
              <button
                onClick={() => setTabFilter('todas')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors"
              >
                Ver Todas as Tarefas Ativas ({allPendingCount})
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 bg-white rounded-xl border shadow-2xs hover:shadow-xs transition-all flex items-start justify-between gap-4 ${
                task.status === 'atrasada'
                  ? 'border-rose-200 bg-rose-50/20'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-900 font-display">
                    {task.title}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-600 font-medium">
                    {task.clientName || 'Interna / Geral'}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">
                    {task.category}
                  </span>
                  {(task.priority === 'urgente' || task.priority === 'alta') && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] font-bold text-rose-600">
                        {task.priority === 'urgente' ? 'Urgente' : 'Alta prioridade'}
                      </span>
                    </>
                  )}
                </div>

                {task.description && (
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Data: {task.date} {task.time ? `(${task.time})` : ''}
                  </span>

                  {task.patientId && (
                    <>
                      <span>·</span>
                      <button
                        onClick={() => {
                          setSelectedPatientId(task.patientId!);
                          setActiveView('pacientes');
                        }}
                        className="text-blue-900 font-semibold hover:underline"
                      >
                        Ver ficha de {task.patientName}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    sendChatMessage(
                      `Iza, me dê orientação sobre a tarefa "${task.title}" (Conta: ${task.clientName || 'Interna'}, Paciente: ${task.patientName || 'Geral'}). Como abordar ou executar isso hoje?`
                    );
                    setActiveView('chat');
                  }}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Pedir orientação à Iza"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-800" />
                  <span className="hidden sm:inline">Orientar com Iza</span>
                </button>

                {task.status !== 'concluida' ? (
                  <button
                    onClick={() => completeTask(task.id)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Concluir</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0">
                    Concluída
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
