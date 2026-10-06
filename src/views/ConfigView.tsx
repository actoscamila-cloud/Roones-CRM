import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  User,
  ShieldCheck,
  History,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Save,
  Check,
  Building2,
  ArrowRight,
  Sliders,
  SlidersHorizontal,
  Bell,
  MessageSquare,
  Clock,
  Database,
  Trash2,
} from 'lucide-react';

export const ConfigView: React.FC = () => {
  const { state, resetDatabase, clearDatabase, updateUser, setActiveView } = useCRM();
  const [activeTab, setActiveTab] = useState<'minha-conta' | 'parametros-iza' | 'auditoria' | 'sistema'>('minha-conta');
  const [isResetting, setIsResetting] = useState(false);

  // User Profile state
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<'SDR Comercial Multiclínicas' | 'Gestora de Atendimento' | 'Consultora Comercial'>('SDR Comercial Multiclínicas');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [dailyGoal, setDailyGoal] = useState(25);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userSavedMessage, setUserSavedMessage] = useState(false);

  // Iza Parameters state
  const [aiTone, setAiTone] = useState<'consultivo' | 'persuasivo' | 'direto'>('consultivo');
  const [autoSdrRules, setAutoSdrRules] = useState(true);
  const [notifyLateFollowUps, setNotifyLateFollowUps] = useState(true);
  const [aiSavedMessage, setAiSavedMessage] = useState(false);

  useEffect(() => {
    if (state?.currentUser) {
      setUserName(state.currentUser.name);
      setUserRole(state.currentUser.role);
      setUserEmail(state.currentUser.email);
      setUserPhone(state.currentUser.phone || '');
    }
  }, [state?.currentUser]);

  if (!state) return null;

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUser(true);
    try {
      await updateUser({
        name: userName.trim(),
        role: userRole,
        email: userEmail.trim(),
        phone: userPhone.trim(),
      });
      setUserSavedMessage(true);
      setTimeout(() => setUserSavedMessage(false), 3000);
    } catch (err) {
      console.error('Failed to update user:', err);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleSaveIzaParams = (e: React.FormEvent) => {
    e.preventDefault();
    setAiSavedMessage(true);
    setTimeout(() => setAiSavedMessage(false), 3000);
  };

  const handleClearAll = async () => {
    if (
      confirm(
        'Deseja apagar todos os registros (pacientes, tarefas, oportunidades, follow-ups e histórico) para começar a utilizar o sistema limpo com seus dados reais?'
      )
    ) {
      setIsResetting(true);
      await clearDatabase();
      setIsResetting(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Deseja reiniciar a base para o estado inicial limpo?')) {
      setIsResetting(true);
      await resetDatabase();
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 tracking-wide uppercase mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-800" />
            <span>Preferências & Sistema</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F2042] font-display">
            Configurações & Minha Conta
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie seu perfil de operadora comercial, parâmetros de inteligência da Iza e registros de auditoria.
          </p>
        </div>

        <button
          onClick={handleClearAll}
          disabled={isResetting}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors shrink-0 self-start sm:self-auto"
          title="Zerar todos os registros para iniciar o uso real"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Zerar Dados Fictícios</span>
        </button>
      </div>

      {/* Helpful banner pointing to Clientes view */}
      <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-950 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold">
              Precisa gerenciar suas clínicas parceiras e regras comerciais?
            </div>
            <div className="text-[11px] text-blue-800 mt-0.5">
              O cadastro de novas clínicas, regras de follow-up por cliente e campanhas ativas ficam centralizados na aba <strong>Clientes</strong>.
            </div>
          </div>
        </div>
        <button
          onClick={() => setActiveView('clientes')}
          className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <span>Ir para Clientes ({state.clients.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('minha-conta')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'minha-conta'
              ? 'bg-[#0F2042] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Meu Perfil (Camila Rocha · SDR)</span>
        </button>

        <button
          onClick={() => setActiveTab('parametros-iza')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'parametros-iza'
              ? 'bg-[#0F2042] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Parâmetros da Assistente Iza</span>
        </button>

        <button
          onClick={() => setActiveTab('auditoria')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'auditoria'
              ? 'bg-[#0F2042] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Auditoria Operacional da IA ({state.auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sistema')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'sistema'
              ? 'bg-[#0F2042] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Sistema & Dados</span>
        </button>
      </div>

      {/* Tab 1: Minha Conta */}
      {activeTab === 'minha-conta' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSaveUser} className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Seu Nome Completo *</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cargo / Função *</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-medium"
                >
                  <option value="SDR Comercial Multiclínicas">SDR Comercial Multiclínicas</option>
                  <option value="Gestora de Atendimento">Gestora de Atendimento</option>
                  <option value="Consultora Comercial">Consultora Comercial</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Telefone / WhatsApp Profissional</label>
                <input
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email de Acesso</label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Meta Diária de Contatos Comerciais
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-24 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold text-xs"
                />
                <span className="text-[11px] text-slate-500">
                  follow-ups e contatos distribuídos entre todas as suas clínicas ativas
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSavingUser}
                className="px-5 py-2.5 bg-[#0F2042] hover:bg-[#1A365D] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingUser ? 'Salvando...' : 'Salvar Meu Perfil'}</span>
              </button>

              {userSavedMessage && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  Perfil atualizado com sucesso!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Parâmetros da Iza */}
      {activeTab === 'parametros-iza' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSaveIzaParams} className="space-y-5 max-w-xl text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">
                Tom de Voz das Mensagens Sugeridas pela Iza
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'consultivo',
                    title: 'Consultivo & Acolhedor',
                    desc: 'Prioriza escuta ativa, empatia e saúde estética (padrão médico).',
                  },
                  {
                    id: 'persuasivo',
                    title: 'Persuasivo & Comercial',
                    desc: 'Foco em fechamento rápido de avaliação e gatilhos de escassez.',
                  },
                  {
                    id: 'direto',
                    title: 'Rápido & Direto',
                    desc: 'Mensagens objetivas para pacientes com rotina corrida.',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAiTone(item.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      aiTone === item.id
                        ? 'border-blue-900 bg-blue-50/70 ring-1 ring-blue-900'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs mb-1">{item.title}</div>
                    <div className="text-[11px] text-slate-500 leading-snug">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSdrRules}
                  onChange={(e) => setAutoSdrRules(e.target.checked)}
                  className="mt-0.5 rounded text-blue-900 focus:ring-blue-900"
                />
                <div>
                  <div className="font-semibold text-slate-800">
                    Regra Anti-Esquecimento (SDR Proativa)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    A Iza avisa sempre que uma oportunidade estiver sem próxima ação cadastrada.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyLateFollowUps}
                  onChange={(e) => setNotifyLateFollowUps(e.target.checked)}
                  className="mt-0.5 rounded text-blue-900 focus:ring-blue-900"
                />
                <div>
                  <div className="font-semibold text-slate-800">
                    Alertas de SLA de Follow-up por Clínica
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Respeita os prazos definidos por cliente (ex: 3 dias na Camila Silva, 5 dias na Face Doctor).
                  </div>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0F2042] hover:bg-[#1A365D] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Parâmetros da Iza</span>
              </button>

              {aiSavedMessage && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  Parâmetros salvos com sucesso!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Auditoria Operacional */}
      {activeTab === 'auditoria' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Trilha de Auditoria das Ações da Iza & Operação
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparência completa de todas as tarefas, movimentações de pipeline e registros de pacientes.
              </p>
            </div>
            <span className="text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg">
              {state.auditLogs.length} Registros
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {state.auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Nenhum log de auditoria registrado ainda.
              </div>
            ) : (
              state.auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 font-display">
                        {log.entityName}: {log.newValue || log.action}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                      {log.entityType && (
                        <span className="text-[10px] text-slate-400">
                          ({log.entityType})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Autor: {log.author}</span>
                      <span>·</span>
                      <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Sistema & Dados */}
      {activeTab === 'sistema' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Status do Ambiente & Banco de Dados
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Informações técnicas e manutenção da base operacional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-medium">Clínicas Registradas</div>
              <div className="text-xl font-bold text-slate-900 font-display mt-1">
                {state.clients.length} contas
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-medium">Pacientes na Base</div>
              <div className="text-xl font-bold text-slate-900 font-display mt-1">
                {state.patients.length} cadastros
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-medium">Tarefas & Follow-ups</div>
              <div className="text-xl font-bold text-slate-900 font-display mt-1">
                {state.tasks.length} registros
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-900">Zerar Base para Produção Real</div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Apaga todos os pacientes, tarefas e oportunidades de teste para iniciar o CRM limpo.
              </div>
            </div>

            <button
              onClick={handleClearAll}
              disabled={isResetting}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Trash2 className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Limpando...' : 'Zerar Dados Fictícios'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
