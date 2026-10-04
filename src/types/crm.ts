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

export interface Patient {
  id: string;
  clinicId: string;
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
  clinicId: string;
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
  assignee: string;
  notes?: string;
  origin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Procedure {
  id: string;
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
  patientId?: string;
  patientName?: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface Interaction {
  id: string;
  patientId: string;
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
  entityType: 'paciente' | 'oportunidade' | 'tarefa' | 'procedimento' | 'lembrete' | 'clinica' | 'usuario';
  entityId: string;
  entityName: string;
  action: string;
  previousValue?: string;
  newValue: string;
  origin: 'chat_ia' | 'interface_manual' | 'automacao';
}

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

export interface User {
  id: string;
  name: string;
  role: 'SDR' | 'Gestor' | 'Administrador';
  email: string;
  clinicId: string;
  avatar?: string;
}

export interface ChatActionExecution {
  type: string;
  description: string;
  entityType?: 'paciente' | 'oportunidade' | 'tarefa' | 'follow_up' | 'procedimento';
  entityId?: string;
  entityName?: string;
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
  actionsExecuted?: ChatActionExecution[];
  suggestedPrompts?: string[];
  pendingConfirmation?: {
    actionType: string;
    description: string;
    payload: any;
  };
}

export interface CRMState {
  clinic: Clinic;
  currentUser: User;
  patients: Patient[];
  opportunities: Opportunity[];
  procedures: Procedure[];
  tasks: Task[];
  reminders: Reminder[];
  interactions: Interaction[];
  auditLogs: AuditLog[];
}
