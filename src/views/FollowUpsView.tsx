import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { getSystemDateStrings, formatDateBR } from '../utils/dateUtils';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Phone,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const FollowUpsView: React.FC = () => {
  const { state, completeTask, setSelectedPatientId, setActiveView, selectedClientId, sendChatMessage } = useCRM();
  const [activeTab, setActiveTab] = useState<'hoje' | 'amanha' | 'semana' | 'atrasados' | 'todos'>('hoje');

  if (!state) return null;

  const { todayStr, tomorrowStr, nextWeekStr } = getSystemDateStrings();

  const selectedClient = state.clients.find((c) => c.id === selectedClientId);

  // Gather follow-ups from tasks and opportunities
  const allFollowUps = state.tasks.filter((t) => {
    const matchesClient = selectedClientId === 'todos' || t.clientId === selectedClientId;
    const isFollowUp = t.category === 'follow-up' || t.title.toLowerCase().includes('follow-up') || t.title.toLowerCase().includes('retornar');
    return matchesClient && isFollowUp;
  });

  const filteredFollowUps = allFollowUps.filter((f) => {
    if (activeTab === 'hoje') return f.date === todayStr && f.status !== 'concluida';
    if (activeTab === 'amanha') return f.date === tomorrowStr && f.status !== 'concluida';
    if (activeTab === 'semana') return f.date >= todayStr && f.date <= nextWeekStr && f.status !== 'concluida';
    if (activeTab === 'atrasados') return f.status === 'atrasada' || (f.date < todayStr && f.status !== 'concluida');
    return true;
  });

  const lateCount = allFollowUps.filter(
    (f) => f.status === 'atrasada' || (f.date < todayStr && f.status !== 'concluida')
  ).length;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F2042] font-display">
            Central de Follow-ups Comerciais
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedClient ? `Follow-ups da ${selectedClient.name}` : `Cadência de retorno em todas as ${state.clients.length} clínicas parceiras`}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Total pendente:</span>
          <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
            {allFollowUps.filter((f) => f.status !== 'concluida').length} retornos
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'hoje', label: `Hoje (${formatDateBR(todayStr).slice(0, 5)})` },
          { id: 'amanha', label: `Amanhã (${formatDateBR(tomorrowStr).slice(0, 5)})` },
          { id: 'semana', label: 'Próximos 7 Dias' },
          { id: 'atrasados', label: `Atrasados (${lateCount})` },
          { id: 'todos', label: 'Todos os Follow-ups' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Follow-ups List */}
      {filteredFollowUps.length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center p-6 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Nenhum follow-up pendente nesta visualização.</p>
          <p className="text-xs text-slate-400">
            Excelente trabalho! Nenhuma paciente está sem acompanhamento no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFollowUps.map((item) => {
            const patient = state.patients.find((p) => p.id === item.patientId || p.name === item.patientName);
            const opp = state.opportunities.find((o) => o.id === item.opportunityId || o.patientId === item.patientId);

            return (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="min-w-0 space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 font-display">
                      {item.patientName || item.title}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-600 font-medium">
                      {item.clientName || 'Clínica Parceira'}
                    </span>
                    {opp && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-700 font-medium">
                          {opp.procedureName} · R$ {opp.estimatedValue?.toLocaleString('pt-BR') || 0}
                        </span>
                      </>
                    )}
                    {item.status === 'atrasada' ? (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] font-bold text-rose-600">
                          Atrasado
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-amber-700 font-medium">
                          Pendente
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    <span className="font-semibold text-slate-700">Ação combinada:</span>{' '}
                    {item.description || item.title}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Data prevista: {item.date} {item.time ? `às ${item.time}` : ''}
                    </span>
                    <span>·</span>
                    <span>Responsável: {item.responsible}</span>

                    {patient?.whatsapp && (
                      <>
                        <span>·</span>
                        <a
                          href={`https://wa.me/${patient.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(
                            patient.name.split(' ')[0]
                          )}!%20Tudo%20bem?%20Aqui%20%C3%A9%20a%20${encodeURIComponent(
                            state.currentUser?.name?.split(' ')[0] || 'Camila'
                          )}%20da%20${encodeURIComponent(patient?.clientName || item.clientName || 'nossa clínica')}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chamar no WhatsApp</span>
                        </a>
                      </>
                    )}

                    {patient && (
                      <>
                        <span>·</span>
                        <button
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setActiveView('pacientes');
                          }}
                          className="text-blue-900 font-semibold hover:underline"
                        >
                          Ver ficha
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => {
                      sendChatMessage(
                        `Iza, redija uma mensagem persuasiva e consultiva de follow-up para a paciente ${patient?.name || item.patientName || 'nossa paciente'} sobre: "${item.description || item.title}" da conta ${patient?.clientName || item.clientName || 'clínica vinculada'}.`
                      );
                      setActiveView('chat');
                    }}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Pedir redação inteligente à Iza"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-800" />
                    <span>Redigir com Iza</span>
                  </button>

                  {item.status !== 'concluida' ? (
                    <button
                      onClick={() => completeTask(item.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Concluir</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">
                      Concluído
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
