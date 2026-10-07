import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CRMState, ChatMessage, Patient, Opportunity, Task, Reminder, Interaction, ClientAccount } from '../types/crm';
import {
  fetchCRMState,
  resetCRMDatabase,
  clearCRMDatabase,
  sendChatMessageAPI,
  updateTaskAPI,
  updateOpportunityAPI,
  createTaskAPI,
  createOpportunityAPI,
  createPatientAPI,
  updatePatientAPI,
  createInteractionAPI,
  createClientAPI,
  updateClientAPI,
  deleteClientAPI,
  updateClinicAPI,
  updateUserAPI,
  fetchChatHistoryAPI,
  clearChatHistoryAPI,
} from '../services/api';

export type ActiveView =
  | 'meu-dia'
  | 'chat'
  | 'clientes'
  | 'pacientes'
  | 'pipeline'
  | 'tarefas'
  | 'follow-ups'
  | 'reativacao'
  | 'relatorios'
  | 'config';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface CRMContextType {
  state: CRMState | null;
  loading: boolean;
  error: string | null;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  // Sincronização & Persistência
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  forceSync: () => Promise<void>;
  clearChat: () => Promise<void>;

  // ==========================================
  // CLIENTES (ENTIDADES DE NÍVEL SUPERIOR)
  // ==========================================
  clients: ClientAccount[];
  activeClient: ClientAccount | null;
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  activeClientId: string;
  setActiveClientId: (id: string) => void;
  getClientById: (id: string) => ClientAccount | undefined;
  getClientByName: (name: string) => ClientAccount | undefined;
  createClient: (data: Partial<ClientAccount>) => Promise<ClientAccount>;
  updateClient: (id: string, data: Partial<ClientAccount>) => Promise<ClientAccount>;
  deleteClient: (id: string) => Promise<boolean>;

  // ==========================================
  // ACESSO A DADOS COM CONTEXTO OBRIGATÓRIO/INFERIDO POR CLIENTE
  // ==========================================
  // 1. Pacientes
  getPatients: (clientId?: string) => Patient[];
  findPatients: (query?: string, clientId?: string) => Patient[];
  findPatient: (nameOrPhoneOrId: string, clientId?: string) => Patient | undefined;
  getPatientById: (id: string, clientId?: string) => Patient | undefined;
  quickCreatePatient: (patient: Partial<Patient>, clientId?: string) => Promise<Patient>;
  quickUpdatePatient: (id: string, updates: Partial<Patient>, clientId?: string) => Promise<void>;

  // 2. Tarefas
  getTasks: (clientId?: string) => Task[];
  quickCreateTask: (task: Partial<Task>, clientId?: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;

  // 3. Oportunidades & Pipeline
  getOpportunities: (clientId?: string) => Opportunity[];
  quickCreateOpportunity: (opp: Partial<Opportunity>, clientId?: string) => Promise<void>;
  moveOpportunityStage: (oppId: string, newStage: Opportunity['stage']) => Promise<void>;

  // 4. Follow-ups
  getFollowUps: (clientId?: string) => Task[];

  // 5. Interações & Timeline
  addInteraction: (data: Partial<Interaction>, clientId?: string) => Promise<void>;

  // ==========================================
  // PACIENTE SELECIONADO & CHAT IZA
  // ==========================================
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  chatMessages: ChatMessage[];
  isChatProcessing: boolean;
  sendChatMessage: (
    text: string,
    audioBase64?: string,
    imageBase64?: string,
    imageName?: string,
    audioDuration?: number
  ) => Promise<void>;

  // ==========================================
  // SISTEMA E RETROCOMPATIBILIDADE
  // ==========================================
  updateClinic: (data: Partial<import('../types/crm').Clinic>) => Promise<void>;
  updateUser: (data: Partial<import('../types/crm').User>) => Promise<void>;
  refreshState: () => Promise<void>;
  resetDatabase: () => Promise<void>;
  clearDatabase: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const CACHE_KEY_STATE = 'roones_crm_state_v2';
const CACHE_KEY_CHAT = 'roones_crm_chat_v2';

function getCachedState(): CRMState | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_STATE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCachedState(state: CRMState | null) {
  try {
    if (state) localStorage.setItem(CACHE_KEY_STATE, JSON.stringify(state));
  } catch {}
}

function getCachedChat(): ChatMessage[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_CHAT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCachedChat(messages: ChatMessage[]) {
  try {
    localStorage.setItem(CACHE_KEY_CHAT, JSON.stringify(messages));
  } catch {}
}

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CRMState | null>(() => getCachedState());
  const [loading, setLoading] = useState<boolean>(() => !getCachedState());
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('meu-dia');
  const [selectedClientId, setSelectedClientId] = useState<string>('todos');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isChatProcessing, setIsChatProcessing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());

  // Chat messages with local cache fallback
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const cached = getCachedChat();
    if (cached && cached.length > 0) return cached;
    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: 'Olá Camila! Sou a Iza, sua assistente operacional comercial do CRM. Estou conectada às suas clínicas e pronta para operar seus atendimentos, cadastrar pacientes, criar tarefas, registrar follow-ups e movimentar pipelines em tempo real.',
        timestamp: new Date().toISOString(),
        suggestedPrompts: [
          'Quem eu preciso chamar hoje?',
          'Cadastrar nova paciente e agendar retorno',
          'Quais oportunidades estão sem próxima ação?',
          'Criar uma tarefa comercial para hoje',
        ],
      },
    ];
  });

  // Keep local storage in sync
  useEffect(() => {
    if (state) {
      setCachedState(state);
    }
  }, [state]);

  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      setCachedChat(chatMessages);
    }
  }, [chatMessages]);

  const refreshState = useCallback(async (silent = false) => {
    if (!silent) setSyncStatus('syncing');
    try {
      const [data, chatData] = await Promise.all([
        fetchCRMState(),
        fetchChatHistoryAPI().catch(() => null),
      ]);
      setState(data);
      setCachedState(data);
      if (chatData && chatData.length > 0) {
        setChatMessages(chatData);
        setCachedChat(chatData);
      }
      setError(null);
      setSyncStatus('synced');
      setLastSyncTime(new Date());
    } catch (err: any) {
      console.error('Error fetching CRM state:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setSyncStatus('offline');
      } else {
        setSyncStatus('error');
      }
      if (!silent) {
        setError(err.message || 'Erro ao carregar dados');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Periodic Polling & Window Focus Auto-Sync (Across different tabs and mobile/desktop browsers)
  useEffect(() => {
    refreshState();

    const handleFocus = () => {
      refreshState(true);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshState(true);
      }
    };

    const handleOnline = () => {
      setSyncStatus('syncing');
      refreshState(false);
    };

    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Heartbeat sync every 12 seconds when active
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && (typeof navigator === 'undefined' || navigator.onLine)) {
        refreshState(true);
      }
    }, 12000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [refreshState]);

  // ==========================================
  // CLIENTES (ENTIDADES DE NÍVEL SUPERIOR)
  // ==========================================
  const clients = useMemo(() => state?.clients || [], [state?.clients]);

  const activeClient = useMemo(() => {
    if (selectedClientId === 'todos') return null;
    return clients.find((c) => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  const getClientById = useCallback(
    (id: string) => clients.find((c) => c.id === id),
    [clients]
  );

  const getClientByName = useCallback(
    (nameQuery: string) => {
      const q = nameQuery.trim().toLowerCase();
      if (!q) return undefined;
      return clients.find(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.shortName.toLowerCase().includes(q) ||
          c.doctorOrOwner.toLowerCase().includes(q) ||
          (c.contactPerson && c.contactPerson.toLowerCase().includes(q))
      );
    },
    [clients]
  );

  const createClient = useCallback(
    async (data: Partial<ClientAccount>): Promise<ClientAccount> => {
      const res = await createClientAPI(data);
      await refreshState();
      return res;
    },
    [refreshState]
  );

  const updateClient = useCallback(
    async (id: string, data: Partial<ClientAccount>): Promise<ClientAccount> => {
      const res = await updateClientAPI(id, data);
      await refreshState();
      return res;
    },
    [refreshState]
  );

  const deleteClient = useCallback(
    async (id: string): Promise<boolean> => {
      const ok = await deleteClientAPI(id);
      if (selectedClientId === id) {
        setSelectedClientId('todos');
      }
      await refreshState();
      return ok;
    },
    [refreshState, selectedClientId]
  );

  // ==========================================
  // ACESSO A PACIENTES COM ESCOPO DE CLIENTE
  // ==========================================
  const getPatients = useCallback(
    (explicitClientId?: string): Patient[] => {
      if (!state) return [];
      // Se explicitClientId fornecido: filtra por ele
      if (explicitClientId && explicitClientId !== 'todos') {
        return state.patients.filter((p) => p.clientId === explicitClientId);
      }
      // Se há cliente ativo em contexto: filtra por ele
      if (selectedClientId !== 'todos') {
        return state.patients.filter((p) => p.clientId === selectedClientId);
      }
      // 'todos': retorna todos os pacientes
      return state.patients;
    },
    [state, selectedClientId]
  );

  const findPatients = useCallback(
    (query?: string, explicitClientId?: string): Patient[] => {
      const pool = getPatients(explicitClientId);
      if (!query || !query.trim()) return pool;
      const q = query.trim().toLowerCase();
      const digits = q.replace(/\D/g, '');
      return pool.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (digits.length >= 4 && p.phone.replace(/\D/g, '').includes(digits)) ||
          p.origin.toLowerCase().includes(q) ||
          (p.clientName && p.clientName.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    },
    [getPatients]
  );

  const findPatient = useCallback(
    (nameOrPhoneOrId: string, explicitClientId?: string): Patient | undefined => {
      const pool = getPatients(explicitClientId);
      if (!nameOrPhoneOrId || !nameOrPhoneOrId.trim()) return undefined;
      const q = nameOrPhoneOrId.trim().toLowerCase();
      const digits = q.replace(/\D/g, '');

      // 1. Busca por ID
      const byId = pool.find((p) => p.id === nameOrPhoneOrId);
      if (byId) return byId;

      // 2. Busca por Telefone
      if (digits.length >= 8) {
        const byPhone = pool.find((p) => p.phone.replace(/\D/g, '').includes(digits));
        if (byPhone) return byPhone;
      }

      // 3. Busca por Nome completo ou primeiro nome
      return pool.find(
        (p) =>
          p.name.toLowerCase() === q ||
          p.name.toLowerCase().includes(q) ||
          p.name.split(' ')[0].toLowerCase() === q
      );
    },
    [getPatients]
  );

  const getPatientById = useCallback(
    (id: string, explicitClientId?: string): Patient | undefined => {
      const pool = getPatients(explicitClientId);
      return pool.find((p) => p.id === id);
    },
    [getPatients]
  );

  const quickCreatePatient = useCallback(
    async (patient: Partial<Patient>, explicitClientId?: string): Promise<Patient> => {
      // Regra de segurança multicliente: exige ou infere clientId obrigatoriamente
      const resolvedClientId =
        patient.clientId ||
        explicitClientId ||
        (selectedClientId !== 'todos' ? selectedClientId : undefined) ||
        clients[0]?.id ||
        'cli-camila-silva';

      const targetClient = clients.find((c) => c.id === resolvedClientId);
      const clientName = targetClient ? targetClient.name : patient.clientName || 'Clínica Parceira';

      const payload: Partial<Patient> = {
        ...patient,
        clientId: resolvedClientId,
        clientName,
      };

      const res = await createPatientAPI(payload);
      await refreshState();
      return res;
    },
    [clients, selectedClientId, refreshState]
  );

  const quickUpdatePatient = useCallback(
    async (id: string, updates: Partial<Patient>, explicitClientId?: string) => {
      if (explicitClientId && explicitClientId !== 'todos') {
        const current = state?.patients.find((p) => p.id === id);
        if (current && current.clientId !== explicitClientId) {
          console.warn(`Tentativa de atualizar paciente de outra conta (${current.clientId} !== ${explicitClientId})`);
          return;
        }
      }
      await updatePatientAPI(id, updates);
      await refreshState();
    },
    [state?.patients, refreshState]
  );

  // ==========================================
  // ACESSO A TAREFAS COM ESCOPO DE CLIENTE
  // ==========================================
  const getTasks = useCallback(
    (explicitClientId?: string): Task[] => {
      if (!state) return [];
      if (explicitClientId && explicitClientId !== 'todos') {
        return state.tasks.filter((t) => t.clientId === explicitClientId);
      }
      if (selectedClientId !== 'todos') {
        return state.tasks.filter((t) => t.clientId === selectedClientId);
      }
      return state.tasks;
    },
    [state, selectedClientId]
  );

  const quickCreateTask = useCallback(
    async (task: Partial<Task>, explicitClientId?: string) => {
      let resolvedClientId = task.clientId || explicitClientId;
      let resolvedClientName = task.clientName;

      // 1. Se tem patientId, herda OBRIGATORIAMENTE o cliente da paciente
      if (task.patientId) {
        const pat = state?.patients.find((p) => p.id === task.patientId);
        if (pat) {
          resolvedClientId = pat.clientId;
          resolvedClientName = pat.clientName;
          if (!task.patientName) task.patientName = pat.name;
        }
      }

      // 2. Se não tem cliente e há cliente ativo selecionado (!== 'todos') e não é categoria interna
      if (!resolvedClientId && selectedClientId !== 'todos' && task.category !== 'interna') {
        resolvedClientId = selectedClientId;
        const cl = clients.find((c) => c.id === selectedClientId);
        resolvedClientName = cl?.name;
      }

      // 3. Se foi passado ID mas não nome, busca nome do cliente
      if (resolvedClientId && !resolvedClientName) {
        const cl = clients.find((c) => c.id === resolvedClientId);
        resolvedClientName = cl?.name;
      }

      // 4. Se não tem cliente nem paciente e não for interna, define como tarefa interna da SDR
      const isInternal = task.category === 'interna' || (!resolvedClientId && !task.patientId);

      const payload: Partial<Task> = {
        ...task,
        clientId: isInternal ? undefined : resolvedClientId,
        clientName: isInternal ? undefined : resolvedClientName,
        category: isInternal ? 'interna' : (task.category || 'comercial'),
      };

      await createTaskAPI(payload);
      await refreshState();
    },
    [state?.patients, selectedClientId, clients, refreshState]
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      try {
        await updateTaskAPI(taskId, { status: 'concluida' });
        await refreshState();
      } catch (err) {
        console.error('Failed to complete task:', err);
      }
    },
    [refreshState]
  );

  // ==========================================
  // ACESSO A OPORTUNIDADES COM ESCOPO DE CLIENTE
  // ==========================================
  const getOpportunities = useCallback(
    (explicitClientId?: string): Opportunity[] => {
      if (!state) return [];
      if (explicitClientId && explicitClientId !== 'todos') {
        return state.opportunities.filter((o) => o.clientId === explicitClientId);
      }
      if (selectedClientId !== 'todos') {
        return state.opportunities.filter((o) => o.clientId === selectedClientId);
      }
      return state.opportunities;
    },
    [state, selectedClientId]
  );

  const quickCreateOpportunity = useCallback(
    async (opp: Partial<Opportunity>, explicitClientId?: string) => {
      let resolvedClientId = opp.clientId || explicitClientId;
      let resolvedClientName = opp.clientName;

      // 1. Se tem patientId, herda OBRIGATORIAMENTE o cliente da paciente
      if (opp.patientId) {
        const pat = state?.patients.find((p) => p.id === opp.patientId);
        if (pat) {
          resolvedClientId = pat.clientId;
          resolvedClientName = pat.clientName;
          if (!opp.patientName) opp.patientName = pat.name;
        }
      }

      // 2. Se não tem cliente e há cliente ativo selecionado
      if (!resolvedClientId && selectedClientId !== 'todos') {
        resolvedClientId = selectedClientId;
      }

      // 3. Fallback para primeira clínica
      if (!resolvedClientId) {
        resolvedClientId = clients[0]?.id || 'cli-camila-silva';
      }

      const cl = clients.find((c) => c.id === resolvedClientId);
      resolvedClientName = cl ? cl.name : resolvedClientName || 'Clínica Parceira';

      const payload: Partial<Opportunity> = {
        ...opp,
        clientId: resolvedClientId,
        clientName: resolvedClientName,
      };

      await createOpportunityAPI(payload);
      await refreshState();
    },
    [state?.patients, selectedClientId, clients, refreshState]
  );

  const moveOpportunityStage = useCallback(
    async (oppId: string, newStage: Opportunity['stage']) => {
      try {
        await updateOpportunityAPI(oppId, { stage: newStage });
        await refreshState();
      } catch (err) {
        console.error('Failed to move stage:', err);
      }
    },
    [refreshState]
  );

  // ==========================================
  // ACESSO A FOLLOW-UPS E INTERAÇÕES
  // ==========================================
  const getFollowUps = useCallback(
    (explicitClientId?: string): Task[] => {
      const pool = getTasks(explicitClientId);
      return pool.filter(
        (t) =>
          t.category === 'follow-up' ||
          t.title.toLowerCase().includes('follow-up') ||
          t.title.toLowerCase().includes('retornar')
      );
    },
    [getTasks]
  );

  const addInteraction = useCallback(
    async (data: Partial<Interaction>, explicitClientId?: string) => {
      let resolvedClientId = data.clientId || explicitClientId;
      let resolvedClientName = data.clientName;

      if (data.patientId) {
        const pat = state?.patients.find((p) => p.id === data.patientId);
        if (pat) {
          resolvedClientId = pat.clientId;
          resolvedClientName = pat.clientName;
        }
      } else if (!resolvedClientId && selectedClientId !== 'todos') {
        resolvedClientId = selectedClientId;
        resolvedClientName = clients.find((c) => c.id === selectedClientId)?.name;
      }

      await createInteractionAPI({
        ...data,
        clientId: resolvedClientId,
        clientName: resolvedClientName,
      });
      await refreshState();
    },
    [state?.patients, selectedClientId, clients, refreshState]
  );

  // ==========================================
  // CHAT COM A ASSISTENTE IZA
  // ==========================================
  const sendChatMessage = useCallback(
    async (
      text: string,
      audioBase64?: string,
      imageBase64?: string,
      imageName?: string,
      audioDuration?: number
    ) => {
      const userMsgId = `msg-user-${Date.now()}`;
      const newUserMsg: ChatMessage = {
        id: userMsgId,
        sender: 'user',
        text,
        timestamp: new Date().toISOString(),
        audioDuration,
        imageData: imageBase64,
        imageName,
        clientContextId: selectedClientId !== 'todos' ? selectedClientId : undefined,
        clientContextName: activeClient ? activeClient.name : undefined,
      };

      setChatMessages((prev) => [...prev, newUserMsg]);
      setIsChatProcessing(true);
      setSyncStatus('syncing');

      try {
        const history = chatMessages.slice(-6).map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
          parts: [{ text: m.text }],
        }));

        const response = await sendChatMessageAPI(
          text,
          history,
          imageBase64,
          undefined,
          selectedClientId !== 'todos' ? selectedClientId : undefined,
          newUserMsg
        );

        if (response.success && response.data) {
          const aiMsg: ChatMessage = response.assistantMessage || {
            id: `msg-ai-${Date.now()}`,
            sender: 'assistant',
            text: response.data.reply,
            timestamp: new Date().toISOString(),
            actionsExecuted: response.data.actionsExecuted,
            suggestedPrompts: response.data.suggestedPrompts,
            pendingConfirmation: response.data.pendingConfirmation,
            clientContextId: response.data.clientContextId || (selectedClientId !== 'todos' ? selectedClientId : undefined),
            clientContextName: response.data.clientContextName || (activeClient ? activeClient.name : undefined),
          };
          setChatMessages((prev) => [...prev, aiMsg]);

          if (response.updatedState) {
            setState(response.updatedState);
            setCachedState(response.updatedState);
          } else {
            await refreshState(true);
          }
          setSyncStatus('synced');
          setLastSyncTime(new Date());
        }
      } catch (err: any) {
        console.error('Error in sendChatMessage:', err);
        const errorMsg: ChatMessage = {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Desculpe, ocorreu uma instabilidade na comunicação. Nenhuma alteração incorreta foi aplicada no CRM. Poderia repetir a instrução?',
          timestamp: new Date().toISOString(),
        };
        setChatMessages((prev) => [...prev, errorMsg]);
        setSyncStatus('error');
      } finally {
        setIsChatProcessing(false);
      }
    },
    [chatMessages, selectedClientId, activeClient, refreshState]
  );

  const updateClinic = useCallback(
    async (data: Partial<import('../types/crm').Clinic>) => {
      await updateClinicAPI(data);
      await refreshState();
    },
    [refreshState]
  );

  const updateUser = useCallback(
    async (data: Partial<import('../types/crm').User>) => {
      await updateUserAPI(data);
      await refreshState();
    },
    [refreshState]
  );

  const resetDatabase = useCallback(async () => {
    setLoading(true);
    setSyncStatus('syncing');
    try {
      const fresh = await resetCRMDatabase();
      await clearChatHistoryAPI().catch(() => {});
      setState(fresh);
      setCachedState(fresh);
      setSelectedClientId('todos');
      const resetMsg: ChatMessage = {
        id: `msg-reset-${Date.now()}`,
        sender: 'assistant',
        text: 'Banco de dados restaurado para o estado limpo inicial. Tudo pronto para novos atendimentos reais!',
        timestamp: new Date().toISOString(),
        suggestedPrompts: [
          'Quem eu preciso chamar hoje?',
          'Cadastrar nova paciente e agendar retorno',
          'Quais oportunidades estão sem próxima ação?',
          'Criar uma tarefa comercial para hoje',
        ],
      };
      setChatMessages([resetMsg]);
      setCachedChat([resetMsg]);
      setSyncStatus('synced');
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Failed to reset db:', err);
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDatabase = useCallback(async () => {
    setLoading(true);
    setSyncStatus('syncing');
    try {
      const fresh = await clearCRMDatabase();
      await clearChatHistoryAPI().catch(() => {});
      setState(fresh);
      setCachedState(fresh);
      setSelectedClientId('todos');
      const clearMsg: ChatMessage = {
        id: `msg-clear-${Date.now()}`,
        sender: 'assistant',
        text: 'Base de dados limpa com sucesso! Todos os registros fictícios foram removidos. O CRM está 100% pronto para a operação real das suas clínicas.',
        timestamp: new Date().toISOString(),
        suggestedPrompts: [
          'Quem eu preciso chamar hoje?',
          'Cadastrar nova paciente e agendar retorno',
          'Quais oportunidades estão sem próxima ação?',
          'Criar uma tarefa comercial para hoje',
        ],
      };
      setChatMessages([clearMsg]);
      setCachedChat([clearMsg]);
      setSyncStatus('synced');
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Failed to clear db:', err);
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearChat = useCallback(async () => {
    try {
      await clearChatHistoryAPI();
      const welcome: ChatMessage = {
        id: `msg-welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Histórico de conversa reiniciado. Como posso te ajudar na operação comercial agora?',
        timestamp: new Date().toISOString(),
        suggestedPrompts: [
          'Quem eu preciso chamar hoje?',
          'Cadastrar nova paciente e agendar retorno',
          'Quais oportunidades estão sem próxima ação?',
          'Criar uma tarefa comercial para hoje',
        ],
      };
      setChatMessages([welcome]);
      setCachedChat([welcome]);
    } catch (err) {
      console.error('Erro ao limpar chat:', err);
    }
  }, []);

  const forceSync = useCallback(async () => {
    await refreshState(false);
  }, [refreshState]);

  return (
    <CRMContext.Provider
      value={{
        state,
        loading,
        error,
        activeView,
        setActiveView,

        // Sincronização & Persistência
        syncStatus,
        lastSyncTime,
        forceSync,
        clearChat,

        // Clientes
        clients,
        activeClient,
        selectedClientId,
        setSelectedClientId,
        activeClientId: selectedClientId,
        setActiveClientId: setSelectedClientId,
        getClientById,
        getClientByName,
        createClient,
        updateClient,
        deleteClient,

        // Pacientes
        getPatients,
        findPatients,
        findPatient,
        getPatientById,
        quickCreatePatient,
        quickUpdatePatient,

        // Tarefas
        getTasks,
        quickCreateTask,
        completeTask,

        // Oportunidades & Pipeline
        getOpportunities,
        quickCreateOpportunity,
        moveOpportunityStage,

        // Follow-ups
        getFollowUps,

        // Interações
        addInteraction,

        // Seleção & Chat
        selectedPatientId,
        setSelectedPatientId,
        chatMessages,
        isChatProcessing,
        sendChatMessage,

        // Sistema
        updateClinic,
        updateUser,
        refreshState,
        resetDatabase,
        clearDatabase,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within a CRMProvider');
  return context;
};
