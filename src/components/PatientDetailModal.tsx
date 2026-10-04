import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  X,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Clock,
  Tag,
  Plus,
  Send,
  CheckCircle2,
  FileText,
  AlertCircle,
  MessageSquare,
  TrendingUp,
  User,
  History,
  CheckSquare,
} from 'lucide-react';
import { generatePatientSummaryAPI } from '../services/api';

interface PatientDetailModalProps {
  patientId: string;
  onClose: () => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({ patientId, onClose }) => {
  const { state, addInteraction, quickCreateOpportunity, quickCreateTask } = useCRM();
  const [activeTab, setActiveTab] = useState<'resumo' | 'timeline' | 'oportunidades' | 'tarefas' | 'notas'>('resumo');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);

  // New Note state
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<string>('observacao');

  // New Opportunity Quick form
  const [showAddOpp, setShowAddOpp] = useState(false);
  const [newOppProcedure, setNewOppProcedure] = useState('');
  const [newOppValue, setNewOppValue] = useState<number>(2000);
  const [newOppNextAction, setNewOppNextAction] = useState('');

  if (!state) return null;
  const patient = state.patients.find((p) => p.id === patientId);
  if (!patient) return null;

  const interactions = state.interactions.filter((i) => i.patientId === patientId);
  const opportunities = state.opportunities.filter((o) => o.patientId === patientId);
  const tasks = state.tasks.filter((t) => t.patientId === patientId);

  // Generate or load AI Summary on demand
  const handleFetchAiSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const summary = await generatePatientSummaryAPI(patientId);
      setAiSummary(summary);
    } catch (e) {
      console.error(e);
      setAiSummary('Não foi possível gerar o resumo com a IA no momento.');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    await addInteraction({
      patientId: patient.id,
      type: noteType as any,
      content: newNote.trim(),
      author: 'Camila Rocha (SDR)',
      origin: 'manual',
    });

    setNewNote('');
  };

  const handleCreateOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppProcedure.trim()) return;

    await quickCreateOpportunity({
      patientId: patient.id,
      patientName: patient.name,
      procedureName: newOppProcedure.trim(),
      estimatedValue: Number(newOppValue) || 2000,
      stage: 'novo_interesse',
      nextAction: newOppNextAction || 'Primeiro contato sobre procedimento',
      nextActionDate: '2026-10-06T10:00:00.000Z',
    });

    setShowAddOpp(false);
    setNewOppProcedure('');
    setNewOppNextAction('');
  };

  const formatCurrency = (val?: number) => {
    if (!val) return 'R$ 0';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200/80 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0F2042] text-white flex items-center justify-center font-bold text-lg shrink-0">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#0F2042] font-display">
                  {patient.name}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded text-blue-900 bg-blue-50 border border-blue-200/60 uppercase">
                  {patient.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500">
                  Origem: {patient.origin}
                </span>
              </div>

              {/* Contact metadata */}
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {patient.phone || 'Sem telefone'}
                </span>
                {patient.whatsapp && (
                  <a
                    href={`https://wa.me/${patient.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Abrir WhatsApp</span>
                  </a>
                )}
                {patient.email && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {patient.email}
                  </span>
                )}
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs text-slate-500">
                {patient.tags.map((t, idx) => (
                  <span key={idx} className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 px-4 sm:px-6 bg-white overflow-x-auto">
          <button
            onClick={() => setActiveTab('resumo')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'resumo'
                ? 'border-[#0F2042] text-[#0F2042] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-800" />
            <span>Resumo da Iza</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-[#0F2042] text-[#0F2042] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Timeline ({interactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('oportunidades')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'oportunidades'
                ? 'border-[#0F2042] text-[#0F2042] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
            <span>Oportunidades ({opportunities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tarefas')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tarefas'
                ? 'border-[#0F2042] text-[#0F2042] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Tarefas ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notas')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'notas'
                ? 'border-[#0F2042] text-[#0F2042] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Notas & Observações</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto bg-slate-50/50">
          {/* TAB 1: RESUMO IA */}
          {activeTab === 'resumo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-800" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 font-display">
                      Síntese Comercial da Iza
                    </h3>
                  </div>
                  <button
                    onClick={handleFetchAiSummary}
                    disabled={isLoadingSummary}
                    className="px-3 py-1.5 bg-[#0F2042] hover:bg-[#1A365D] text-white text-xs font-medium rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${isLoadingSummary ? 'animate-spin' : ''}`} />
                    <span>{isLoadingSummary ? 'Gerando...' : 'Gerar com a Iza'}</span>
                  </button>
                </div>

                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/60">
                  {aiSummary ||
                    `Paciente ${patient.name} tem status atual de ${patient.status}. Última interação registrada em ${patient.lastInteractionDate.slice(0, 10)}. Possui ${opportunities.length} oportunidade(s) cadastrada(s). Próxima ação recomendada: ${patient.nextAction || 'Não informada'}.\n\nClique no botão "Gerar com a Iza" acima para extrair argumentos estratégicos personalizados.`}
                </div>
              </div>

              {/* Key Quick Facts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Próxima Ação Programada</div>
                  <div className="text-sm font-semibold text-slate-900 mt-1">
                    {patient.nextAction || 'Nenhuma próxima ação cadastrada'}
                  </div>
                  {patient.nextActionDate && (
                    <div className="text-xs text-blue-800 font-medium mt-1">
                      Data: {new Date(patient.nextActionDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Último Atendimento / Consulta</div>
                  <div className="text-sm font-semibold text-slate-900 mt-1">
                    {patient.lastAppointmentDate
                      ? new Date(patient.lastAppointmentDate).toLocaleDateString()
                      : 'Sem registro de atendimento médico anterior'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Primeiro contato: {new Date(patient.firstContactDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {/* Quick Add Interaction Form */}
              <form onSubmit={handleAddNote} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Registrar nova interação na timeline:</span>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700"
                  >
                    <option value="observacao">Observação Comercial</option>
                    <option value="whatsapp">Mensagem WhatsApp</option>
                    <option value="ligacao">Ligação Telefônica</option>
                    <option value="atendimento">Atendimento Presencial</option>
                    <option value="proposta">Envio de Orçamento</option>
                    <option value="follow_up">Follow-up Realizado</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Ex: Paciente respondeu pelo WhatsApp dizendo que..."
                    className="flex-1 text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white text-slate-800"
                  />
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="px-3 py-2 bg-[#0F2042] text-white text-xs font-medium rounded-lg hover:bg-[#1A365D] disabled:opacity-40 transition-colors shrink-0"
                  >
                    Registrar
                  </button>
                </div>
              </form>

              {/* Interactions Chronological Timeline */}
              {interactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                  Nenhuma interação registrada ainda.
                </div>
              ) : (
                <div className="space-y-3">
                  {interactions.map((inter) => (
                    <div
                      key={inter.id}
                      className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <span className="capitalize">{inter.type.replace('_', ' ')}</span>
                          <span>·</span>
                          <span className="text-slate-500">{inter.author}</span>
                        </div>
                        <span>{new Date(inter.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {inter.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OPORTUNIDADES */}
          {activeTab === 'oportunidades' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Oportunidades associadas ({opportunities.length})
                </span>
                <button
                  onClick={() => setShowAddOpp(!showAddOpp)}
                  className="px-2.5 py-1 bg-[#0F2042] text-white text-xs font-medium rounded-lg hover:bg-[#1A365D] transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Oportunidade</span>
                </button>
              </div>

              {/* Add Opportunity Quick Form */}
              {showAddOpp && (
                <form onSubmit={handleCreateOpp} className="p-4 bg-white rounded-xl border border-blue-200 shadow-xs space-y-3">
                  <div className="text-xs font-bold text-blue-900">Cadastrar Nova Oportunidade</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium">Procedimento</label>
                      <input
                        type="text"
                        placeholder="Ex: Bioestimulador Sculptra"
                        value={newOppProcedure}
                        onChange={(e) => setNewOppProcedure(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded mt-0.5"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium">Valor Estimado (R$)</label>
                      <input
                        type="number"
                        value={newOppValue}
                        onChange={(e) => setNewOppValue(Number(e.target.value))}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded mt-0.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium">Próxima Ação Comercial (Obrigatória)</label>
                    <input
                      type="text"
                      placeholder="Ex: Ligar para apresentar condições de pagamento"
                      value={newOppNextAction}
                      onChange={(e) => setNewOppNextAction(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded mt-0.5"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddOpp(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#0F2042] text-white text-xs font-medium rounded-lg"
                    >
                      Salvar Oportunidade
                    </button>
                  </div>
                </form>
              )}

              {/* Opportunities List */}
              {opportunities.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                  Nenhuma oportunidade comercial em aberto para esta paciente.
                </div>
              ) : (
                <div className="space-y-3">
                  {opportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-slate-900 font-display">
                            {opp.procedureName}
                          </div>
                          <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                            {formatCurrency(opp.estimatedValue)}
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded uppercase">
                          {opp.stage.replace('_', ' ')}
                        </span>
                      </div>

                      {opp.interest && (
                        <p className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">Interesse:</span> {opp.interest}
                        </p>
                      )}

                      {opp.objection && (
                        <p className="text-xs text-rose-700">
                          <span className="font-semibold">Objeção:</span> {opp.objection}
                        </p>
                      )}

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-700">Próxima ação:</span>{' '}
                          {opp.nextAction || <span className="text-rose-600 font-bold">Sem próxima ação definida!</span>}
                        </div>
                        {opp.nextActionDate && (
                          <span className="text-[11px] text-slate-500">
                            {new Date(opp.nextActionDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TAREFAS */}
          {activeTab === 'tarefas' && (
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                  Nenhuma tarefa vinculada a esta paciente.
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{task.title}</div>
                      {task.description && (
                        <p className="text-slate-500 mt-1">{task.description}</p>
                      )}
                      <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2">
                        <span>Data: {task.date}</span>
                        <span>·</span>
                        <span className="capitalize">{task.category}</span>
                        <span>·</span>
                        <span className="capitalize">Status: {task.status}</span>
                      </div>
                    </div>
                    {task.status === 'concluida' ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-4 h-4" /> Concluída
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium text-[11px]">Pendente</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: NOTAS COMERCIAIS */}
          {activeTab === 'notas' && (
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-800 mb-2">
                  Notas Comerciais Fixas da SDR
                </div>
                <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {patient.commercialNotes || 'Nenhuma nota registrada até o momento.'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            ID: <span className="font-mono">{patient.id}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Fechar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
