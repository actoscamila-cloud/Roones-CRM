import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  RefreshCw,
  Sparkles,
  MessageSquare,
  Clock,
  Phone,
  ArrowRight,
  CheckCircle2,
  Copy,
} from 'lucide-react';

export const ReativacaoView: React.FC = () => {
  const { state, setSelectedPatientId, setActiveView, sendChatMessage, selectedClientId } = useCRM();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!state) return null;

  const selectedClient = state.clients.find((c) => c.id === selectedClientId);

  // Filter inactive patients (>90d, >120d, lost opportunities, or status 'inativo')
  const inactivePatients = state.patients.filter((p) => {
    const matchesClient = selectedClientId === 'todos' || p.clientId === selectedClientId;
    const isInactive = p.status === 'inativo' || p.tags.includes('Reativação') || p.tags.includes('Mais de 120 dias');
    return matchesClient && isInactive;
  });

  const getSuggestedReactivationMessage = (patient: any) => {
    const firstName = patient.name.split(' ')[0];
    const sdrName = state.currentUser?.name?.split(' ')[0] || 'Camila';
    const clinicName = patient.clientName || state.clinic?.name || 'Roones CRM';
    if (patient.tags.includes('Radiesse') || patient.commercialNotes?.includes('Radiesse')) {
      return `Olá ${firstName}! Tudo bem com você? Aqui é a ${sdrName} da ${clinicName}. Vi que já faz alguns meses do seu protocolo de bioestimulador. Como está a sua pele? Gostaria de verificar se podemos agendar sua consulta de acompanhamento de colágeno nesta semana!`;
    }
    return `Olá ${firstName}! Tudo bem? Aqui é a ${sdrName} da ${clinicName}. Faz um tempinho que não conversamos! Como você tem passado? Preparamos uma condição especial de renovação de procedimentos para este mês e lembrei com carinho de você. Podemos conversar?`;
  };

  const handleCopyMessage = (patient: any) => {
    const text = getSuggestedReactivationMessage(patient);
    navigator.clipboard.writeText(text);
    setCopiedId(patient.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleAskAiToReactivate = (patient: any) => {
    sendChatMessage(`Gere uma mensagem personalizada de WhatsApp para reativar a paciente ${patient.name}, considerando o histórico dela.`);
    setActiveView('chat');
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 tracking-wide uppercase mb-1">
            <RefreshCw className="w-3.5 h-3.5 text-blue-800" />
            <span>Inteligência de Retorno</span>
          </div>
          <h2 className="text-xl font-bold text-[#0F2042] font-display">
            Radar de Reativação de Pacientes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Identifica pacientes sem atendimento recente (+90d / +120d) para retomada calorosa de contato
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="font-bold text-slate-900">{inactivePatients.length}</span> pacientes no radar de reativação
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 text-xs text-blue-950 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Estratégia de Reativação da SDR:</span> A reativação é uma das fontes de maior conversão da clínica. Não envie promoções genéricas; mencione o procedimento que a paciente já realizou ou o protocolo que a Dra. Sofia indicou.
        </div>
      </div>

      {/* Patients to Reactivate List */}
      <div className="space-y-4">
        {inactivePatients.length === 0 ? (
          <div className="py-12 bg-white rounded-2xl border border-slate-200/80 text-center p-8 space-y-3 max-w-xl mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-900 mx-auto flex items-center justify-center">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Nenhuma paciente aguardando reativação no momento
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pacientes sem contato ou sem agendamento há mais de 15 dias entram aqui automaticamente. Quando surgirem, clique em <strong>"Sugerir Abordagem"</strong> para a Iza gerar uma mensagem de resgate calorosa e personalizada baseada no histórico clínico.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveView('pipeline')}
                className="px-4 py-2 bg-[#0F2042] hover:bg-[#1A365D] text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Acompanhar Pipeline Ativo
              </button>
            </div>
          </div>
        ) : (
          inactivePatients.map((patient) => {
            const message = getSuggestedReactivationMessage(patient);
            const phoneDigits = patient.phone.replace(/\D/g, '');
            const encodedMsg = encodeURIComponent(message);

            return (
              <div
                key={patient.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 font-display">
                        {patient.name}
                      </h3>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-600 font-medium">
                        {patient.clientName || 'Clínica Parceira'}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-amber-700 font-medium">
                        Inativa há mais de 120 dias
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {patient.phone}
                      </span>
                      <span>·</span>
                      <span>
                        Último atendimento:{' '}
                        {patient.lastAppointmentDate
                          ? new Date(patient.lastAppointmentDate).toLocaleDateString('pt-BR')
                          : 'Maio de 2026'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`https://wa.me/55${phoneDigits}?text=${encodedMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Chamar no WhatsApp</span>
                    </a>

                    <button
                      onClick={() => handleAskAiToReactivate(patient)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Pedir Variação à Iza</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPatientId(patient.id);
                        setActiveView('pacientes');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Ver Histórico
                    </button>
                  </div>
                </div>

                {/* Suggested Message Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Sugestão de Mensagem para WhatsApp:</span>
                    <button
                      onClick={() => handleCopyMessage(patient)}
                      className="text-xs text-blue-900 font-semibold hover:underline flex items-center gap-1"
                    >
                      {copiedId === patient.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Texto</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200/60">
                    "{message}"
                  </p>

                  {patient.whatsapp && (
                    <div className="text-right">
                      <a
                        href={`https://wa.me/${patient.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Abrir WhatsApp com esta Mensagem</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
