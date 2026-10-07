export type PatientStatus = 'lead' | 'em_atendimento' | 'ativo' | 'inativo' | 'perdido';

export type PipelineStage =
  | 'novo_interesse'
  | 'primeiro_contato'
  | 'qualificacao'
  | 'agendamento'
  | 'compareceu'
  | 'proposta'
  | 'aguardando_decisao'
  | 'follow_up'
  | 'fechado'
  | 'perdido'
  | 'reativacao';

export type TaskPriority = 'baixa' | 'normal' | 'alta' | 'urgente';

export type TaskCategory =
  | 'follow-up'
  | 'lead'
  | 'paciente'
  | 'orcamento'
  | 'reativacao'
  | 'administrativo'
  | 'comercial'
  | 'retorno'
  | 'campanha'
  | 'interna'
  | 'outro';

export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada' | 'atrasada';

export type InteractionType =
  | 'lead_recebido'
  | 'mensagem'
  | 'ligacao'
  | 'whatsapp'
  | 'atendimento'
  | 'procedimento'
  | 'orcamento'
  | 'proposta'
  | 'follow_up'
  | 'retorno'
  | 'objecao'
  | 'venda'
  | 'cancelamento'
  | 'reativacao'
  | 'observacao'
  | 'tarefa'
  | 'alteracao_oportunidade';

/**
 * Cliente / Conta que a usuária Camila atende (Clínica, Médica, Profissional)
 */
export interface ClientAccount {
  id: string; // ex: 'cli-camila-silva', 'cli-facedoctor', 'cli-thayline'
  name: string; // ex: 'Clínica Camila Silva'
  shortName: string; // ex: 'Camila Silva'
  type: 'clinica_estetica' | 'consultorio_medico' | 'dermatologia' | 'franquia' | 'outro';
  doctorOrOwner: string; // ex: 'Dra. Camila Silva', 'Augusta / Face Doctor', 'Dra. Thayline Sara'
  contactPerson?: string;
  phone: string;
  email: string;
  address?: string;
  color: string; // Hex color for chips & charts
  badgeBg: string; // Tailwind class
  defaultFollowUpDays: number;
  activeCampaigns?: string[];
  rulesNotes?: string;
  status: 'ativo' | 'pausado' | 'inativo';
  createdAt: string;
}

export interface Patient {
  id: string;
  clientId: string; // Clínica / Cliente da usuária
  clientName?: string;
  clinicId?: string; // Compatibilidade retroativa
  name: string;
  phone: string;
  whatsapp: string;
  email?: string;
  birthDate?: string;
  origin: string;
  tags: string[];
  status: PatientStatus;
  firstContactDate: string;
  lastInteractionDate: string;
  lastAppointmentDate?: string;
  nextAction?: string;
  nextActionDate?: string;
  commercialNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  clientId: string; // Clínica / Cliente
  clientName?: string;
  clinicId?: string; // Compatibilidade retroativa
  patientId: string;
  patientName: string;
  procedureId?: string;
  procedureName: string;
  stage: PipelineStage;
  estimatedValue?: number;
  proposedValue?: number;
  interest?: string;
  objection?: string;
  nextAction?: string;
  nextActionDate?: string;
  assignee?: string;
  notes?: string;
  origin?: string;
  confidenceScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Procedure {
  id: string;
  clientId?: string;
  clientName?: string;
  name: string;
  category: string;
  commercialDescription: string;
  referencePrice: number;
  status: 'ativo' | 'inativo';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  responsible: string;
  clientId?: string; // Opcional! Tarefas internas não possuem cliente vinculado
  clientName?: string;
  patientId?: string;
  patientName?: string;
  opportunityId?: string;
  priority: TaskPriority;
  category: TaskCategory;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  status: TaskStatus;
  origin: 'ia_chat' | 'manual' | 'automacao';
  createdAt: string;
  completedAt?: string;
}

export interface Reminder {
  id: string;
  text: string;
  date: string;
  time?: string;
  clientId?: string;
  clientName?: string;
  patientId?: string;
  patientName?: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface Interaction {
  id: string;
  patientId: string;
  clientId?: string;
  clientName?: string;
  type: InteractionType;
  author: string;
  origin: 'chat_ia' | 'audio' | 'print' | 'manual' | 'sistema';
  content: string;
  date: string;
  metadata?: Record<string, any>;
  attachments?: Array<{
    name: string;
    type: string;
    url?: string;
    preview?: string;
  }>;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  author: string;
  entityType: 'paciente' | 'oportunidade' | 'tarefa' | 'procedimento' | 'lembrete' | 'cliente' | 'usuario';
  entityId: string;
  entityName: string;
  action: string;
  previousValue?: string;
  newValue: string;
  origin: 'chat_ia' | 'interface_manual' | 'automacao';
}

export interface User {
  id: string;
  name: string; // Camila Rocha
  role: 'SDR Comercial Multiclínicas' | 'Gestora de Atendimento' | 'Consultora Comercial';
  email: string;
  phone?: string;
  avatar?: string;
}

// Mantido para compatibilidade onde necessário
export interface Clinic {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  timezone: string;
  settings: {
    autoNextActionAlert: boolean;
    defaultFollowUpDays: number;
    requireNextActionOnOpportunity: boolean;
  };
  createdAt: string;
}

export interface ChatActionExecution {
  type: string;
  description: string;
  entityType?: 'paciente' | 'oportunidade' | 'tarefa' | 'follow_up' | 'procedimento' | 'cliente';
  entityId?: string;
  entityName?: string;
  clientName?: string;
  details?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  audioDuration?: number;
  imageData?: string;
  imageName?: string;
  clientContextId?: string;
  clientContextName?: string;
  actionsExecuted?: ChatActionExecution[];
  suggestedPrompts?: string[];
  pendingConfirmation?: {
    actionType: string;
    description: string;
    payload: any;
  };
}

export interface CRMState {
  currentUser: User;
  clients: ClientAccount[];
  selectedClientId: string; // 'todos' ou ID do cliente selecionado
  patients: Patient[];
  opportunities: Opportunity[];
  procedures: Procedure[];
  tasks: Task[];
  reminders: Reminder[];
  interactions: Interaction[];
  auditLogs: AuditLog[];
  clinic?: Clinic; // Retrocompatibilidade
  chatHistory?: ChatMessage[];
  lastSyncedAt?: string;
}
