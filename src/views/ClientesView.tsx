import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { ClientAccount } from '../types/crm';
import {
  Building2,
  Plus,
  Edit2,
  Phone,
  Mail,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  X,
  Sliders,
  DollarSign,
  Trash2,
} from 'lucide-react';

export const ClientesView: React.FC = () => {
  const {
    state,
    createClient,
    updateClient,
    deleteClient,
    selectedClientId,
    setSelectedClientId,
    setActiveView,
    sendChatMessage,
  } = useCRM();

  // Modal State for New Client
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientShortName, setNewClientShortName] = useState('');
  const [newClientDoctor, setNewClientDoctor] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientFollowUpDays, setNewClientFollowUpDays] = useState(3);
  const [newClientCampaign, setNewClientCampaign] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  // Modal State for Edit Client
  const [editingClient, setEditingClient] = useState<ClientAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editShortName, setEditShortName] = useState('');
  const [editDoctor, setEditDoctor] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editFollowUpDays, setEditFollowUpDays] = useState(3);
  const [editCampaigns, setEditCampaigns] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  if (!state) return null;

  const handleOpenEdit = (client: ClientAccount) => {
    setEditingClient(client);
    setEditName(client.name);
    setEditShortName(client.shortName);
    setEditDoctor(client.doctorOrOwner);
    setEditPhone(client.phone);
    setEditEmail(client.email);
    setEditFollowUpDays(client.defaultFollowUpDays || 3);
    setEditCampaigns(client.activeCampaigns?.join(', ') || '');
    setEditNotes(client.address || '');
  };

  const handleSaveEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editName.trim()) return;

    setIsSavingEdit(true);
    try {
      const campaigns = editCampaigns
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateClient(editingClient.id, {
        name: editName.trim(),
        shortName: editShortName.trim() || editName.trim(),
        doctorOrOwner: editDoctor.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
        defaultFollowUpDays: Number(editFollowUpDays) || 3,
        activeCampaigns: campaigns,
        address: editNotes.trim(),
      });
      setEditingClient(null);
    } catch (err) {
      console.error('Failed to update client:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteClient = async (client: ClientAccount) => {
    if (
      confirm(
        `Deseja realmente excluir a clínica "${client.name}"? Todos os pacientes e tarefas associados a ela também serão removidos.`
      )
    ) {
      await deleteClient(client.id);
    }
  };

  const handleCreateNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    setIsCreatingClient(true);
    try {
      const campaigns = newClientCampaign
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await createClient({
        name: newClientName.trim(),
        shortName: newClientShortName.trim() || newClientName.trim(),
        doctorOrOwner: newClientDoctor.trim() || 'Médica / Profissional Responsável',
        phone: newClientPhone.trim(),
        email: newClientEmail.trim(),
        defaultFollowUpDays: Number(newClientFollowUpDays) || 3,
        activeCampaigns: campaigns,
        address: newClientNotes.trim(),
        type: 'clinica_estetica',
        color: '#2563EB',
        badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
      });

      setShowNewClientModal(false);
      setNewClientName('');
      setNewClientShortName('');
      setNewClientDoctor('');
      setNewClientPhone('');
      setNewClientEmail('');
      setNewClientCampaign('');
      setNewClientNotes('');
    } catch (err) {
      console.error('Failed to create client:', err);
    } finally {
      setIsCreatingClient(false);
    }
  };

  const totalPatients = state.patients.length;
  const totalOpportunities = state.opportunities.filter(
    (o) => o.stage !== 'fechado' && o.stage !== 'perdido'
  ).length;
  const totalTasks = state.tasks.filter((t) => t.status !== 'concluida').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner / Hero */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 tracking-wide uppercase mb-1">
            <Building2 className="w-3.5 h-3.5 text-blue-800" />
            <span>Gestão da Minha Carteira Comercial</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F2042] font-display">
            Clientes & Clínicas Atendidas
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Cada cliente/clínica é uma conta independente no seu CRM comercial. Pacientes, oportunidades, regras de retorno e campanhas pertencem exclusivamente à conta vinculada.
          </p>
        </div>

        <button
          onClick={() => setShowNewClientModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F2042] hover:bg-[#1A365D] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors w-full sm:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Clínica</span>
        </button>
      </div>

      {/* Aggregate Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Clínicas na Carteira</span>
            <Building2 className="w-4 h-4 text-blue-800" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display">
            {state.clients.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> Todas ativas
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Pacientes Cadastrados</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display">
            {totalPatients}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Distribuídos por conta</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Oportunidades em Aberto</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display">
            {totalOpportunities}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Pipeline ativo</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Tarefas Pendentes</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display">
            {totalTasks}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Em todas as clínicas</span>
        </div>
      </div>

      {/* Grid of Client Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {state.clients.length === 0 ? (
          <div className="col-span-full bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 mx-auto flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Nenhuma clínica cadastrada na base
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Cadastre sua clínica estética ou médica para começar a operar com a Iza, registrar pacientes e acompanhar oportunidades.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowNewClientModal(true)}
                className="px-4 py-2.5 bg-[#0F2042] hover:bg-[#1A365D] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Minha Clínica</span>
              </button>
            </div>
          </div>
        ) : (
          state.clients.map((client) => {
            const clientPatients = state.patients.filter((p) => p.clientId === client.id);
            const clientOpps = state.opportunities.filter(
              (o) => o.clientId === client.id && o.stage !== 'fechado' && o.stage !== 'perdido'
            );
            const clientPipelineValue = clientOpps.reduce(
              (sum, o) => sum + (o.estimatedValue || 0),
              0
            );
            const clientTasks = state.tasks.filter(
              (t) => t.clientId === client.id && t.status !== 'concluida'
            );
            const clientFollowUps = clientTasks.filter((t) => t.category === 'follow-up');
            const isSelected = selectedClientId === client.id;

            return (
              <div
                key={client.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-blue-900 ring-2 ring-blue-900/10'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center font-bold text-base shrink-0 font-display">
                        {client.shortName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 font-display">
                            {client.name}
                          </h3>
                          {isSelected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-900 text-white">
                              Filtro Ativo
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {client.status}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-600 mt-0.5">
                          Responsável: {client.doctorOrOwner}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(client)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                        title="Editar regras e dados da clínica"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                        title="Excluir clínica da carteira"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                {/* Specific Commercial Rules Snapshot */}
                <div className="mt-4 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-800" />
                      Prazo padrão de follow-up:
                    </span>
                    <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {client.defaultFollowUpDays || 3} dias
                    </span>
                  </div>

                  {client.phone && (
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        Contato comercial:
                      </span>
                      <span className="font-medium text-slate-800">{client.phone}</span>
                    </div>
                  )}

                  {client.email && (
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        Email da conta:
                      </span>
                      <span className="font-medium text-slate-800 truncate max-w-[200px]">
                        {client.email}
                      </span>
                    </div>
                  )}
                </div>

                {/* Active Campaigns */}
                {client.activeCampaigns && client.activeCampaigns.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Campanhas em Andamento:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {client.activeCampaigns.map((camp, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-md font-medium"
                        >
                          {camp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activity Counts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-sm sm:text-base font-bold text-slate-900 font-display">
                      {clientPatients.length}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Pacientes</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-sm sm:text-base font-bold text-slate-900 font-display">
                      {clientOpps.length}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Oportunidades</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-sm sm:text-base font-bold text-slate-900 font-display">
                      {clientFollowUps.length}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Follow-ups</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-sm sm:text-base font-bold text-emerald-700 font-display">
                      R$ {(clientPipelineValue / 1000).toFixed(1)}k
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Pipeline</div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setSelectedClientId(client.id);
                      setActiveView('meu-dia');
                    }}
                    className={`sm:col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                      isSelected
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span>{isSelected ? 'Ver Meu Dia (Filtrado)' : 'Filtrar Meu Dia por esta Clínica'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      sendChatMessage(`Iza, faça um resumo das tarefas, pendências e oportunidades da ${client.name}`);
                      setActiveView('chat');
                    }}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                    title="Pedir resumo desta clínica à Iza"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-800" />
                    <span>Consultar Iza</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedClientId(client.id);
                      setActiveView('pacientes');
                    }}
                    className="py-1.5 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg transition-colors text-center"
                  >
                    Ver Pacientes ({clientPatients.length})
                  </button>

                  <button
                    onClick={() => {
                      setSelectedClientId(client.id);
                      setActiveView('pipeline');
                    }}
                    className="py-1.5 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg transition-colors text-center"
                  >
                    Ver Pipeline ({clientOpps.length})
                  </button>
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Modal: New Client */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-900" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Cadastrar Novo Cliente / Clínica
                </h3>
              </div>
              <button
                onClick={() => setShowNewClientModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewClient} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nome Completo da Clínica / Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Clínica Dra. Amanda Santos"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nome Curto (Apelido)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Amanda Santos"
                    value={newClientShortName}
                    onChange={(e) => setNewClientShortName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Médica / Responsável
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dra. Amanda Santos"
                    value={newClientDoctor}
                    onChange={(e) => setNewClientDoctor(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(19) 98888-0000"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email da Clínica</label>
                  <input
                    type="email"
                    placeholder="contato@clinica.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Regra Específica: Prazo Padrão de Follow-up (dias)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newClientFollowUpDays}
                    onChange={(e) => setNewClientFollowUpDays(Number(e.target.value))}
                    className="w-24 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
                  />
                  <span className="text-[11px] text-slate-500">
                    dias após o contato sem retorno para sugerir novo follow-up
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Campanhas Ativas (separadas por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Botox Day Outubro, Protocolo Glúteos 2026"
                  value={newClientCampaign}
                  onChange={(e) => setNewClientCampaign(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Endereço / Observações Comerciais
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Unidade Cambuí, Campinas. Foco em protocolos de alta densidade."
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingClient}
                  className="px-4 py-2 bg-[#0F2042] text-white rounded-lg font-semibold hover:bg-[#1A365D] transition-colors"
                >
                  {isCreatingClient ? 'Salvando...' : 'Cadastrar Clínica'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Client */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-900" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Editar Cliente / Regras da Clínica
                </h3>
              </div>
              <button
                onClick={() => setEditingClient(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditClient} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nome Completo da Clínica / Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nome Curto (Apelido)
                  </label>
                  <input
                    type="text"
                    value={editShortName}
                    onChange={(e) => setEditShortName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Médica / Responsável
                  </label>
                  <input
                    type="text"
                    value={editDoctor}
                    onChange={(e) => setEditDoctor(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email da Clínica</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Regra Específica: Prazo Padrão de Follow-up (dias)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={editFollowUpDays}
                    onChange={(e) => setEditFollowUpDays(Number(e.target.value))}
                    className="w-24 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
                  />
                  <span className="text-[11px] text-slate-500">
                    dias úteis para cadência de follow-up nesta clínica
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Campanhas Ativas (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={editCampaigns}
                  onChange={(e) => setEditCampaigns(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Endereço / Observações</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 bg-[#0F2042] text-white rounded-lg font-semibold hover:bg-[#1A365D] transition-colors"
                >
                  {isSavingEdit ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
