import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { PipelineStage, Opportunity } from '../types/crm';
import {
  Layers,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  User,
  Plus,
  CheckCircle2,
} from 'lucide-react';

interface StageColumn {
  id: PipelineStage;
  title: string;
  badgeColor?: string;
}

export const STAGES: StageColumn[] = [
  { id: 'novo_interesse', title: 'Novo Interesse' },
  { id: 'primeiro_contato', title: 'Primeiro Contato' },
  { id: 'qualificacao', title: 'Qualificação' },
  { id: 'agendamento', title: 'Agendamento' },
  { id: 'compareceu', title: 'Compareceu' },
  { id: 'proposta', title: 'Proposta / Orçamento' },
  { id: 'aguardando_decisao', title: 'Aguardando Decisão' },
  { id: 'follow_up', title: 'Follow-up' },
  { id: 'fechado', title: 'Fechado (Ganho)' },
  { id: 'perdido', title: 'Perdido' },
  { id: 'reativacao', title: 'Reativação' },
];

export const PipelineView: React.FC = () => {
  const { state, moveOpportunityStage, setSelectedPatientId, setActiveView } = useCRM();
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');

  if (!state) return null;

  const totalValueInPipeline = state.opportunities
    .filter((o) => o.stage !== 'fechado' && o.stage !== 'perdido')
    .reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);

  const closedValue = state.opportunities
    .filter((o) => o.stage === 'fechado')
    .reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);

  const oppsWithoutNextAction = state.opportunities.filter(
    (o) => !o.nextAction && o.stage !== 'fechado' && o.stage !== 'perdido'
  );

  const formatCurrency = (val?: number) => {
    if (!val) return 'R$ 0';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleStageChange = async (oppId: string, newStage: PipelineStage) => {
    await moveOpportunityStage(oppId, newStage);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* View Header with Pipeline KPIs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F2042] font-display">
            Pipeline Comercial
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão visual das oportunidades e estágios de decisão das pacientes
          </p>
        </div>

        {/* Pipeline Summary Counters */}
        <div className="flex items-center gap-4 flex-wrap text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[11px]">Em Negociação:</span>
            <span className="font-bold text-slate-900 text-sm">{formatCurrency(totalValueInPipeline)}</span>
          </div>

          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/70">
            <span className="text-emerald-700 block text-[11px]">Fechados (Vendas):</span>
            <span className="font-bold text-emerald-900 text-sm">{formatCurrency(closedValue)}</span>
          </div>

          {oppsWithoutNextAction.length > 0 && (
            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
              <span className="flex items-center gap-1 font-bold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                {oppsWithoutNextAction.length} sem próxima ação
              </span>
              <span className="text-[10px] text-rose-600 block">Exige atenção da SDR</span>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board Container (Horizontal Scroll) */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div className="flex gap-4 min-w-[1500px]">
          {STAGES.map((col) => {
            const oppsInStage = state.opportunities.filter((o) => o.stage === col.id);
            const stageTotal = oppsInStage.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);

            return (
              <div
                key={col.id}
                className="w-76 shrink-0 bg-slate-100/70 rounded-2xl p-3 border border-slate-200/70 flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 font-display truncate">
                      {col.title}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {oppsInStage.length}
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-slate-500">
                    {formatCurrency(stageTotal)}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                  {oppsInStage.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Nenhuma oportunidade
                    </div>
                  ) : (
                    oppsInStage.map((opp) => {
                      const hasNoNextAction = !opp.nextAction && col.id !== 'fechado' && col.id !== 'perdido';

                      return (
                        <div
                          key={opp.id}
                          className={`p-3.5 rounded-xl bg-white border shadow-2xs hover:shadow-xs transition-all space-y-2.5 ${
                            hasNoNextAction ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          {/* Card Title & Value */}
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0">
                              <button
                                onClick={() => {
                                  if (opp.patientId) {
                                    setSelectedPatientId(opp.patientId);
                                    setActiveView('pacientes');
                                  }
                                }}
                                className="text-xs font-bold text-slate-900 hover:text-blue-900 truncate block text-left font-display"
                              >
                                {opp.patientName}
                              </button>
                              <div className="text-xs text-slate-600 mt-0.5 truncate">
                                {opp.procedureName}
                              </div>
                            </div>

                            <span className="text-xs font-bold text-emerald-700 shrink-0">
                              {formatCurrency(opp.estimatedValue)}
                            </span>
                          </div>

                          {/* Interest or Objection */}
                          {opp.objection ? (
                            <div className="text-[11px] text-rose-700 bg-rose-50/60 p-1.5 rounded border border-rose-100">
                              <span className="font-semibold">Objeção:</span> {opp.objection}
                            </div>
                          ) : opp.interest ? (
                            <div className="text-[11px] text-slate-500 truncate">
                              {opp.interest}
                            </div>
                          ) : null}

                          {/* Next Action Box (Crucial SDR Rule) */}
                          <div
                            className={`p-2 rounded-lg text-xs ${
                              hasNoNextAction
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-slate-50 text-slate-700 border border-slate-100'
                            }`}
                          >
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">
                              Próxima Ação:
                            </div>
                            <div className="font-medium text-[11px] truncate mt-0.5">
                              {opp.nextAction || (
                                <span className="text-rose-600 font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Sem próxima ação!
                                </span>
                              )}
                            </div>
                            {opp.nextActionDate && (
                              <div className="text-[10px] text-blue-900 font-semibold mt-0.5">
                                Prazo: {new Date(opp.nextActionDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {/* Move Stage Selector */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-[10px] text-slate-400">Mover para:</span>
                            <select
                              value={opp.stage}
                              onChange={(e) => handleStageChange(opp.id, e.target.value as PipelineStage)}
                              className="text-[11px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-900 cursor-pointer"
                            >
                              {STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
