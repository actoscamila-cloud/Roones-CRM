import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CRMState, ChatMessage, Patient, Opportunity, Task, Reminder, Interaction } from '../types/crm';
import {
  fetchCRMState,
  resetCRMDatabase,
  sendChatMessageAPI,
  updateTaskAPI,
  updateOpportunityAPI,
  createTaskAPI,
  createOpportunityAPI,
  createPatientAPI,
  updatePatientAPI,
  createInteractionAPI,
  updateClinicAPI,
  updateUserAPI,
} from '../services/api';

export type ActiveView =
  | 'meu-dia'
  | 'chat'
  | 'pacientes'
  | 'pipeline'
  | 'tarefas'
  | 'follow-ups'
  | 'reativacao'
  | 'config';

interface CRMContextType {
  state: CRMState | null;
  loading: boolean;
  error: string | null;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  chatMessages: ChatMessage[];
  isChatProcessing: boolean;
  sendChatMessage: (text: string, audioBase64?: string, imageBase64?: string, imageName?: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  moveOpportunityStage: (oppId: string, newStage: Opportunity['stage']) => Promise<void>;
  quickCreateTask: (task: Partial<Task>) => Promise<void>;
  quickCreateOpportunity: (opp: Partial<Opportunity>) => Promise<void>;
  quickCreatePatient: (patient: Partial<Patient>) => Promise<Patient>;
  quickUpdatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  addInteraction: (data: Partial<Interaction>) => Promise<void>;
  updateClinic: (data: Partial<import('../types/crm').Clinic>) => Promise<void>;
  updateUser: (data: Partial<import('../types/crm').User>) => Promise<void>;
  refreshState: () => Promise<void>;
  resetDatabase: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CRMState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('meu-dia');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isChatProcessing, setIsChatProcessing] = useState<boolean>(false);

  // Initial welcome message from AI
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Olá Camila! Sou a assistente inteligente do Roones CRM. Você pode me contar por voz, texto ou print o que conversou com suas pacientes e eu organizo tudo no sistema automaticamente.',
      timestamp: '2026-10-04T08:00:00.000Z',
      suggestedPrompts: [
        'Quem eu preciso chamar hoje?',
        'Falei agora com a Juliana...',
        'Cadastre a Mariana do Instagram',
        'Resume a jornada da Fernanda',
      ],
    },
  ]);

  const refreshState = useCallback(async () => {
    try {
      const data = await fetchCRMState();
      setState(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching CRM state:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const sendChatMessage = async (
    text: string,
    audioBase64?: string,
    imageBase64?: string,
    imageName?: string
  ) => {
    const userMsgId = `msg-user-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      imageData: imageBase64,
      imageName,
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setIsChatProcessing(true);

    try {
      // Build conversation history for API
      const history = chatMessages.slice(-6).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: m.text }],
      }));

      const response = await sendChatMessageAPI(text, history, imageBase64);

      if (response.success && response.data) {
        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          text: response.data.reply,
          timestamp: new Date().toISOString(),
          actionsExecuted: response.data.actionsExecuted,
          suggestedPrompts: response.data.suggestedPrompts,
          pendingConfirmation: response.data.pendingConfirmation,
        };
        setChatMessages((prev) => [...prev, aiMsg]);

        // CRITICAL SYNC: Update application state with freshly returned state from server
        if (response.updatedState) {
          setState(response.updatedState);
        } else {
          await refreshState();
        }
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
    } finally {
      setIsChatProcessing(false);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      await updateTaskAPI(taskId, { status: 'concluida' });
      await refreshState();
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const moveOpportunityStage = async (oppId: string, newStage: Opportunity['stage']) => {
    try {
      await updateOpportunityAPI(oppId, { stage: newStage });
      await refreshState();
    } catch (err) {
      console.error('Failed to move stage:', err);
    }
  };

  const quickCreateTask = async (task: Partial<Task>) => {
    try {
      await createTaskAPI(task);
      await refreshState();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const quickCreateOpportunity = async (opp: Partial<Opportunity>) => {
    try {
      await createOpportunityAPI(opp);
      await refreshState();
    } catch (err) {
      console.error('Failed to create opportunity:', err);
    }
  };

  const quickCreatePatient = async (patient: Partial<Patient>): Promise<Patient> => {
    const res = await createPatientAPI(patient);
    await refreshState();
    return res;
  };

  const quickUpdatePatient = async (id: string, updates: Partial<Patient>) => {
    await updatePatientAPI(id, updates);
    await refreshState();
  };

  const addInteraction = async (data: Partial<Interaction>) => {
    await createInteractionAPI(data);
    await refreshState();
  };

  const updateClinic = async (data: Partial<import('../types/crm').Clinic>) => {
    await updateClinicAPI(data);
    await refreshState();
  };

  const updateUser = async (data: Partial<import('../types/crm').User>) => {
    await updateUserAPI(data);
    await refreshState();
  };

  const resetDatabase = async () => {
    setLoading(true);
    try {
      const fresh = await resetCRMDatabase();
      setState(fresh);
      setChatMessages([
        {
          id: `msg-reset-${Date.now()}`,
          sender: 'assistant',
          text: 'Banco de dados restaurado para os dados originais da clínica. Tudo pronto para novos testes!',
          timestamp: new Date().toISOString(),
          suggestedPrompts: [
            'Quem eu preciso chamar hoje?',
            'Falei agora com a Juliana...',
            'Resume a jornada da Fernanda',
          ],
        },
      ]);
    } catch (err) {
      console.error('Failed to reset db:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CRMContext.Provider
      value={{
        state,
        loading,
        error,
        activeView,
        setActiveView,
        selectedPatientId,
        setSelectedPatientId,
        chatMessages,
        isChatProcessing,
        sendChatMessage,
        completeTask,
        moveOpportunityStage,
        quickCreateTask,
        quickCreateOpportunity,
        quickCreatePatient,
        quickUpdatePatient,
        addInteraction,
        updateClinic,
        updateUser,
        refreshState,
        resetDatabase,
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
