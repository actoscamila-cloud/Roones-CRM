import fs from 'fs';
import path from 'path';
import { CRMState, ClientAccount, Patient, Opportunity, Procedure, Task, Reminder, Interaction, AuditLog, User, Clinic, ChatMessage } from '../types/crm';

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

export function generateUniqueId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getDynamicSeedData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const tom = new Date(now);
  tom.setDate(tom.getDate() + 1);
  const tomorrowStr = `${tom.getFullYear()}-${String(tom.getMonth() + 1).padStart(2, '0')}-${String(tom.getDate()).padStart(2, '0')}`;

  const twoM = new Date(now);
  twoM.setMonth(twoM.getMonth() + 2);
  const twoMonthsStr = `${twoM.getFullYear()}-${String(twoM.getMonth() + 1).padStart(2, '0')}-${String(twoM.getDate()).padStart(2, '0')}`;

  const retoqueDate = '2027-02-15';

  const saraId = 'pat-sara-medina';
  const facedoctorTaskId = 'task-ultraformer-facedoctor';
  const followUpTaskId = 'task-sara-followup';
  const retoqueTaskId = 'task-sara-retoque';
  const botoxOppId = 'opp-sara-botox';
  const retoqueOppId = 'opp-sara-retoque';
  const procIntId = 'int-sara-procedimento';

  const patients: Patient[] = [
    {
      id: saraId,
      clientId: 'cli-thayline',
      clientName: 'Clínica Dra. Thayline Sara',
      clinicId: 'cli-thayline',
      name: 'Sara Medina',
      phone: '(18) 99194-5607',
      whatsapp: '5518991945607',
      origin: 'Conversa com Iza (SDR)',
      tags: ['Botox', 'Dra. Thayline', 'Retoque 2027'],
      status: 'ativo',
      firstContactDate: `${todayStr}T10:00:00.000Z`,
      lastInteractionDate: `${todayStr}T10:00:00.000Z`,
      nextAction: 'Follow-up de 2 meses pós-Botox',
      nextActionDate: twoMonthsStr,
      commercialNotes: 'Realizou procedimento de Botox hoje. Programado follow-up de 2 meses e lembrete de retoque para fevereiro de 2027.',
      createdAt: `${todayStr}T10:00:00.000Z`,
      updatedAt: `${todayStr}T10:00:00.000Z`,
    },
  ];

  const opportunities: Opportunity[] = [
    {
      id: botoxOppId,
      clientId: 'cli-thayline',
      clientName: 'Clínica Dra. Thayline Sara',
      clinicId: 'cli-thayline',
      patientId: saraId,
      patientName: 'Sara Medina',
      procedureName: 'Toxina Botulínica (Botox)',
      stage: 'fechado',
      estimatedValue: 1800,
      proposedValue: 1800,
      interest: 'Toxina Botulínica (Botox)',
      nextAction: 'Follow-up de retorno em 2 meses',
      nextActionDate: twoMonthsStr,
      confidenceScore: 100,
      createdAt: `${todayStr}T10:00:00.000Z`,
      updatedAt: `${todayStr}T10:00:00.000Z`,
    },
    {
      id: retoqueOppId,
      clientId: 'cli-thayline',
      clientName: 'Clínica Dra. Thayline Sara',
      clinicId: 'cli-thayline',
      patientId: saraId,
      patientName: 'Sara Medina',
      procedureName: 'Retoque de Botox',
      stage: 'aguardando_decisao',
      estimatedValue: 1800,
      proposedValue: 1800,
      interest: 'Retoque de Botox (ciclo semestral)',
      nextAction: 'Lembrete de retoque de Botox',
      nextActionDate: retoqueDate,
      confidenceScore: 80,
      createdAt: `${todayStr}T10:00:00.000Z`,
      updatedAt: `${todayStr}T10:00:00.000Z`,
    },
  ];

  const tasks: Task[] = [
    {
      id: facedoctorTaskId,
      title: 'Finalizar reativação do Ultraformer',
      description: 'Entrar em contato com a base de pacientes inativos para finalizar a campanha de reativação do Ultraformer III na Face Doctor.',
      responsible: 'Camila Rocha',
      clientId: 'cli-facedoctor',
      clientName: 'Clínica Face Doctor Parque Prado',
      priority: 'alta',
      category: 'comercial',
      date: tomorrowStr,
      time: '10:00',
      status: 'pendente',
      origin: 'ia_chat',
      createdAt: `${todayStr}T10:00:00.000Z`,
    },
    {
      id: followUpTaskId,
      title: 'Chamar Sara Medina - Follow-up 2 meses pós-Botox',
      description: 'Ligar ou enviar WhatsApp para Sara Medina ((18) 99194-5607) para verificar a evolução e satisfação pós-aplicação de Toxina Botulínica.',
      responsible: 'Camila Rocha',
      clientId: 'cli-thayline',
      clientName: 'Clínica Dra. Thayline Sara',
      patientId: saraId,
      patientName: 'Sara Medina',
      priority: 'alta',
      category: 'follow-up',
      date: twoMonthsStr,
      time: '10:00',
      status: 'pendente',
      origin: 'ia_chat',
      createdAt: `${todayStr}T10:00:00.000Z`,
    },
    {
      id: retoqueTaskId,
      title: 'Lembrete: Retoque de Botox - Sara Medina',
      description: 'Contatar Sara Medina ((18) 99194-5607) para agendamento do retoque da Toxina Botulínica referente ao procedimento realizado hoje.',
      responsible: 'Camila Rocha',
      clientId: 'cli-thayline',
      clientName: 'Clínica Dra. Thayline Sara',
      patientId: saraId,
      patientName: 'Sara Medina',
      priority: 'normal',
      category: 'follow-up',
      date: retoqueDate,
      time: '10:00',
      status: 'pendente',
      origin: 'ia_chat',
      createdAt: `${todayStr}T10:00:00.000Z`,
    },
  ];

  const interactions: Interaction[] = [
    {
      id: procIntId,
      patientId: saraId,
      clientId: 'cli-thayline',
      clientName: 'Clínica Dra. Thayline Sara',
      type: 'procedimento',
      author: 'Iza (Assistente SDR)',
      origin: 'chat_ia',
      content: `Procedimento realizado hoje: Toxina Botulínica (Botox). Telefone: (18) 99194-5607. Programados: follow-up para ${twoMonthsStr} e lembrete de retoque para fevereiro de 2027.`,
      date: `${todayStr}T10:00:00.000Z`,
    },
  ];

  return { patients, opportunities, tasks, interactions };
}

export const initialPatients: Patient[] = [];
export const initialOpportunities: Opportunity[] = [];
export const initialTasks: Task[] = [];
export const initialReminders: Reminder[] = [];
export const initialInteractions: Interaction[] = [];
export const initialAuditLogs: AuditLog[] = [];

class DatabaseStore {
  private state!: CRMState;
  private dbFilePath = path.resolve(process.cwd(), 'data', 'crm_store.json');

  private saveToDisk(): void {
    try {
      const dataDir = path.dirname(this.dbFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const tmpPath = `${this.dbFilePath}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(this.state, null, 2), 'utf-8');
      fs.renameSync(tmpPath, this.dbFilePath);
    } catch (err) {
      console.error('[DatabaseStore] Erro ao salvar estado no disco:', err);
    }
  }

  private loadFromDisk(): boolean {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.clients) && Array.isArray(parsed.patients)) {
          this.state = parsed;
          if (!this.state.chatHistory || this.state.chatHistory.length === 0) {
            this.state.chatHistory = [
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
          }
          console.log(`[DatabaseStore] Estado carregado com sucesso do disco: ${this.state.patients.length} pacientes, ${this.state.tasks.length} tarefas, ${this.state.clients.length} clínicas.`);
          return true;
        }
      }
    } catch (err) {
      console.error('[DatabaseStore] Erro ao ler arquivo do disco:', err);
    }
    return false;
  }

  constructor() {
    const loaded = this.loadFromDisk();
    if (!loaded) {
      const seed = getDynamicSeedData();
      this.state = {
        currentUser: { ...initialUser },
        clients: JSON.parse(JSON.stringify(initialClients)),
        selectedClientId: 'todos',
        patients: seed.patients,
        opportunities: seed.opportunities,
        procedures: JSON.parse(JSON.stringify(initialProcedures)),
        tasks: seed.tasks,
        reminders: [],
        interactions: seed.interactions,
        auditLogs: [],
        clinic: { ...initialClinicFallback },
        chatHistory: [
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
        ],
      };
      this.saveToDisk();
      console.log('[DatabaseStore] Estado inicializado com dados dinâmicos e salvo em disco.');
    }
  }

  public getState(): CRMState {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let modified = false;
    this.state.tasks.forEach((t) => {
      if (t.status === 'pendente' && t.date < todayStr) {
        t.status = 'atrasada';
        modified = true;
      }
    });
    if (modified) {
      this.saveToDisk();
    }
    return {
      ...this.state,
      lastSyncedAt: new Date().toISOString(),
    };
  }

  public getChatHistory(): ChatMessage[] {
    return this.state.chatHistory || [];
  }

  public appendChatMessage(msg: ChatMessage): void {
    if (!this.state.chatHistory) {
      this.state.chatHistory = [];
    }
    this.state.chatHistory.push(msg);
    if (this.state.chatHistory.length > 200) {
      this.state.chatHistory = this.state.chatHistory.slice(-200);
    }
    this.saveToDisk();
  }

  public setChatHistory(messages: ChatMessage[]): void {
    this.state.chatHistory = messages;
    this.saveToDisk();
  }

  public clearChatHistory(): void {
    this.state.chatHistory = [
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
    this.saveToDisk();
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
      chatHistory: [],
    };
    this.saveToDisk();
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
    this.saveToDisk();
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
    const newId = generateUniqueId('cli');
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
    this.saveToDisk();
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
    this.saveToDisk();
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
    this.saveToDisk();
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
    this.saveToDisk();
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
    this.saveToDisk();
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
    this.saveToDisk();
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
    const newId = generateUniqueId('pat');
    const now = new Date().toISOString();

    // Determina o cliente da paciente
    let clientId = patientData.clientId || this.state.selectedClientId;
    if ((!clientId || clientId === 'todos') && patientData.clientName) {
      const c = this.findClientByName(patientData.clientName);
      if (c) clientId = c.id;
    }
    if (!clientId || clientId === 'todos') {
      clientId = 'cli-camila-silva'; // Default se não especificado
    }
    const client = this.getClientById(clientId);

    const patient: Patient = {
      id: newId,
      clientId,
      clientName: client?.name || patientData.clientName || 'Clínica Camila Silva',
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

    this.saveToDisk();
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

    this.saveToDisk();
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
    this.saveToDisk();
    return true;
  }

  public createOpportunity(oppData: Partial<Opportunity>, author = 'IA (via Chat SDR)'): Opportunity {
    const newId = generateUniqueId('opp');
    const now = new Date().toISOString();

    let clientId = oppData.clientId;
    if (!clientId && oppData.clientName) {
      const c = this.findClientByName(oppData.clientName);
      if (c) clientId = c.id;
    }
    if (!clientId && oppData.patientId) {
      const p = this.findPatientById(oppData.patientId);
      if (p) clientId = p.clientId;
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

    this.saveToDisk();
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

    this.saveToDisk();
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
    this.saveToDisk();
    return true;
  }

  public createTask(taskData: Partial<Task>, author = 'IA (via Chat SDR)'): Task {
    const newId = generateUniqueId('task');
    const now = new Date().toISOString();

    let clientId = taskData.clientId;
    if (!clientId && taskData.clientName) {
      const c = this.findClientByName(taskData.clientName);
      if (c) clientId = c.id;
    }
    if (!clientId && taskData.patientId) {
      const p = this.findPatientById(taskData.patientId);
      if (p) clientId = p.clientId;
    }

    const client = clientId ? this.getClientById(clientId) : (taskData.clientName ? this.findClientByName(taskData.clientName) : undefined);

    let patientId = taskData.patientId;
    let patientName = taskData.patientName;
    if (!patientId && patientName) {
      const p = this.findPatientByName(patientName, client?.id);
      if (p.length > 0) {
        patientId = p[0].id;
        patientName = p[0].name;
      }
    }

    const task: Task = {
      id: newId,
      title: taskData.title || 'Nova Tarefa Comercial',
      description: taskData.description,
      responsible: taskData.responsible || this.state.currentUser.name,
      clientId: client?.id || clientId,
      clientName: client?.name || taskData.clientName,
      patientId,
      patientName,
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

    this.saveToDisk();
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

    this.saveToDisk();
    return updated;
  }

  // --- REMINDERS ---
  public getReminders() {
    return this.state.reminders;
  }

  public createReminder(reminderData: Partial<Reminder>, author = 'IA (via Chat SDR)'): Reminder {
    const newId = generateUniqueId('rem');
    let clientId = reminderData.clientId;
    let clientName = reminderData.clientName;
    if (!clientId && clientName) {
      const c = this.findClientByName(clientName);
      if (c) {
        clientId = c.id;
        clientName = c.name;
      }
    }
    const reminder: Reminder = {
      id: newId,
      text: reminderData.text || '',
      date: reminderData.date || new Date().toISOString().split('T')[0],
      time: reminderData.time || '09:00',
      clientId,
      clientName,
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

    this.saveToDisk();
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
    const newId = generateUniqueId('int');
    let clientId = interactionData.clientId;
    let clientName = interactionData.clientName;

    if (!clientId && clientName) {
      const c = this.findClientByName(clientName);
      if (c) {
        clientId = c.id;
        clientName = c.name;
      }
    }

    let patientId = interactionData.patientId;
    if (!clientId && patientId) {
      const p = this.findPatientById(patientId);
      if (p) {
        clientId = p.clientId;
        clientName = p.clientName;
      }
    }

    if (!patientId && (interactionData as any).patientName) {
      const p = this.findPatientByName((interactionData as any).patientName, clientId);
      if (p.length > 0) {
        patientId = p[0].id;
        if (!clientId) {
          clientId = p[0].clientId;
          clientName = p[0].clientName;
        }
      }
    }

    const interaction: Interaction = {
      id: newId,
      patientId: patientId || '',
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

    this.saveToDisk();
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
