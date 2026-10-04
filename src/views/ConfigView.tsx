import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  Settings,
  Building2,
  ShieldCheck,
  History,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Save,
  Check,
} from 'lucide-react';

export const ConfigView: React.FC = () => {
  const { state, resetDatabase, updateClinic } = useCRM();
  const [activeTab, setActiveTab] = useState<'clinica' | 'procedimentos' | 'automacoes' | 'auditoria'>('clinica');
  const [isResetting, setIsResetting] = useState(false);

  // Clinic edit state
  const [clinicName, setClinicName] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [clinicEmail, setClinicEmail] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicTimezone, setClinicTimezone] = useState('');
  const [defaultFollowUpDays, setDefaultFollowUpDays] = useState(3);
  const [requireNextAction, setRequireNextAction] = useState(true);
  const [isSavingClinic, setIsSavingClinic] = useState(false);
  const [clinicSavedMessage, setClinicSavedMessage] = useState(false);

  useEffect(() => {
    if (state?.clinic) {
      setClinicName(state.clinic.name);
      setClinicPhone(state.clinic.phone);
      setClinicEmail(state.clinic.email);
      setClinicAddress(state.clinic.address);
      setClinicTimezone(state.clinic.timezone);
      setDefaultFollowUpDays(state.clinic.settings?.defaultFollowUpDays || 3);
      setRequireNextAction(state.clinic.settings?.requireNextActionOnOpportunity ?? true);
    }
  }, [state?.clinic]);

  if (!state) return null;

  const handleSaveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingClinic(true);
    try {
      await updateClinic({
        name: clinicName.trim(),
        phone: clinicPhone.trim(),
        email: clinicEmail.trim(),
        address: clinicAddress.trim(),
        timezone: clinicTimezone.trim(),
        settings: {
          autoNextActionAlert: state.clinic.settings?.autoNextActionAlert ?? true,
          defaultFollowUpDays: Number(defaultFollowUpDays) || 3,
          requireNextActionOnOpportunity: requireNextAction,
        },
      });
      setClinicSavedMessage(true);
      setTimeout(() => setClinicSavedMessage(false), 3000);
    } catch (err) {
      console.error('Failed to update clinic:', err);
    } finally {
      setIsSavingClinic(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Deseja restaurar todos os dados da clínica para os valores padrão de demonstração?')) {
      setIsResetting(true);
      await resetDatabase();
      setIsResetting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 tracking-wide uppercase mb-1">
            <Settings className="w-3.5 h-3.5 text-blue-800" />
            <span>Painel Administrativo</span>
          </div>
          <h2 className="text-xl font-bold text-[#0F2042] font-display">
            Configurações do Roones CRM
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie e edite os dados cadastrais da clínica, procedimentos e regras comerciais
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={isResetting}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors shrink-0"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Restaurar Base Demo</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
        {[
          { id: 'clinica', label: 'Dados da Clínica' },
          { id: 'procedimentos', label: 'Procedimentos & Preços' },
          { id: 'automacoes', label: 'Regras de Automação' },
          { id: 'auditoria', label: `Histórico & Auditoria (${state.auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: DADOS DA CLÍNICA (EDITABLE) */}
      {activeTab === 'clinica' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0F2042]" />
                <h3 className="text-base font-bold text-[#0F2042] font-display">
                  Informações Cadastrais da Clínica
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Altere a identificação da clínica, contatos oficiais e regras comerciais padrão.
              </p>
            </div>

            {clinicSavedMessage && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Dados da clínica salvos!</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveClinic} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome da Clinica */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nome da Clínica / Razão Comercial *
                </label>
                <input
                  type="text"
                  required
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="Ex: Roones Clínica de Estética"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white text-xs sm:text-sm"
                />
              </div>

              {/* Telefone Comercial */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Telefone / WhatsApp Comercial *
                </label>
                <input
                  type="text"
                  required
                  value={clinicPhone}
                  onChange={(e) => setClinicPhone(e.target.value)}
                  placeholder="Ex: (11) 3280-9900"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white text-xs sm:text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Email de Contato Comercial *
                </label>
                <input
                  type="email"
                  required
                  value={clinicEmail}
                  onChange={(e) => setClinicEmail(e.target.value)}
                  placeholder="Ex: comercial@roonesclinica.com.br"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white text-xs sm:text-sm"
                />
              </div>

              {/* Fuso Horario */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Fuso Horário
                </label>
                <select
                  value={clinicTimezone}
                  onChange={(e) => setClinicTimezone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white text-xs sm:text-sm"
                >
                  <option value="America/Sao_Paulo">Horário de Brasília (America/Sao_Paulo)</option>
                  <option value="America/Manaus">Amazonas (America/Manaus)</option>
                  <option value="America/Cuiaba">Mato Grosso (America/Cuiaba)</option>
                  <option value="America/Fortaleza">Nordeste (America/Fortaleza)</option>
                </select>
              </div>
            </div>

            {/* Endereco */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Endereço Completo da Clínica
              </label>
              <input
                type="text"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                placeholder="Ex: Av. Brigadeiro Faria Lima, 2800 - Itaim Bibi, São Paulo - SP"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white text-xs sm:text-sm"
              />
            </div>

            {/* Commercial settings */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs">Regras Comerciais da Clínica</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Prazo Padrão de Follow-up (dias)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={defaultFollowUpDays}
                    onChange={(e) => setDefaultFollowUpDays(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Intervalo sugerido após envio de orçamentos ou propostas.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 sm:pt-6">
                  <input
                    type="checkbox"
                    id="requireNextAction"
                    checked={requireNextAction}
                    onChange={(e) => setRequireNextAction(e.target.checked)}
                    className="w-4 h-4 text-blue-900 rounded focus:ring-blue-900"
                  />
                  <label htmlFor="requireNextAction" className="font-medium text-slate-700 cursor-pointer">
                    Exigir próxima ação em todas as oportunidades abertas (Regra SDR)
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingClinic}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0F2042] hover:bg-[#1A365D] text-white font-semibold rounded-xl text-xs sm:text-sm shadow-xs transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingClinic ? 'Salvando...' : 'Salvar Dados da Clínica'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Procedimentos */}
      {activeTab === 'procedimentos' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Procedimentos e Protocolos Cadastrados
            </h3>
            <span className="text-xs text-slate-500">
              {state.procedures.length} procedimentos ativos
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {state.procedures.map((proc) => (
              <div key={proc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 font-display">
                      {proc.name}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {proc.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    {proc.commercialDescription}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 block">Preço de Referência:</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(proc.referencePrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Automacoes */}
      {activeTab === 'automacoes' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0F2042] font-display">
            <ShieldCheck className="w-4 h-4 text-blue-800" />
            <span>Motor de Automações Comerciais</span>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Alerta de Oportunidade sem Próxima Ação',
                desc: 'Se uma oportunidade estiver aberta sem data de retorno cadastrada, sinalizar no Meu Dia e no Pipeline.',
                active: true,
              },
              {
                title: 'Follow-up Automático em 3 Dias',
                desc: 'Após apresentação de orçamento ou proposta, sugerir follow-up comercial em até 72 horas.',
                active: true,
              },
              {
                title: 'Radar de Reativação (+120 dias)',
                desc: 'Identificar pacientes cujo último atendimento excedeu 120 dias e sugerir abordagem personalizada no WhatsApp.',
                active: true,
              },
              {
                title: 'Auditoria Integral de Alterações',
                desc: 'Registrar todas as ações executadas pela IA ou usuária para transparência completa do histórico.',
                active: true,
              },
            ].map((rule, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-900">{rule.title}</div>
                  <p className="text-xs text-slate-500 mt-0.5">{rule.desc}</p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                  Ativa
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Auditoria */}
      {activeTab === 'auditoria' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Trilha de Auditoria e Histórico de Alterações
            </h3>
            <span className="text-xs text-slate-500">
              Registrado pela Iza e Usuário
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {state.auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-slate-500">· {log.entityName}</span>
                    <span className="text-[10px] text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded">
                      {log.author}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5 font-mono text-[11px] truncate max-w-xl">
                    {log.newValue}
                  </p>
                </div>

                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
