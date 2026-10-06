import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { getSystemDateStrings } from '../utils/dateUtils';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Building2,
  Filter,
  ArrowUpRight,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const RelatoriosView: React.FC = () => {
  const { state, selectedClientId, setSelectedClientId, sendChatMessage, setActiveView } = useCRM();
  const [period, setPeriod] = useState<'mes_atual' | 'trimestre' | 'ano'>('mes_atual');

  if (!state) return null;

  const currentClient = state.clients.find((c) => c.id === selectedClientId);

  const filteredPatients = selectedClientId === 'todos'
    ? state.patients
    : state.patients.filter((p) => p.clientId === selectedClientId);

  const filteredOpps = selectedClientId === 'todos'
    ? state.opportunities
    : state.opportunities.filter((o) => o.clientId === selectedClientId);

  const filteredTasks = selectedClientId === 'todos'
    ? state.tasks
    : state.tasks.filter((t) => t.clientId === selectedClientId);

  // Pipeline metrics
  const totalPipelineValue = filteredOpps
    .filter((o) => o.stage !== 'fechado' && o.stage !== 'perdido')
    .reduce((sum, o) => sum + (o.estimatedValue || 0), 0);

  const totalClosedWonValue = filteredOpps
    .filter((o) => o.stage === 'fechado')
    .reduce((sum, o) => sum + (o.estimatedValue || 0), 0);

  const totalClosedCount = filteredOpps.filter((o) => o.stage === 'fechado').length;
  const totalLostCount = filteredOpps.filter((o) => o.stage === 'perdido').length;
  const closedOrLost = totalClosedCount + totalLostCount;
  const winRate = closedOrLost > 0 ? Math.round((totalClosedCount / closedOrLost) * 100) : 0;

  const { todayStr } = getSystemDateStrings();

  // Tasks metrics
  const completedTasks = filteredTasks.filter((t) => t.status === 'concluida').length;
  const pendingTasks = filteredTasks.filter((t) => t.status !== 'concluida').length;
  const lateTasks = filteredTasks.filter(
    (t) => t.status === 'atrasada' || (t.date < todayStr && t.status !== 'concluida')
  ).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 tracking-wide uppercase mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-blue-800" />
            <span>Inteligência Comercial & Indicadores</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F2042] font-display">
            Relatórios de Desempenho Operacional
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {currentClient
              ? `Demonstrativo comercial isolado da ${currentClient.name}`
              : `Consolidação de resultados de todas as ${state.clients.length} clínicas da sua carteira comercial`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value="todos">Todos os Clientes</option>
            {state.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              sendChatMessage(
                `Iza, faça um diagnóstico executivo e estratégico do desempenho comercial da minha carteira de clínicas (conversão, pipeline, agendamentos e follow-ups em atraso).`
              );
              setActiveView('chat');
            }}
            className="px-3.5 py-2.5 bg-[#0F2042] hover:bg-[#1A365D] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            title="Pedir análise estratégica à Iza"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Diagnóstico da Iza</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Faturamento em Pipeline</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </span>
          <div className="text-2xl font-bold text-slate-900 font-display mt-1">
            R$ {(totalPipelineValue / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" /> Em negociação ativa
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Protocolos Fechados</span>
            <TrendingUp className="w-4 h-4 text-blue-900" />
          </span>
          <div className="text-2xl font-bold text-slate-900 font-display mt-1">
            R$ {(totalClosedWonValue / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            {totalClosedCount} procedimentos ganhos
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Taxa de Conversão</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </span>
          <div className="text-2xl font-bold text-emerald-700 font-display mt-1">
            {winRate}%
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            Propostas x Fechamento
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Follow-ups & Tarefas</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </span>
          <div className="text-2xl font-bold text-slate-900 font-display mt-1">
            {pendingTasks}
          </div>
          <span className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${
            lateTasks > 0 ? 'text-rose-600' : 'text-slate-500'
          }`}>
            {lateTasks > 0 ? `${lateTasks} atrasadas para hoje` : 'Todas em dia'}
          </span>
        </div>
      </div>

      {/* Comparison by Client (if viewing All Clients) */}
      {selectedClientId === 'todos' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Comparativo por Clínica da Carteira
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Desempenho de cada cliente atendido por você neste mês
              </p>
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
              {state.clients.length} Clínicas Atendidas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Cliente / Clínica</th>
                  <th className="py-3 px-3 font-semibold">Responsável</th>
                  <th className="py-3 px-3 font-semibold text-center">Pacientes</th>
                  <th className="py-3 px-3 font-semibold text-center">Opps Ativas</th>
                  <th className="py-3 px-3 font-semibold text-right">Pipeline (R$)</th>
                  <th className="py-3 px-3 font-semibold text-center">Follow-ups</th>
                  <th className="py-3 px-4 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {state.clients.map((client) => {
                  const clientPatients = state.patients.filter((p) => p.clientId === client.id);
                  const clientOpps = state.opportunities.filter(
                    (o) => o.clientId === client.id && o.stage !== 'fechado' && o.stage !== 'perdido'
                  );
                  const clientPipeline = clientOpps.reduce(
                    (sum, o) => sum + (o.estimatedValue || 0),
                    0
                  );
                  const clientTasks = state.tasks.filter(
                    (t) => t.clientId === client.id && t.status !== 'concluida'
                  );
                  const clientLate = clientTasks.filter(
                    (t) => t.status === 'atrasada' || (t.date < todayStr && t.status !== 'concluida')
                  ).length;

                  return (
                    <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center text-[10px] font-bold">
                            {client.shortName.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{client.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">{client.doctorOrOwner}</td>
                      <td className="py-3.5 px-3 text-center font-medium">
                        {clientPatients.length}
                      </td>
                      <td className="py-3.5 px-3 text-center font-medium">{clientOpps.length}</td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900 font-display">
                        R$ {clientPipeline.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          clientLate > 0
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {clientTasks.length} {clientLate > 0 ? `(${clientLate} atraso)` : ''}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedClientId(client.id)}
                          className="text-[11px] text-blue-900 font-semibold hover:underline"
                        >
                          Filtrar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Distribution of Pipeline by Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 font-display mb-1">
            Distribuição por Etapa do Pipeline
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Concentração dos contatos e negociações em andamento
          </p>

          <div className="space-y-3">
            {[
              { label: 'Novo Interesse', stage: 'novo_interesse', color: 'bg-sky-500' },
              { label: 'Primeiro Contato / Qualificação', stage: 'qualificacao', color: 'bg-blue-600' },
              { label: 'Agendamento / Avaliação', stage: 'agendamento', color: 'bg-indigo-600' },
              { label: 'Proposta / Orçamento', stage: 'proposta', color: 'bg-amber-500' },
              { label: 'Aguardando Decisão / Follow-up', stage: 'follow_up', color: 'bg-purple-600' },
              { label: 'Fechado (Ganho)', stage: 'fechado', color: 'bg-emerald-600' },
            ].map((item) => {
              const count = filteredOpps.filter((o) => o.stage === item.stage).length;
              const total = filteredOpps.length || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={item.stage} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cadence & SLA Compliance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display mb-1">
              Cadência e SLA de Retorno
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cumprimento das regras comerciais estabelecidas por cada clínica
            </p>

            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-950">Cumprimento de Follow-ups no Prazo:</span>
                <span className="font-bold text-blue-900">89%</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                A Iza monitora diariamente os prazos definidos (ex: 3 dias para Clínica Camila Silva, 5 dias para Face Doctor) para garantir que nenhum lead esfrie sem próximo passo cadastrado.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Tempo médio de primeiro contato:</span>
                <span className="font-bold text-slate-900">18 minutos</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Taxa de pacientes sem próxima ação:</span>
                <span className="font-bold text-emerald-600">0% (100% com próximo passo)</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Operadora Comercial Responsável:</span>
                <span className="font-bold text-slate-900">Camila Rocha (SDR)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
