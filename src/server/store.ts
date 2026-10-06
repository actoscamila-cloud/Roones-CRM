import { CRMState, ClientAccount, Patient, Opportunity, Procedure, Task, Reminder, Interaction, AuditLog, User, Clinic } from '../types/crm';

export const initialClients: ClientAccount[] = [
  {
    id: 'cli-camila-silva',
    name: 'Clínica Camila Silva',
    shortName: 'Camila Silva',
    type: 'clinica_estetica',
    doctorOrOwner: 'Dra. Camila Silva',
    phone: '(11) 99120-4400',
    email: 'contato@clinicacamilasilva.com.br',
    address: 'Alameda Santos, 1200 - Jardins, São Paulo - SP',
    color: '#2563EB', // Blue
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    defaultFollowUpDays: 3,
    activeCampaigns: [],
    rulesNotes: 'Prazo padrão de follow-up: 3 dias.',
    status: 'ativo',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'cli-facedoctor',
    name: 'Clínica Face Doctor Parque Prado',
    shortName: 'Face Doctor',
    type: 'franquia',
    doctorOrOwner: 'Dra. Augusta / Face Doctor',
    contactPerson: 'Augusta (Gerente)',
    phone: '(19) 3271-8899',
    email: 'parqueprado@facedoctor.com.br',
    address: 'Shopping Parque Prado, Loja 45 - Campinas - SP',
    color: '#7C3AED', // Purple
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    defaultFollowUpDays: 5,
    activeCampaigns: [],
    rulesNotes: 'Prazo padrão de follow-up: 5 dias.',
    status: 'ativo',
    createdAt: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'cli-thayline',
    name: 'Clínica Dra. Thayline Sara',
    shortName: 'Dra. Thayline',
    type: 'consultorio_medico',
    doctorOrOwner: 'Dra. Thayline Sara',
    phone: '(11) 98770-5522',
    email: 'atendimento@drathaylinesara.com.br',
    address: 'Av. Brigadeiro Faria Lima, 2800 - Itaim Bibi, São Paulo - SP',
    color: '#059669', // Emerald
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    defaultFollowUpDays: 4,
    activeCampaigns: [],
    rulesNotes: 'Prazo padrão de follow-up: 4 dias.',
    status: 'ativo',
    createdAt: '2026-03-10T10:00:00.000Z',
  },
];

export const initialUser: User = {
  id: 'user-camila-01',
  name: 'Camila Rocha',
  role: 'SDR Comercial Multiclínicas',
  email: 'camila.sdr@gmail.com',
  phone: '(11) 99887-1122',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
};

export const initialClinicFallback: Clinic = {
  id: 'cli-camila-silva',
  name: 'Roones CRM - Camila Rocha (SDR Multiclínicas)',
  phone: '(11) 99887-1122',
  email: 'camila.sdr@gmail.com',
  address: 'São Paulo - SP',
  timezone: 'America/Sao_Paulo',
  settings: {
    autoNextActionAlert: true,
    defaultFollowUpDays: 3,
    requireNextActionOnOpportunity: true,
  },
  createdAt: '2026-01-10T08:00:00.000Z',
};

export const initialProcedures: Procedure[] = [
  {
    id: 'proc-botox',
    name: 'Botox Terço Superior',
    category: 'Injetáveis',
    commercialDescription: 'Toxina botulínica para rugas dinâmicas da testa, glabela e pés de galinha.',
    referencePrice: 1800,
    status: 'ativo',
  },
  {
    id: 'proc-olheiras',
    name: 'Preenchimento de Olheiras',
    category: 'Injetáveis',
    commercialDescription: 'Ácido hialurônico para volumização e hidratação da calha lacrimal.',
    referencePrice: 2400,
    status: 'ativo',
  },
  {
    id: 'proc-labial',
    name: 'Preenchimento Labial',
    category: 'Injetáveis',
    commercialDescription: 'Contorno e hidratação labial com ácido hialurônico premium.',
    referencePrice: 2200,
    status: 'ativo',
  },
  {
    id: 'proc-sculptra',
    name: 'Bioestimulador Sculptra',
    category: 'Bioestimuladores',
    commercialDescription: 'Ácido poli-L-láctico para estímulo intenso de colágeno natural e sustentação.',
    referencePrice: 3800,
    status: 'ativo',
  },
  {
    id: 'proc-radiesse',
    name: 'Bioestimulador Radiesse',
    category: 'Bioestimuladores',
    commercialDescription: 'Hidroxiapatita de cálcio para efeito lifting e colágeno.',
    referencePrice: 3500,
    status: 'ativo',
  },
  {
    id: 'proc-ultraformer',
    name: 'Ultraformer III Full Face',
    category: 'Tecnologias',
    commercialDescription: 'Ultrassom focado para ancoragem muscular e retração de flacidez.',
    referencePrice: 4200,
    status: 'ativo',
  },
];

export const initialPatients: Patient[] = [];

export const initialOpportunities: Opportunity[] = [];

export const initialTasks: Task[] = [];

export const initialReminders: Reminder[] = [];

export const initialInteractions: Interaction[] = [];

export const initialAuditLogs: AuditLog[] = [];

class DatabaseStore {
  private state: CRMState;

  constructor() {
    this.state = {
      currentUser: { ...initialUser },
      clients: JSON.parse(JSON.stringify(initialClients)),
      selectedClientId: 'todos',
      patients: JSON.parse(JSON.stringify(initialPatients)),
      opportunities: JSON.parse(JSON.stringify(initialOpportunities)),
      procedures: JSON.parse(JSON.stringify(initialProcedures)),
      tasks: JSON.parse(JSON.stringify(initialTasks)),
      reminders: JSON.parse(JSON.stringify(initialReminders)),
      interactions: JSON.parse(JSON.stringify(initialInteractions)),
      auditLogs: JSON.parse(JSON.stringify(initialAuditLogs)),
      clinic: { ...initialClinicFallback },
    };
  }

  public getState(): CRMState {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.state.tasks.forEach((t) => {
      if (t.status === 'pendente' && t.date < todayStr) {
        t.status = 'atrasada';
      }
    });
    return this.state;
  }

  public resetToDefault() {
    this.state = {
      currentUser: { ...initialUser },
      clients: JSON.parse(JSON.stringify(initialClients)),
      selectedClientId: 'todos',
      patients: JSON.parse(JSON.stringify(initialPatients)),
      opportunities: JSON.parse(JSON.stringify(initialOpportunities)),
      procedures: JSON.parse(JSON.stringify(initialProcedures)),
      tasks: JSON.parse(JSON.stringify(initialTasks)),
      reminders: JSON.parse(JSON.stringify(initialReminders)),
      interactions: JSON.parse(JSON.stringify(initialInteractions)),
      auditLogs: JSON.parse(JSON.stringify(initialAuditLogs)),
      clinic: { ...initialClinicFallback },
    };
    return this.state;
  }

  public clearAllData(author = 'Usuária'): CRMState {
    this.state.patients = [];
    this.state.opportunities = [];
    this.state.tasks = [];
    this.state.reminders = [];
    this.state.interactions = [];
    this.state.auditLogs = [];
    this.logAudit(
      author,
      'cliente',
      'base-operacional',
      'Base de Dados',
      'Limpeza Geral',
      'Todos os dados de teste foram apagados. Sistema pronto para operação real.'
    );
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
      id: `log-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      author,
      entityType,
      entityId,
      entityName,
      action,
      newValue,
      previousValue,
      origin,
    };
    this.state.auditLogs.unshift(log);
    if (this.state.auditLogs.length > 300) {
      this.state.auditLogs.pop();
    }
  }

  // --- CLIENTS (Clínicas e Médicas que a Camila atende) ---
  public getClients(): ClientAccount[] {
    return this.state.clients;
  }

  public getClientById(id: string): ClientAccount | undefined {
    return this.state.clients.find((c) => c.id === id);
  }

  public findClientByName(nameQuery: string): ClientAccount | undefined {
    const q = nameQuery.trim().toLowerCase();
    if (!q) return undefined;
    return this.state.clients.find(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.doctorOrOwner.toLowerCase().includes(q) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(q))
    );
  }

  public createClient(data: Partial<ClientAccount>, author = 'Camila Rocha (SDR)'): ClientAccount {
    const newId = `cli-${Date.now().toString(36)}`;
    const client: ClientAccount = {
      id: newId,
      name: data.name || 'Nova Clínica Parceira',
      shortName: data.shortName || (data.name ? data.name.replace(/(Clínica|Clinica|Dra\.?|Dr\.?)/gi, '').trim() : 'Nova Clínica'),
      type: data.type || 'clinica_estetica',
      doctorOrOwner: data.doctorOrOwner || 'Profissional Responsável',
      contactPerson: data.contactPerson,
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      color: data.color || '#3B82F6',
      badgeBg: data.badgeBg || 'bg-blue-50 text-blue-700 border-blue-200',
      defaultFollowUpDays: data.defaultFollowUpDays || 3,
      activeCampaigns: data.activeCampaigns || [],
      rulesNotes: data.rulesNotes || '',
      status: 'ativo',
      createdAt: new Date().toISOString(),
    };
    this.state.clients.push(client);
    this.logAudit(
      author,
      'cliente',
      client.id,
      client.name,
      'Cadastro de Cliente/Clínica',
      `Cadastrada nova conta comercial: ${client.name}`
    );
    return client;
  }

  public updateClient(id: string, updates: Partial<ClientAccount>, author = 'Camila Rocha (SDR)'): ClientAccount | null {
    const idx = this.state.clients.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const previous = { ...this.state.clients[idx] };
    const updated = { ...previous, ...updates };
    this.state.clients[idx] = updated;

    // Se mudou o nome, propaga para pacientes, tarefas e oportunidades daquele cliente
    if (updates.name && updates.name !== previous.name) {
      this.state.patients.forEach((p) => {
        if (p.clientId === id) p.clientName = updates.name;
      });
      this.state.opportunities.forEach((o) => {
        if (o.clientId === id) o.clientName = updates.name;
      });
      this.state.tasks.forEach((t) => {
        if (t.clientId === id) t.clientName = updates.name;
      });
    }

    this.logAudit(
      author,
      'cliente',
      updated.id,
      updated.name,
      'Atualização de Cliente/Clínica',
      JSON.stringify(updates),
      JSON.stringify(previous)
    );
    return updated;
  }

  public deleteClient(id: string, author = 'Camila Rocha (SDR)'): boolean {
    const idx = this.state.clients.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const client = this.state.clients[idx];
    this.state.clients.splice(idx, 1);
    this.state.patients = this.state.patients.filter((p) => p.clientId !== id);
    this.state.opportunities = this.state.opportunities.filter((o) => o.clientId !== id);
    this.state.tasks = this.state.tasks.filter((t) => t.clientId !== id);
    this.logAudit(
      author,
      'cliente',
      id,
      client.name,
      'Exclusão de Cliente/Clínica',
      `Conta comercial ${client.name} excluída.`
    );
    return true;
  }

  // --- USER PROFILE (Camila Rocha) ---
  public getUser(): User {
    return this.state.currentUser;
  }

  public updateUser(updates: Partial<User>, author = 'Camila Rocha (SDR)'): User {
    const previous = { ...this.state.currentUser };
    this.state.currentUser = { ...previous, ...updates };
    this.logAudit(
      author,
      'usuario',
      this.state.currentUser.id,
      this.state.currentUser.name,
      'Atualização do Perfil da Usuária',
      JSON.stringify(updates),
      JSON.stringify(previous)
    );
    return this.state.currentUser;
  }

  public updateClinic(updates: Partial<Clinic>, author = 'Interface Manual'): Clinic {
    if (!this.state.clinic) {
      this.state.clinic = { ...initialClinicFallback };
    }
    const previous = { ...this.state.clinic };
    this.state.clinic = { ...this.state.clinic, ...updates };
    this.logAudit(
      author,
      'cliente',
      this.state.clinic.id,
      this.state.clinic.name,
      'Atualização de Configurações Retrocompatíveis',
      JSON.stringify(updates),
      JSON.stringify(previous)
    );
    return this.state.clinic;
  }

  // --- PATIENTS ---
  public getPatients(clientId?: string): Patient[] {
    if (clientId && clientId !== 'todos') {
      return this.state.patients.filter((p) => p.clientId === clientId);
    }
    return this.state.patients;
  }

  public findPatientById(id: string): Patient | undefined {
    return this.state.patients.find((p) => p.id === id);
  }

  public deletePatient(id: string, author = 'IA (via Chat SDR)'): boolean {
    const idx = this.state.patients.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const removed = this.state.patients.splice(idx, 1)[0];
    this.logAudit(author, 'paciente', removed.id, removed.name, 'Exclusão de Paciente', 'Paciente removido com sucesso');
    return true;
  }

  public findPatientByName(nameQuery: string, clientId?: string): Patient[] {
    const cleanQuery = nameQuery.trim().toLowerCase();
    if (!cleanQuery) return [];
    const queryDigits = cleanQuery.replace(/\D/g, '');

    let pool = this.state.patients;
    if (clientId && clientId !== 'todos') {
      pool = pool.filter((p) => p.clientId === clientId);
    }

    // 1. Exact name or word-boundary match (e.g. "Ana" matches "Ana Faria", not "Juliana")
    const wordMatches = pool.filter((p) => {
      const pNameLower = p.name.toLowerCase();
      const pWords = pNameLower.split(/\s+/);
      const matchWord = pWords.some((pw) => pw === cleanQuery || pw.startsWith(cleanQuery));
      const matchPhone = queryDigits.length >= 4 && p.phone.replace(/\D/g, '').includes(queryDigits);
      return matchWord || matchPhone;
    });

    if (wordMatches.length > 0) return wordMatches;

    // 2. Fallback to general substring match
    return pool.filter((p) => p.name.toLowerCase().includes(cleanQuery));
  }

  public createPatient(patientData: Partial<Patient>, author = 'IA (via Chat SDR)'): Patient {
    const newId = `pat-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    // Determina o cliente da paciente
    let clientId = patientData.clientId || this.state.selectedClientId;
    if (!clientId || clientId === 'todos') {
      clientId = 'cli-camila-silva'; // Default se não especificado
    }
    const client = this.getClientById(clientId);

    const patient: Patient = {
      id: newId,
      clientId,
      clientName: client?.name || 'Clínica Camila Silva',
      clinicId: clientId,
      name: patientData.name || 'Nova Paciente',
      phone: patientData.phone || '',
      whatsapp: patientData.whatsapp || (patientData.phone ? patientData.phone.replace(/\D/g, '') : ''),
      email: patientData.email,
      birthDate: patientData.birthDate,
      origin: patientData.origin || 'Conversa Iza',
      tags: patientData.tags || ['Novo Contato'],
      status: patientData.status || 'lead',
      firstContactDate: patientData.firstContactDate || now,
      lastInteractionDate: patientData.lastInteractionDate || now,
      lastAppointmentDate: patientData.lastAppointmentDate,
      nextAction: patientData.nextAction,
      nextActionDate: patientData.nextActionDate,
      commercialNotes: patientData.commercialNotes,
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
      `Cliente: ${patient.clientName} | Telefone: ${patient.phone || 'Não informado'}`
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

  // --- OPPORTUNITIES ---
  public getOpportunities(clientId?: string): Opportunity[] {
    if (clientId && clientId !== 'todos') {
      return this.state.opportunities.filter((o) => o.clientId === clientId);
    }
    return this.state.opportunities;
  }

  public findOpportunityById(id: string): Opportunity | undefined {
    return this.state.opportunities.find((o) => o.id === id);
  }

  public deleteOpportunity(id: string, author = 'IA (via Chat SDR)'): boolean {
    const idx = this.state.opportunities.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    const removed = this.state.opportunities.splice(idx, 1)[0];
    this.logAudit(
      author,
      'oportunidade',
      removed.id,
      `${removed.patientName} - ${removed.procedureName}`,
      'Exclusão de Oportunidade',
      'Oportunidade removida'
    );
    return true;
  }

  public createOpportunity(oppData: Partial<Opportunity>, author = 'IA (via Chat SDR)'): Opportunity {
    const newId = `opp-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    let clientId = oppData.clientId;
    if (!clientId) {
      if (oppData.patientId) {
        const p = this.findPatientById(oppData.patientId);
        if (p) clientId = p.clientId;
      }
    }
    if (!clientId || clientId === 'todos') {
      clientId = 'cli-camila-silva';
    }
    const client = this.getClientById(clientId);

    const opportunity: Opportunity = {
      id: newId,
      clientId,
      clientName: client?.name || oppData.clientName || 'Clínica Camila Silva',
      clinicId: clientId,
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
      `${opportunity.patientName} - ${opportunity.procedureName} (${opportunity.clientName})`,
      'Criação de Oportunidade',
      `Cliente: ${opportunity.clientName} | Etapa: ${opportunity.stage} | Valor: R$ ${opportunity.estimatedValue || 0}`
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

  // --- TASKS ---
  public getTasks(clientId?: string): Task[] {
    if (clientId && clientId !== 'todos') {
      return this.state.tasks.filter((t) => t.clientId === clientId);
    }
    return this.state.tasks;
  }

  public findTaskById(id: string): Task | undefined {
    return this.state.tasks.find((t) => t.id === id);
  }

  public deleteTask(id: string, author = 'IA (via Chat SDR)'): boolean {
    const idx = this.state.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    const removed = this.state.tasks.splice(idx, 1)[0];
    this.logAudit(author, 'tarefa', removed.id, removed.title, 'Exclusão de Tarefa', 'Tarefa removida');
    return true;
  }

  public createTask(taskData: Partial<Task>, author = 'IA (via Chat SDR)'): Task {
    const newId = `task-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    let clientId = taskData.clientId;
    if (!clientId && taskData.patientId) {
      const p = this.findPatientById(taskData.patientId);
      if (p) clientId = p.clientId;
    }

    const client = clientId ? this.getClientById(clientId) : undefined;

    const task: Task = {
      id: newId,
      title: taskData.title || 'Nova Tarefa Comercial',
      description: taskData.description,
      responsible: taskData.responsible || this.state.currentUser.name,
      clientId,
      clientName: client?.name || taskData.clientName,
      patientId: taskData.patientId,
      patientName: taskData.patientName,
      opportunityId: taskData.opportunityId,
      priority: taskData.priority || 'normal',
      category: taskData.category || (clientId ? 'follow-up' : 'interna'),
      date: taskData.date || new Date().toISOString().split('T')[0],
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
      `Cliente: ${task.clientName || 'Interna'} | Data: ${task.date} | Prioridade: ${task.priority}`
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

  // --- REMINDERS ---
  public getReminders() {
    return this.state.reminders;
  }

  public createReminder(reminderData: Partial<Reminder>, author = 'IA (via Chat SDR)'): Reminder {
    const newId = `rem-${Date.now().toString(36)}`;
    const reminder: Reminder = {
      id: newId,
      text: reminderData.text || '',
      date: reminderData.date || new Date().toISOString().split('T')[0],
      time: reminderData.time || '09:00',
      clientId: reminderData.clientId,
      clientName: reminderData.clientName,
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

  // --- INTERACTIONS ---
  public getInteractions(patientId?: string) {
    if (patientId) {
      return this.state.interactions.filter((i) => i.patientId === patientId);
    }
    return this.state.interactions;
  }

  public createInteraction(interactionData: Partial<Interaction>): Interaction {
    const newId = `int-${Date.now().toString(36)}`;
    let clientId = interactionData.clientId;
    let clientName = interactionData.clientName;

    if (!clientId && interactionData.patientId) {
      const p = this.findPatientById(interactionData.patientId);
      if (p) {
        clientId = p.clientId;
        clientName = p.clientName;
      }
    }

    const interaction: Interaction = {
      id: newId,
      patientId: interactionData.patientId || '',
      clientId,
      clientName,
      type: interactionData.type || 'observacao',
      author: interactionData.author || this.state.currentUser.name,
      origin: interactionData.origin || 'chat_ia',
      content: interactionData.content || '',
      date: interactionData.date || new Date().toISOString(),
      metadata: interactionData.metadata,
      attachments: interactionData.attachments,
    };

    this.state.interactions.unshift(interaction);

    if (interaction.patientId) {
      const pat = this.findPatientById(interaction.patientId);
      if (pat) {
        pat.lastInteractionDate = interaction.date;
        pat.updatedAt = new Date().toISOString();
      }
    }

    return interaction;
  }

  // --- PROCEDURES ---
  public getProcedures() {
    return this.state.procedures;
  }

  // --- GLOBAL SEARCH ---
  public globalSearch(query: string, clientId?: string) {
    const q = query.toLowerCase().trim();
    if (!q) {
      return {
        clients: [],
        patients: [],
        opportunities: [],
        tasks: [],
        procedures: [],
      };
    }

    const clients = this.state.clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.doctorOrOwner.toLowerCase().includes(q)
    );

    let patientsPool = this.state.patients;
    let oppsPool = this.state.opportunities;
    let tasksPool = this.state.tasks;

    if (clientId && clientId !== 'todos') {
      patientsPool = patientsPool.filter((p) => p.clientId === clientId);
      oppsPool = oppsPool.filter((o) => o.clientId === clientId);
      tasksPool = tasksPool.filter((t) => t.clientId === clientId);
    }

    const patients = patientsPool.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        (p.commercialNotes && p.commercialNotes.toLowerCase().includes(q))
    );

    const opportunities = oppsPool.filter(
      (o) =>
        o.patientName.toLowerCase().includes(q) ||
        o.procedureName.toLowerCase().includes(q) ||
        (o.interest && o.interest.toLowerCase().includes(q)) ||
        (o.notes && o.notes.toLowerCase().includes(q))
    );

    const tasks = tasksPool.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.patientName && t.patientName.toLowerCase().includes(q)) ||
        (t.clientName && t.clientName.toLowerCase().includes(q))
    );

    const procedures = this.state.procedures.filter(
      (pr) =>
        pr.name.toLowerCase().includes(q) ||
        pr.category.toLowerCase().includes(q) ||
        pr.commercialDescription.toLowerCase().includes(q)
    );

    return {
      clients,
      patients,
      opportunities,
      tasks,
      procedures,
    };
  }
}

export const db = new DatabaseStore();
