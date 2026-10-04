import { CRMState, Patient, Opportunity, Procedure, Task, Reminder, Interaction, AuditLog, Clinic, User } from '../types/crm';

export const initialClinic: Clinic = {
  id: 'clinic-lumina-01',
  name: 'Clínica Lumina Estética & Dermatologia',
  phone: '(11) 3280-9900',
  email: 'comercial@clinicalumina.com.br',
  address: 'Av. Brigadeiro Faria Lima, 2800 - Itaim Bibi, São Paulo - SP',
  timezone: 'America/Sao_Paulo',
  settings: {
    autoNextActionAlert: true,
    defaultFollowUpDays: 3,
    requireNextActionOnOpportunity: true,
  },
  createdAt: '2026-01-10T08:00:00.000Z',
};

export const initialUser: User = {
  id: 'user-camila-01',
  name: 'Camila Rocha',
  role: 'SDR',
  email: 'camila.sdr@clinicalumina.com.br',
  clinicId: 'clinic-lumina-01',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
};

export const initialProcedures: Procedure[] = [
  {
    id: 'proc-botox',
    name: 'Botox Terço Superior',
    category: 'Injetáveis',
    commercialDescription: 'Toxina botulínica para rugas dinâmicas da testa, glabela e pés de galinha. Duração média 4 a 6 meses.',
    referencePrice: 1800,
    status: 'ativo',
  },
  {
    id: 'proc-olheiras',
    name: 'Preenchimento de Olheiras',
    category: 'Injetáveis',
    commercialDescription: 'Ácido hialurônico de baixa densidade para volumização da calha lacrimal e aspecto descansado.',
    referencePrice: 2400,
    status: 'ativo',
  },
  {
    id: 'proc-labial',
    name: 'Preenchimento Labial',
    category: 'Injetáveis',
    commercialDescription: 'Definição do contorno e hidratação volumétrica dos lábios com ácido hialurônico premium.',
    referencePrice: 2200,
    status: 'ativo',
  },
  {
    id: 'proc-sculptra',
    name: 'Bioestimulador Sculptra Facial',
    category: 'Bioestimuladores',
    commercialDescription: 'Ácido poli-L-láctico para estímulo intenso de colágeno natural, melhora do contorno e sustentação.',
    referencePrice: 3800,
    status: 'ativo',
  },
  {
    id: 'proc-radiesse',
    name: 'Bioestimulador Radiesse',
    category: 'Bioestimuladores',
    commercialDescription: 'Hidroxiapatita de cálcio para efeito lifting imediato e estímulo prolongado de colágeno.',
    referencePrice: 3500,
    status: 'ativo',
  },
  {
    id: 'proc-ultraformer',
    name: 'Ultraformer III Full Face',
    category: 'Tecnologias',
    commercialDescription: 'Ultrassom micro e macrofocado para ancoragem muscular e retração da flacidez facial e pescoço.',
    referencePrice: 4200,
    status: 'ativo',
  },
  {
    id: 'proc-limpeza',
    name: 'Limpeza de Pele Fotônica',
    category: 'Tratamentos Faciais',
    commercialDescription: 'Higienização profunda com extração por sucção, peeling de diamante e ledterapia cicatrizante.',
    referencePrice: 380,
    status: 'ativo',
  },
];

export const initialPatients: Patient[] = [
  {
    id: 'pat-juliana',
    clinicId: 'clinic-lumina-01',
    name: 'Juliana Castro',
    phone: '(11) 98765-4321',
    whatsapp: '5511987654321',
    email: 'juliana.castro@gmail.com',
    origin: 'Indicação',
    tags: ['Injetáveis', 'Botox Realizado', 'Interesse Olheiras'],
    status: 'ativo',
    firstContactDate: '2026-09-15T10:00:00.000Z',
    lastInteractionDate: '2026-10-02T16:30:00.000Z',
    lastAppointmentDate: '2026-10-02T15:00:00.000Z',
    nextAction: 'Ligar para follow-up sobre preenchimento de olheira',
    nextActionDate: '2026-10-11T14:00:00.000Z',
    commercialNotes: 'Muito exigente com naturalidade. Amou o resultado do Botox. Mencionou que no mês que vem deve estar mais tranquila no trabalho para fazer olheiras.',
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-10-02T16:30:00.000Z',
  },
  {
    id: 'pat-fernanda',
    clinicId: 'clinic-lumina-01',
    name: 'Fernanda Lima',
    phone: '(11) 97654-3210',
    whatsapp: '5511976543210',
    email: 'fernanda.lima@outlook.com',
    origin: 'Instagram',
    tags: ['Bioestimulador', 'Follow-up Quente'],
    status: 'em_atendimento',
    firstContactDate: '2026-08-20T11:00:00.000Z',
    lastInteractionDate: '2026-10-03T17:15:00.000Z',
    lastAppointmentDate: '2026-09-05T14:00:00.000Z',
    nextAction: 'Enviar condição especial do Sculptra e agendar sessão',
    nextActionDate: '2026-10-05T10:30:00.000Z',
    commercialNotes: 'Já fez Botox no mês passado. Quer firmeza no terço inferior. Conversou sobre parcelamento em até 10x.',
    createdAt: '2026-08-20T11:00:00.000Z',
    updatedAt: '2026-10-03T17:15:00.000Z',
  },
  {
    id: 'pat-ana',
    clinicId: 'clinic-lumina-01',
    name: 'Ana Beatriz Silveira',
    phone: '(11) 99123-4567',
    whatsapp: '5511991234567',
    email: 'anabeatriz.s@uol.com.br',
    origin: 'Google',
    tags: ['Orçamento Pendente', 'Ultraformer'],
    status: 'em_atendimento',
    firstContactDate: '2026-09-28T09:30:00.000Z',
    lastInteractionDate: '2026-10-01T11:00:00.000Z',
    nextAction: 'Retomar contato sobre proposta de Ultraformer enviada',
    nextActionDate: '2026-10-03T15:00:00.000Z', // Atrasada de ontem para destacar no Meu Dia!
    commercialNotes: 'Pediu orçamento detalhado para Ultraformer face completa + papada.',
    createdAt: '2026-09-28T09:30:00.000Z',
    updatedAt: '2026-10-01T11:00:00.000Z',
  },
  {
    id: 'pat-mariana',
    clinicId: 'clinic-lumina-01',
    name: 'Mariana Souza',
    phone: '(11) 98877-6655',
    whatsapp: '5511988776655',
    email: 'mariana.souza92@gmail.com',
    origin: 'Instagram',
    tags: ['Lead Novo', 'Preenchimento Labial'],
    status: 'lead',
    firstContactDate: '2026-10-04T09:00:00.000Z',
    lastInteractionDate: '2026-10-04T09:15:00.000Z',
    nextAction: 'Apresentar protocolo labial e agendar avaliação',
    nextActionDate: '2026-10-04T16:00:00.000Z',
    commercialNotes: 'Mandou direct querendo saber valores de preenchimento labial com foco em hidratação e volume sutil.',
    createdAt: '2026-10-04T09:00:00.000Z',
    updatedAt: '2026-10-04T09:15:00.000Z',
  },
  {
    id: 'pat-carla',
    clinicId: 'clinic-lumina-01',
    name: 'Carla Menezes',
    phone: '(11) 97711-2233',
    whatsapp: '5511977112233',
    email: 'carla.menezes@adv.com.br',
    origin: 'Campanha',
    tags: ['Reativação', 'Mais de 120 dias'],
    status: 'inativo',
    firstContactDate: '2026-04-10T14:00:00.000Z',
    lastInteractionDate: '2026-05-25T11:30:00.000Z',
    lastAppointmentDate: '2026-05-25T10:00:00.000Z',
    nextAction: 'Propor protocolo de manutenção de colágeno',
    nextActionDate: '2026-10-06T10:00:00.000Z',
    commercialNotes: 'Fez Radiesse em maio. Excelente resultado. Já está no período ideal para revisão e nova sessão de bioestímulo.',
    createdAt: '2026-04-10T14:00:00.000Z',
    updatedAt: '2026-05-25T11:30:00.000Z',
  },
];

export const initialOpportunities: Opportunity[] = [
  {
    id: 'opp-juliana-botox',
    clinicId: 'clinic-lumina-01',
    patientId: 'pat-juliana',
    patientName: 'Juliana Castro',
    procedureId: 'proc-botox',
    procedureName: 'Botox Terço Superior',
    stage: 'fechado',
    estimatedValue: 1800,
    proposedValue: 1800,
    interest: 'Manter linhas da testa e glabela relaxadas',
    nextAction: 'Revisão de 15 dias',
    nextActionDate: '2026-10-17T15:00:00.000Z',
    assignee: 'Camila Rocha',
    notes: 'Procedimento realizado com Dra. Sofia. Paciente saiu extremamente satisfeita.',
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-10-02T16:00:00.000Z',
  },
  {
    id: 'opp-juliana-olheiras',
    clinicId: 'clinic-lumina-01',
    patientId: 'pat-juliana',
    patientName: 'Juliana Castro',
    procedureId: 'proc-olheiras',
    procedureName: 'Preenchimento de Olheiras',
    stage: 'aguardando_decisao',
    estimatedValue: 2400,
    interest: 'Suavizar olheira funda / aspecto cansado',
    objection: 'Prefere aguardar o próximo mês por fluxo financeiro',
    nextAction: 'Ligar após dia 10 para apresentar opção de parcelamento',
    nextActionDate: '2026-10-11T14:00:00.000Z',
    assignee: 'Camila Rocha',
    notes: 'Dra. Sofia avaliou e indicou 1 seringa de Restylane Lyft/Kysse.',
    createdAt: '2026-10-02T16:30:00.000Z',
    updatedAt: '2026-10-02T16:30:00.000Z',
  },
  {
    id: 'opp-fernanda-sculptra',
    clinicId: 'clinic-lumina-01',
    patientId: 'pat-fernanda',
    patientName: 'Fernanda Lima',
    procedureId: 'proc-sculptra',
    procedureName: 'Bioestimulador Sculptra Facial',
    stage: 'proposta',
    estimatedValue: 3800,
    proposedValue: 3600,
    interest: 'Firmeza no contorno facial e prevenção da flacidez',
    nextAction: 'Enviar proposta final com condição de lançamento de outubro',
    nextActionDate: '2026-10-05T10:30:00.000Z',
    assignee: 'Camila Rocha',
    notes: 'Quente para fechar nesta semana.',
    createdAt: '2026-09-20T14:00:00.000Z',
    updatedAt: '2026-10-03T17:15:00.000Z',
  },
  {
    id: 'opp-ana-ultraformer',
    clinicId: 'clinic-lumina-01',
    patientId: 'pat-ana',
    patientName: 'Ana Beatriz Silveira',
    procedureId: 'proc-ultraformer',
    procedureName: 'Ultraformer III Full Face',
    stage: 'aguardando_decisao',
    estimatedValue: 4200,
    proposedValue: 4200,
    interest: 'Tratar papada e contorno mandibular',
    objection: 'Comparando com outra clínica do bairro',
    nextAction: 'Ligar para destacar diferenciais do nosso protocolo médico',
    nextActionDate: '2026-10-03T15:00:00.000Z', // Atrasada!
    assignee: 'Camila Rocha',
    notes: 'Orçamento entregue por WhatsApp.',
    createdAt: '2026-09-28T10:00:00.000Z',
    updatedAt: '2026-10-01T11:00:00.000Z',
  },
  {
    id: 'opp-mariana-labial',
    clinicId: 'clinic-lumina-01',
    patientId: 'pat-mariana',
    patientName: 'Mariana Souza',
    procedureId: 'proc-labial',
    procedureName: 'Preenchimento Labial',
    stage: 'primeiro_contato',
    estimatedValue: 2200,
    interest: 'Hidratação e contorno labial sutil',
    nextAction: 'Confirmar agendamento de consulta avaliativa',
    nextActionDate: '2026-10-04T16:00:00.000Z',
    assignee: 'Camila Rocha',
    notes: 'Chegou hoje pelo direct do Instagram.',
    createdAt: '2026-10-04T09:00:00.000Z',
    updatedAt: '2026-10-04T09:15:00.000Z',
  },
];

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Mariana Souza — Confirmar horário de avaliação labial',
    description: 'Lead do Instagram. Enviar opções de horários de terça e quarta com Dra. Sofia.',
    responsible: 'Camila Rocha',
    patientId: 'pat-mariana',
    patientName: 'Mariana Souza',
    opportunityId: 'opp-mariana-labial',
    priority: 'alta',
    category: 'lead',
    date: '2026-10-04',
    time: '16:00',
    status: 'pendente',
    origin: 'ia_chat',
    createdAt: '2026-10-04T09:15:00.000Z',
  },
  {
    id: 'task-2',
    title: 'Ana Beatriz — Follow-up do orçamento de Ultraformer',
    description: 'Proposta enviada há 3 dias. Ligar e reforçar os diferenciais da tecnologia e acompanhamento médico.',
    responsible: 'Camila Rocha',
    patientId: 'pat-ana',
    patientName: 'Ana Beatriz Silveira',
    opportunityId: 'opp-ana-ultraformer',
    priority: 'urgente',
    category: 'follow-up',
    date: '2026-10-03', // Ontem -> Atrasada
    time: '15:00',
    status: 'atrasada',
    origin: 'manual',
    createdAt: '2026-10-01T11:00:00.000Z',
  },
  {
    id: 'task-3',
    title: 'Fernanda Lima — Apresentar condição especial do Sculptra',
    description: 'Retornar conforme combinado com proposta final em 10x sem juros.',
    responsible: 'Camila Rocha',
    patientId: 'pat-fernanda',
    patientName: 'Fernanda Lima',
    opportunityId: 'opp-fernanda-sculptra',
    priority: 'alta',
    category: 'orcamento',
    date: '2026-10-05',
    time: '10:30',
    status: 'pendente',
    origin: 'ia_chat',
    createdAt: '2026-10-03T17:15:00.000Z',
  },
  {
    id: 'task-4',
    title: 'Juliana Castro — Follow-up sobre preenchimento de olheira',
    description: 'Ligar após dia 10 conforme combinado na consulta de Botox.',
    responsible: 'Camila Rocha',
    patientId: 'pat-juliana',
    patientName: 'Juliana Castro',
    opportunityId: 'opp-juliana-olheiras',
    priority: 'normal',
    category: 'follow-up',
    date: '2026-10-11',
    time: '14:00',
    status: 'pendente',
    origin: 'ia_chat',
    createdAt: '2026-10-02T16:30:00.000Z',
  },
  {
    id: 'task-5',
    title: 'Carla Menezes — Abordagem de reativação (120+ dias)',
    description: 'Enviar mensagem carinhosa de acompanhamento pós-Radiesse e convite para avaliação.',
    responsible: 'Camila Rocha',
    patientId: 'pat-carla',
    patientName: 'Carla Menezes',
    priority: 'normal',
    category: 'reativacao',
    date: '2026-10-06',
    time: '10:00',
    status: 'pendente',
    origin: 'automacao',
    createdAt: '2026-10-04T08:00:00.000Z',
  },
];

export const initialReminders: Reminder[] = [
  {
    id: 'rem-1',
    text: 'Conferir lista de pacientes sem retorno há mais de 30 dias na sexta-feira',
    date: '2026-10-09',
    time: '09:00',
    isCompleted: false,
    createdAt: '2026-10-03T12:00:00.000Z',
  },
  {
    id: 'rem-2',
    text: 'Checar estoque de seringas de Sculptra com a enfermeira chefe',
    date: '2026-10-05',
    time: '09:30',
    isCompleted: false,
    createdAt: '2026-10-04T08:30:00.000Z',
  },
];

export const initialInteractions: Interaction[] = [
  {
    id: 'int-1',
    patientId: 'pat-juliana',
    type: 'atendimento',
    author: 'Dra. Sofia',
    origin: 'manual',
    content: 'Realizou aplicação de toxina botulínica no terço superior (50U). Procedimento transcorreu com sucesso e sem intercorrências.',
    date: '2026-10-02T15:30:00.000Z',
  },
  {
    id: 'int-2',
    patientId: 'pat-juliana',
    type: 'proposta',
    author: 'Camila Rocha',
    origin: 'chat_ia',
    content: 'Conversado sobre preenchimento de olheira com ácido hialurônico. Paciente gostou muito da explicação, porém preferiu esperar o próximo mês. Programado retorno após dia 10.',
    date: '2026-10-02T16:30:00.000Z',
  },
  {
    id: 'int-3',
    patientId: 'pat-fernanda',
    type: 'whatsapp',
    author: 'Camila Rocha',
    origin: 'chat_ia',
    content: 'Fernanda retornou dizendo que amou o efeito do Botox e está animada para iniciar o Sculptra. Pediu para fechar as condições na segunda-feira.',
    date: '2026-10-03T17:15:00.000Z',
  },
  {
    id: 'int-4',
    patientId: 'pat-mariana',
    type: 'lead_recebido',
    author: 'Sistema',
    origin: 'sistema',
    content: 'Lead recebido via Direct Instagram solicitando valores e detalhes sobre preenchimento labial.',
    date: '2026-10-04T09:00:00.000Z',
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-02T16:30:00.000Z',
    author: 'IA (via Chat SDR)',
    entityType: 'oportunidade',
    entityId: 'opp-juliana-olheiras',
    entityName: 'Juliana Castro - Preenchimento de Olheiras',
    action: 'Criação de Oportunidade',
    newValue: 'Status: Aguardando Decisão | Próxima ação: 11/10/2026',
    origin: 'chat_ia',
  },
  {
    id: 'log-2',
    timestamp: '2026-10-03T17:15:00.000Z',
    author: 'IA (via Chat SDR)',
    entityType: 'tarefa',
    entityId: 'task-3',
    entityName: 'Fernanda Lima - Sculptra',
    action: 'Criação de Tarefa',
    newValue: 'Data: 05/10/2026 | Prioridade: Alta',
    origin: 'chat_ia',
  },
  {
    id: 'log-3',
    timestamp: '2026-10-04T09:15:00.000Z',
    author: 'IA (via Chat SDR)',
    entityType: 'paciente',
    entityId: 'pat-mariana',
    entityName: 'Mariana Souza',
    action: 'Cadastro de Novo Paciente',
    newValue: 'Telefone: (11) 98877-6655 | Origem: Instagram',
    origin: 'chat_ia',
  },
];

// In-Memory Database Store Class with full CRUD & Audit Trail
class DatabaseStore {
  private state: CRMState;

  constructor() {
    this.state = {
      clinic: { ...initialClinic },
      currentUser: { ...initialUser },
      patients: JSON.parse(JSON.stringify(initialPatients)),
      opportunities: JSON.parse(JSON.stringify(initialOpportunities)),
      procedures: JSON.parse(JSON.stringify(initialProcedures)),
      tasks: JSON.parse(JSON.stringify(initialTasks)),
      reminders: JSON.parse(JSON.stringify(initialReminders)),
      interactions: JSON.parse(JSON.stringify(initialInteractions)),
      auditLogs: JSON.parse(JSON.stringify(initialAuditLogs)),
    };
  }

  public getState(): CRMState {
    // Automatically flag past due tasks as 'atrasada'
    const todayStr = '2026-10-04';
    this.state.tasks.forEach((t) => {
      if (t.status === 'pendente' && t.date < todayStr) {
        t.status = 'atrasada';
      }
    });

    return this.state;
  }

  public resetToDefault() {
    this.state = {
      clinic: { ...initialClinic },
      currentUser: { ...initialUser },
      patients: JSON.parse(JSON.stringify(initialPatients)),
      opportunities: JSON.parse(JSON.stringify(initialOpportunities)),
      procedures: JSON.parse(JSON.stringify(initialProcedures)),
      tasks: JSON.parse(JSON.stringify(initialTasks)),
      reminders: JSON.parse(JSON.stringify(initialReminders)),
      interactions: JSON.parse(JSON.stringify(initialInteractions)),
      auditLogs: JSON.parse(JSON.stringify(initialAuditLogs)),
    };
    return this.state;
  }

  public logAudit(
    author: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    entityName: string,
    action: string,
    newValue: string,
    previousValue?: string,
    origin: AuditLog['origin'] = 'chat_ia'
  ) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      author,
      entityType,
      entityId,
      entityName,
      action,
      previousValue,
      newValue,
      origin,
    };
    this.state.auditLogs.unshift(log);
  }

  // Clinic & User Settings Updates
  public updateClinic(updates: Partial<Clinic>, author = 'Camila Rocha (SDR)'): Clinic {
    const previous = { ...this.state.clinic };
    this.state.clinic = {
      ...previous,
      ...updates,
      settings: {
        ...previous.settings,
        ...(updates.settings || {}),
      },
    };

    this.logAudit(
      author,
      'clinica',
      this.state.clinic.id,
      this.state.clinic.name,
      'Atualização dos Dados da Clínica',
      JSON.stringify(updates),
      JSON.stringify(previous),
      'interface_manual'
    );

    return this.state.clinic;
  }

  public updateUser(updates: Partial<User>, author = 'Camila Rocha (SDR)'): User {
    const previous = { ...this.state.currentUser };
    this.state.currentUser = {
      ...previous,
      ...updates,
    };

    this.logAudit(
      author,
      'usuario',
      this.state.currentUser.id,
      this.state.currentUser.name,
      'Atualização do Perfil de Usuário',
      JSON.stringify(updates),
      JSON.stringify(previous),
      'interface_manual'
    );

    return this.state.currentUser;
  }

  // Patients
  public getPatients() {
    return this.state.patients;
  }

  public findPatientById(id: string) {
    return this.state.patients.find((p) => p.id === id);
  }

  public findPatientByName(nameQuery: string): Patient[] {
    const cleanQuery = nameQuery.trim().toLowerCase();
    if (!cleanQuery) return [];
    return this.state.patients.filter((p) =>
      p.name.toLowerCase().includes(cleanQuery) ||
      p.phone.replace(/\D/g, '').includes(cleanQuery.replace(/\D/g, ''))
    );
  }

  public createPatient(patientData: Partial<Patient>, author = 'IA (via Chat SDR)'): Patient {
    const newId = `pat-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const cleanPhone = (patientData.phone || '').replace(/\D/g, '');
    const cleanWhatsapp = (patientData.whatsapp || cleanPhone).replace(/\D/g, '');

    const patient: Patient = {
      id: newId,
      clinicId: this.state.clinic.id,
      name: patientData.name || 'Nova Paciente',
      phone: patientData.phone || '',
      whatsapp: cleanWhatsapp ? (cleanWhatsapp.startsWith('55') ? cleanWhatsapp : `55${cleanWhatsapp}`) : '',
      email: patientData.email,
      origin: patientData.origin || 'WhatsApp Direto',
      tags: patientData.tags || ['Novo Contato'],
      status: patientData.status || 'lead',
      firstContactDate: now,
      lastInteractionDate: now,
      nextAction: patientData.nextAction,
      nextActionDate: patientData.nextActionDate,
      commercialNotes: patientData.commercialNotes || '',
      createdAt: now,
      updatedAt: now,
    };

    this.state.patients.unshift(patient);

    this.logAudit(
      author,
      'paciente',
      patient.id,
      patient.name,
      'Cadastro de Paciente',
      `Nome: ${patient.name} | Telefone: ${patient.phone || 'N/A'}`
    );

    return patient;
  }

  public updatePatient(id: string, updates: Partial<Patient>, author = 'IA (via Chat SDR)'): Patient | null {
    const idx = this.state.patients.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const previous = { ...this.state.patients[idx] };
    const updated: Patient = {
      ...previous,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.state.patients[idx] = updated;

    this.logAudit(
      author,
      'paciente',
      updated.id,
      updated.name,
      'Atualização de Paciente',
      JSON.stringify(updates),
      JSON.stringify(previous)
    );

    return updated;
  }

  // Opportunities
  public getOpportunities() {
    return this.state.opportunities;
  }

  public createOpportunity(oppData: Partial<Opportunity>, author = 'IA (via Chat SDR)'): Opportunity {
    const newId = `opp-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const opportunity: Opportunity = {
      id: newId,
      clinicId: this.state.clinic.id,
      patientId: oppData.patientId || '',
      patientName: oppData.patientName || '',
      procedureId: oppData.procedureId,
      procedureName: oppData.procedureName || 'Procedimento em Avaliação',
      stage: oppData.stage || 'novo_interesse',
      estimatedValue: oppData.estimatedValue || 0,
      proposedValue: oppData.proposedValue,
      interest: oppData.interest,
      objection: oppData.objection,
      nextAction: oppData.nextAction,
      nextActionDate: oppData.nextActionDate,
      assignee: oppData.assignee || this.state.currentUser.name,
      notes: oppData.notes,
      origin: oppData.origin || 'chat_ia',
      createdAt: now,
      updatedAt: now,
    };

    this.state.opportunities.unshift(opportunity);

    this.logAudit(
      author,
      'oportunidade',
      opportunity.id,
      `${opportunity.patientName} - ${opportunity.procedureName}`,
      'Criação de Oportunidade',
      `Etapa: ${opportunity.stage} | Valor: R$ ${opportunity.estimatedValue || 0}`
    );

    return opportunity;
  }

  public updateOpportunity(id: string, updates: Partial<Opportunity>, author = 'IA (via Chat SDR)'): Opportunity | null {
    const idx = this.state.opportunities.findIndex((o) => o.id === id);
    if (idx === -1) return null;

    const previous = { ...this.state.opportunities[idx] };
    const updated: Opportunity = {
      ...previous,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.state.opportunities[idx] = updated;

    this.logAudit(
      author,
      'oportunidade',
      updated.id,
      `${updated.patientName} - ${updated.procedureName}`,
      'Atualização de Oportunidade',
      JSON.stringify(updates),
      JSON.stringify(previous)
    );

    return updated;
  }

  // Tasks
  public getTasks() {
    return this.state.tasks;
  }

  public createTask(taskData: Partial<Task>, author = 'IA (via Chat SDR)'): Task {
    const newId = `task-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const task: Task = {
      id: newId,
      title: taskData.title || 'Nova Tarefa Comercial',
      description: taskData.description,
      responsible: taskData.responsible || this.state.currentUser.name,
      patientId: taskData.patientId,
      patientName: taskData.patientName,
      opportunityId: taskData.opportunityId,
      priority: taskData.priority || 'normal',
      category: taskData.category || 'follow-up',
      date: taskData.date || '2026-10-04',
      time: taskData.time || '10:00',
      status: taskData.status || 'pendente',
      origin: taskData.origin || 'ia_chat',
      createdAt: now,
    };

    this.state.tasks.unshift(task);

    this.logAudit(
      author,
      'tarefa',
      task.id,
      task.title,
      'Criação de Tarefa',
      `Data: ${task.date} | Prioridade: ${task.priority}`
    );

    return task;
  }

  public updateTask(id: string, updates: Partial<Task>, author = 'IA (via Chat SDR)'): Task | null {
    const idx = this.state.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const previous = { ...this.state.tasks[idx] };
    const updated: Task = {
      ...previous,
      ...updates,
    };

    if (updates.status === 'concluida' && !previous.completedAt) {
      updated.completedAt = new Date().toISOString();
    }

    this.state.tasks[idx] = updated;

    this.logAudit(
      author,
      'tarefa',
      updated.id,
      updated.title,
      'Atualização de Tarefa',
      `Status: ${updated.status}`,
      `Status anterior: ${previous.status}`
    );

    return updated;
  }

  // Reminders
  public getReminders() {
    return this.state.reminders;
  }

  public createReminder(reminderData: Partial<Reminder>, author = 'IA (via Chat SDR)'): Reminder {
    const newId = `rem-${Date.now().toString(36)}`;
    const reminder: Reminder = {
      id: newId,
      text: reminderData.text || '',
      date: reminderData.date || '2026-10-04',
      time: reminderData.time || '09:00',
      patientId: reminderData.patientId,
      patientName: reminderData.patientName,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    this.state.reminders.unshift(reminder);

    this.logAudit(
      author,
      'lembrete',
      reminder.id,
      reminder.text,
      'Criação de Lembrete',
      `Data: ${reminder.date}`
    );

    return reminder;
  }

  // Interactions
  public getInteractions(patientId?: string) {
    if (patientId) {
      return this.state.interactions.filter((i) => i.patientId === patientId);
    }
    return this.state.interactions;
  }

  public createInteraction(interactionData: Partial<Interaction>): Interaction {
    const newId = `int-${Date.now().toString(36)}`;
    const interaction: Interaction = {
      id: newId,
      patientId: interactionData.patientId || '',
      type: interactionData.type || 'observacao',
      author: interactionData.author || this.state.currentUser.name,
      origin: interactionData.origin || 'chat_ia',
      content: interactionData.content || '',
      date: interactionData.date || new Date().toISOString(),
      metadata: interactionData.metadata,
      attachments: interactionData.attachments,
    };

    this.state.interactions.unshift(interaction);

    // Also update patient's lastInteractionDate
    if (interaction.patientId) {
      const pat = this.findPatientById(interaction.patientId);
      if (pat) {
        pat.lastInteractionDate = interaction.date;
        pat.updatedAt = new Date().toISOString();
      }
    }

    return interaction;
  }

  // Procedures
  public getProcedures() {
    return this.state.procedures;
  }

  // Global Search
  public globalSearch(query: string) {
    const q = query.toLowerCase().trim();
    if (!q) {
      return {
        patients: [],
        opportunities: [],
        tasks: [],
        procedures: [],
      };
    }

    const patients = this.state.patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        (p.commercialNotes && p.commercialNotes.toLowerCase().includes(q))
    );

    const opportunities = this.state.opportunities.filter(
      (o) =>
        o.patientName.toLowerCase().includes(q) ||
        o.procedureName.toLowerCase().includes(q) ||
        (o.interest && o.interest.toLowerCase().includes(q)) ||
        (o.notes && o.notes.toLowerCase().includes(q))
    );

    const tasks = this.state.tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.patientName && t.patientName.toLowerCase().includes(q))
    );

    const procedures = this.state.procedures.filter(
      (pr) =>
        pr.name.toLowerCase().includes(q) ||
        pr.category.toLowerCase().includes(q) ||
        pr.commercialDescription.toLowerCase().includes(q)
    );

    return {
      patients,
      opportunities,
      tasks,
      procedures,
    };
  }
}

export const db = new DatabaseStore();
