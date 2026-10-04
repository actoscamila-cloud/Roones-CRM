import { FunctionDeclaration, Type } from '@google/genai';
import { db } from './store';
import { ChatActionExecution, Patient, Opportunity, Task, Interaction } from '../types/crm';

export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
  actionExecuted?: ChatActionExecution;
}

// ==========================================
// REAL EXECUTABLE CRM TOOL FUNCTIONS
// ==========================================

export const crmTools = {
  /**
   * Localiza paciente por nome ou telefone
   */
  findPatient: (args: { nameOrPhone: string }): ToolResult => {
    const query = args.nameOrPhone?.trim();
    if (!query) {
      return { success: false, message: 'Nome ou telefone não fornecido para busca.' };
    }
    const found = db.findPatientByName(query);
    if (found.length === 0) {
      return {
        success: false,
        message: `Nenhum paciente encontrado com o termo "${query}".`,
        data: [],
      };
    }
    return {
      success: true,
      message: `Encontrado(s) ${found.length} paciente(s).`,
      data: found,
    };
  },

  /**
   * Lista ou filtra pacientes
   */
  findPatients: (args: { query?: string; status?: string; tag?: string }): ToolResult => {
    let list = db.getPatients();
    if (args.query) {
      const q = args.query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.phone.includes(q));
    }
    if (args.status) {
      list = list.filter((p) => p.status === args.status);
    }
    if (args.tag) {
      list = list.filter((p) => p.tags.some((t) => t.toLowerCase().includes(args.tag!.toLowerCase())));
    }
    return {
      success: true,
      message: `${list.length} paciente(s) localizado(s).`,
      data: list,
    };
  },

  /**
   * Cria um novo paciente no banco de dados
   */
  createPatient: (
    args: {
      name: string;
      phone?: string;
      origin?: string;
      tags?: string[];
      commercialNotes?: string;
      nextAction?: string;
      nextActionDate?: string;
    },
    author = 'Iza (Assistente Virtual)'
  ): ToolResult => {
    if (!args.name) {
      return { success: false, message: 'Nome do paciente é obrigatório.' };
    }

    // Check duplicate by phone or exact name
    const existing = db.findPatientByName(args.phone || args.name);
    if (existing.length > 0 && args.phone && existing.some((p) => p.phone.replace(/\D/g, '') === args.phone?.replace(/\D/g, ''))) {
      const match = existing[0];
      return {
        success: true,
        message: `Paciente "${match.name}" já está cadastrado com este telefone (${match.phone}).`,
        data: match,
      };
    }

    const patient = db.createPatient(
      {
        name: args.name.trim(),
        phone: args.phone || '',
        whatsapp: args.phone || '',
        origin: args.origin || 'WhatsApp / Conversa SDR',
        tags: args.tags || ['Novo Contato'],
        status: 'lead',
        commercialNotes: args.commercialNotes || '',
        nextAction: args.nextAction,
        nextActionDate: args.nextActionDate,
      },
      author
    );

    const actionExecuted: ChatActionExecution = {
      type: 'Cadastro de Paciente',
      description: `Cadastrada paciente: ${patient.name} (${patient.phone || 'Sem telefone'}).`,
      entityType: 'paciente',
      entityId: patient.id,
      entityName: patient.name,
    };

    return {
      success: true,
      message: `Paciente ${patient.name} cadastrada com sucesso no CRM.`,
      data: patient,
      actionExecuted,
    };
  },

  /**
   * Atualiza dados de paciente existente
   */
  updatePatient: (
    args: {
      patientId?: string;
      patientName?: string;
      phone?: string;
      status?: Patient['status'];
      nextAction?: string;
      nextActionDate?: string;
      commercialNotes?: string;
      addTags?: string[];
    },
    author = 'Iza (Assistente Virtual)'
  ): ToolResult => {
    let targetPatient: Patient | undefined;
    if (args.patientId) {
      targetPatient = db.findPatientById(args.patientId);
    } else if (args.patientName) {
      const found = db.findPatientByName(args.patientName);
      if (found.length > 0) targetPatient = found[0];
    }

    if (!targetPatient) {
      return {
        success: false,
        message: `Paciente "${args.patientName || args.patientId}" não foi encontrada no banco de dados.`,
      };
    }

    const updates: Partial<Patient> = {};
    if (args.phone) updates.phone = args.phone;
    if (args.status) updates.status = args.status;
    if (args.nextAction) updates.nextAction = args.nextAction;
    if (args.nextActionDate) updates.nextActionDate = args.nextActionDate;
    if (args.commercialNotes) updates.commercialNotes = args.commercialNotes;
    if (args.addTags && args.addTags.length > 0) {
      const merged = Array.from(new Set([...targetPatient.tags, ...args.addTags]));
      updates.tags = merged;
    }

    const updated = db.updatePatient(targetPatient.id, updates, author);

    const actionExecuted: ChatActionExecution = {
      type: 'Atualização de Paciente',
      description: `Atualizados dados da paciente ${targetPatient.name}.`,
      entityType: 'paciente',
      entityId: targetPatient.id,
      entityName: targetPatient.name,
    };

    return {
      success: true,
      message: `Paciente ${targetPatient.name} atualizada com sucesso.`,
      data: updated,
      actionExecuted,
    };
  },

  /**
   * Registra uma interação na timeline do paciente
   */
  createInteraction: (
    args: {
      patientId?: string;
      patientName?: string;
      type: Interaction['type'];
      content: string;
      author?: string;
      date?: string;
    },
    author = 'Iza (Assistente Virtual)'
  ): ToolResult => {
    let targetPatient: Patient | undefined;
    if (args.patientId) {
      targetPatient = db.findPatientById(args.patientId);
    } else if (args.patientName) {
      const found = db.findPatientByName(args.patientName);
      if (found.length > 0) targetPatient = found[0];
    }

    if (!targetPatient) {
      return {
        success: false,
        message: `Não foi possível registrar interação: paciente "${args.patientName || args.patientId}" não encontrada.`,
      };
    }

    const interaction = db.createInteraction({
      patientId: targetPatient.id,
      type: args.type || 'mensagem',
      content: args.content,
      author: args.author || author,
      date: args.date || new Date().toISOString(),
      origin: 'chat_ia',
    });

    const actionExecuted: ChatActionExecution = {
      type: 'Registro de Interação',
      description: `Registrada interação (${interaction.type}) na timeline de ${targetPatient.name}.`,
      entityType: 'paciente',
      entityId: targetPatient.id,
      entityName: targetPatient.name,
    };

    return {
      success: true,
      message: `Interação registrada na timeline de ${targetPatient.name}.`,
      data: interaction,
      actionExecuted,
    };
  },

  /**
   * Cria uma tarefa / follow-up no sistema
   */
  createTask: (
    args: {
      title: string;
      description?: string;
      date: string;
      time?: string;
      priority?: Task['priority'];
      category?: Task['category'];
      patientId?: string;
      patientName?: string;
      opportunityId?: string;
      responsible?: string;
    },
    author = 'Iza (Assistente Virtual)'
  ): ToolResult => {
    if (!args.title) {
      return { success: false, message: 'Título da tarefa é obrigatório.' };
    }

    let patientId = args.patientId;
    let patientName = args.patientName;

    if (!patientId && patientName) {
      const found = db.findPatientByName(patientName);
      if (found.length > 0) {
        patientId = found[0].id;
        patientName = found[0].name;
      }
    }

    const task = db.createTask(
      {
        title: args.title,
        description: args.description,
        date: args.date || '2026-10-04',
        time: args.time || '09:00',
        priority: args.priority || 'normal',
        category: args.category || 'follow-up',
        patientId,
        patientName,
        opportunityId: args.opportunityId,
        responsible: args.responsible || 'Camila Rocha (SDR)',
        status: 'pendente',
        origin: 'ia_chat',
      },
      author
    );

    // If patient linked, update patient's nextAction and nextActionDate
    if (patientId) {
      db.updatePatient(
        patientId,
        {
          nextAction: args.title,
          nextActionDate: args.date,
        },
        author
      );
    }

    const actionExecuted: ChatActionExecution = {
      type: 'Criação de Tarefa',
      description: `Criada tarefa: "${task.title}" para ${task.date} (${task.priority}).`,
      entityType: 'tarefa',
      entityId: task.id,
      entityName: task.title,
    };

    return {
      success: true,
      message: `Tarefa criada para ${task.date}: "${task.title}".`,
      data: task,
      actionExecuted,
    };
  },

  /**
   * Cria um follow-up específico associado a um paciente
   */
  createFollowUp: (
    args: {
      patientName: string;
      patientId?: string;
      date: string;
      reason: string;
      procedureName?: string;
      priority?: Task['priority'];
    },
    author = 'Iza (Assistente Virtual)'
  ): ToolResult => {
    let patient: Patient | undefined;
    if (args.patientId) {
      patient = db.findPatientById(args.patientId);
    } else {
      const found = db.findPatientByName(args.patientName);
      if (found.length > 0) patient = found[0];
    }

    const patientTitle = patient ? patient.name : args.patientName;
    const taskTitle = `Follow-up ${patientTitle} — ${args.reason}`;

    const task = db.createTask(
      {
        title: taskTitle,
        description: `Follow-up com ${patientTitle} sobre ${args.procedureName || args.reason}. Motivo: ${args.reason}`,
        date: args.date,
        time: '10:00',
        priority: args.priority || 'alta',
        category: 'follow-up',
        patientId: patient?.id,
        patientName: patientTitle,
        status: 'pendente',
        origin: 'ia_chat',
      },
      author
    );

    if (patient) {
      db.updatePatient(
        patient.id,
        {
          nextAction: args.reason,
          nextActionDate: args.date,
        },
        author
      );
    }

    const actionExecuted: ChatActionExecution = {
      type: 'Agendamento de Follow-up',
      description: `Follow-up agendado para ${args.date} com ${patientTitle}.`,
      entityType: 'tarefa',
      entityId: task.id,
      entityName: task.title,
    };

    return {
      success: true,
      message: `Follow-up com ${patientTitle} agendado para ${args.date}.`,
      data: task,
      actionExecuted,
    };
  },

  /**
   * Marca uma tarefa como concluída
   */
  completeTask: (args: { taskId?: string; patientName?: string; taskTitleQuery?: string }, author = 'Iza (Assistente Virtual)'): ToolResult => {
    let taskToComplete: Task | undefined;

    if (args.taskId) {
      taskToComplete = db.getTasks().find((t) => t.id === args.taskId);
    } else if (args.patientName) {
      const pName = args.patientName.toLowerCase();
      taskToComplete = db
        .getTasks()
        .find((t) => t.patientName?.toLowerCase().includes(pName) && t.status !== 'concluida');
    } else if (args.taskTitleQuery) {
      const q = args.taskTitleQuery.toLowerCase();
      taskToComplete = db.getTasks().find((t) => t.title.toLowerCase().includes(q) && t.status !== 'concluida');
    }

    if (!taskToComplete) {
      return {
        success: false,
        message: `Não foi encontrada nenhuma tarefa pendente para ${args.patientName || args.taskTitleQuery || args.taskId}.`,
      };
    }

    const updated = db.updateTask(taskToComplete.id, { status: 'concluida' }, author);

    const actionExecuted: ChatActionExecution = {
      type: 'Conclusão de Tarefa',
      description: `Tarefa "${taskToComplete.title}" concluída.`,
      entityType: 'tarefa',
      entityId: taskToComplete.id,
      entityName: taskToComplete.title,
    };

    return {
      success: true,
      message: `Tarefa "${taskToComplete.title}" marcada como concluída no sistema.`,
      data: updated,
      actionExecuted,
    };
  },

  /**
   * Cria ou atualiza oportunidade comercial
   */
  createOpportunity: (
    args: {
      patientName: string;
      patientId?: string;
      procedureName: string;
      stage?: Opportunity['stage'];
      estimatedValue?: number;
      interest?: string;
      objection?: string;
      nextAction?: string;
      nextActionDate?: string;
      notes?: string;
    },
    author = 'Iza (Assistente Virtual)'
  ): ToolResult => {
    let patient: Patient;
    if (args.patientId) {
      const p = db.findPatientById(args.patientId);
      if (p) {
        patient = p;
      } else {
        patient = db.createPatient({ name: args.patientName || 'Nova Paciente', status: 'lead' }, author);
      }
    } else {
      const found = db.findPatientByName(args.patientName);
      if (found.length > 0) {
        patient = found[0];
      } else {
        // Auto-create patient if not exists!
        patient = db.createPatient(
          {
            name: args.patientName || 'Nova Paciente',
            status: 'lead',
            origin: 'Chat Comercial Iza',
          },
          author
        );
      }
    }

    // Check if open opportunity already exists for this patient & procedure
    const existingOpp = db
      .getOpportunities()
      .find(
        (o) =>
          o.patientId === patient?.id &&
          o.stage !== 'fechado' &&
          o.stage !== 'perdido' &&
          (o.procedureName.toLowerCase().includes(args.procedureName.toLowerCase()) ||
            args.procedureName.toLowerCase().includes(o.procedureName.toLowerCase()))
      );

    if (existingOpp) {
      const updated = db.updateOpportunity(
        existingOpp.id,
        {
          stage: args.stage || existingOpp.stage,
          estimatedValue: args.estimatedValue || existingOpp.estimatedValue,
          interest: args.interest || existingOpp.interest,
          objection: args.objection || existingOpp.objection,
          nextAction: args.nextAction || existingOpp.nextAction,
          nextActionDate: args.nextActionDate || existingOpp.nextActionDate,
          notes: args.notes || existingOpp.notes,
        },
        author
      );

      const actionExecuted: ChatActionExecution = {
        type: 'Atualização de Oportunidade',
        description: `Atualizada oportunidade de ${patient.name} (${args.procedureName}) para "${args.stage || existingOpp.stage}".`,
        entityType: 'oportunidade',
        entityId: existingOpp.id,
        entityName: `${patient.name} - ${args.procedureName}`,
      };

      return {
        success: true,
        message: `Oportunidade de ${args.procedureName} para ${patient.name} atualizada.`,
        data: updated,
        actionExecuted,
      };
    }

    const opp = db.createOpportunity(
      {
        patientId: patient.id,
        patientName: patient.name,
        procedureName: args.procedureName,
        stage: args.stage || 'novo_interesse',
        estimatedValue: args.estimatedValue || 0,
        interest: args.interest || `Interesse em ${args.procedureName}`,
        objection: args.objection,
        nextAction: args.nextAction,
        nextActionDate: args.nextActionDate,
        notes: args.notes,
      },
      author
    );

    // Update patient nextAction
    if (args.nextAction) {
      db.updatePatient(
        patient.id,
        {
          nextAction: args.nextAction,
          nextActionDate: args.nextActionDate,
        },
        author
      );
    }

    const actionExecuted: ChatActionExecution = {
      type: 'Criação de Oportunidade',
      description: `Criada oportunidade: ${args.procedureName} (R$ ${args.estimatedValue || 0}) para ${patient.name}.`,
      entityType: 'oportunidade',
      entityId: opp.id,
      entityName: `${patient.name} - ${args.procedureName}`,
    };

    return {
      success: true,
      message: `Oportunidade de ${args.procedureName} criada para ${patient.name} com sucesso.`,
      data: opp,
      actionExecuted,
    };
  },

  /**
   * Move etapa de oportunidade no pipeline
   */
  moveOpportunity: (
    args: {
      patientName: string;
      newStage: Opportunity['stage'];
      procedureName?: string;
      reasonOrObjection?: string;
    },
    author = 'Iza (Assistente Virtual)'
  ): ToolResult => {
    const opps = db.getOpportunities();
    const pName = args.patientName.toLowerCase();
    const opp = opps.find((o) => {
      const matchPatient = o.patientName.toLowerCase().includes(pName);
      if (!matchPatient) return false;
      if (args.procedureName) {
        return o.procedureName.toLowerCase().includes(args.procedureName.toLowerCase());
      }
      return o.stage !== 'fechado' && o.stage !== 'perdido';
    });

    if (!opp) {
      return {
        success: false,
        message: `Não foi encontrada nenhuma oportunidade aberta para ${args.patientName}.`,
      };
    }

    const updates: Partial<Opportunity> = { stage: args.newStage };
    if (args.reasonOrObjection) {
      updates.objection = args.reasonOrObjection;
    }

    const updated = db.updateOpportunity(opp.id, updates, author);

    const actionExecuted: ChatActionExecution = {
      type: 'Movimentação no Pipeline',
      description: `Oportunidade de ${opp.patientName} (${opp.procedureName}) movida para "${args.newStage}".`,
      entityType: 'oportunidade',
      entityId: opp.id,
      entityName: `${opp.patientName} - ${opp.procedureName}`,
    };

    return {
      success: true,
      message: `Oportunidade de ${opp.patientName} movida para ${args.newStage}.`,
      data: updated,
      actionExecuted,
    };
  },

  /**
   * Consulta tarefas de uma determinada data (padrão: hoje)
   */
  getTodayTasks: (args: { date?: string }): ToolResult => {
    const targetDate = args.date || '2026-10-04';
    const tasks = db.getTasks().filter((t) => t.date === targetDate && t.status !== 'concluida');
    return {
      success: true,
      message: `Encontradas ${tasks.length} tarefa(s) para a data ${targetDate}.`,
      data: tasks,
    };
  },

  /**
   * Consulta tarefas atrasadas
   */
  getOverdueTasks: (): ToolResult => {
    const todayStr = '2026-10-04';
    const overdue = db.getTasks().filter((t) => (t.status === 'atrasada' || t.status === 'pendente') && t.date < todayStr);
    return {
      success: true,
      message: `Encontradas ${overdue.length} tarefa(s) atrasada(s).`,
      data: overdue,
    };
  },

  /**
   * Consulta histórico e ficha completa de paciente
   */
  getPatientHistory: (args: { patientName: string }): ToolResult => {
    const found = db.findPatientByName(args.patientName);
    if (found.length === 0) {
      return {
        success: false,
        message: `Paciente "${args.patientName}" não encontrada no banco de dados.`,
      };
    }
    const patient = found[0];
    const interactions = db.getInteractions(patient.id);
    const opportunities = db.getOpportunities().filter((o) => o.patientId === patient.id);
    const tasks = db.getTasks().filter((t) => t.patientId === patient.id);

    return {
      success: true,
      message: `Histórico completo de ${patient.name} carregado.`,
      data: {
        patient,
        interactions,
        opportunities,
        tasks,
      },
    };
  },

  /**
   * Busca oportunidades que não possuem próxima ação definida
   */
  getOpportunitiesWithoutNextAction: (): ToolResult => {
    const opps = db.getOpportunities().filter((o) => !o.nextAction && o.stage !== 'fechado' && o.stage !== 'perdido');
    return {
      success: true,
      message: `Existem ${opps.length} oportunidade(s) abertas sem próxima ação definida.`,
      data: opps,
    };
  },

  /**
   * Busca global no CRM
   */
  searchCRM: (args: { query: string }): ToolResult => {
    const results = db.globalSearch(args.query);
    return {
      success: true,
      message: `Busca por "${args.query}" concluída.`,
      data: results,
    };
  },
};

// ==========================================
// GEMINI FUNCTION DECLARATIONS
// ==========================================

export const crmFunctionDeclarations: FunctionDeclaration[] = [
  {
    name: 'createPatient',
    description: 'Cadastra um novo paciente no banco de dados do CRM. Deve ser chamado quando a usuária informar um novo paciente ou lead.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Nome completo do paciente' },
        phone: { type: Type.STRING, description: 'Telefone ou WhatsApp com DDD' },
        origin: { type: Type.STRING, description: 'Origem do lead (ex: WhatsApp Direto, Instagram, Indicação)' },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Tags para categorização' },
        commercialNotes: { type: Type.STRING, description: 'Observações comerciais iniciais' },
        nextAction: { type: Type.STRING, description: 'Próxima ação comercial programada' },
        nextActionDate: { type: Type.STRING, description: 'Data da próxima ação no formato YYYY-MM-DD' },
      },
      required: ['name'],
    },
  },
  {
    name: 'findPatient',
    description: 'Busca pacientes no CRM por nome ou telefone.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        nameOrPhone: { type: Type.STRING, description: 'Nome ou telefone do paciente a ser buscado' },
      },
      required: ['nameOrPhone'],
    },
  },
  {
    name: 'updatePatient',
    description: 'Atualiza dados cadastrais, telefone, tags, status ou próxima ação de um paciente existente.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientName: { type: Type.STRING, description: 'Nome do paciente a atualizar' },
        phone: { type: Type.STRING, description: 'Novo telefone' },
        status: { type: Type.STRING, description: 'Novo status (lead, ativo, em_tratamento, retorno, inativo)' },
        nextAction: { type: Type.STRING, description: 'Descrição da próxima ação comercial' },
        nextActionDate: { type: Type.STRING, description: 'Data da próxima ação no formato YYYY-MM-DD' },
        commercialNotes: { type: Type.STRING, description: 'Notas comerciais a acrescentar' },
      },
      required: ['patientName'],
    },
  },
  {
    name: 'createInteraction',
    description: 'Registra um atendimento, mensagem, conversa no WhatsApp ou observação na timeline oficial do paciente.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientName: { type: Type.STRING, description: 'Nome do paciente' },
        type: { type: Type.STRING, description: 'Tipo da interação: atendimento, procedimento, mensagem, whatsapp, proposta, follow_up, objecao, venda' },
        content: { type: Type.STRING, description: 'Texto descritivo do que aconteceu ou foi conversado' },
        date: { type: Type.STRING, description: 'Data da interação em formato ISO ou YYYY-MM-DD' },
      },
      required: ['patientName', 'content'],
    },
  },
  {
    name: 'createTask',
    description: 'Cria uma tarefa operacional ou lembrete na agenda do CRM vinculada ou não a um paciente.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Título claro da tarefa' },
        description: { type: Type.STRING, description: 'Instruções adicionais da tarefa' },
        date: { type: Type.STRING, description: 'Data de execução (formato YYYY-MM-DD)' },
        time: { type: Type.STRING, description: 'Horário sugerido (ex: 10:00)' },
        priority: { type: Type.STRING, description: 'baixa, normal, alta ou urgente' },
        category: { type: Type.STRING, description: 'follow-up, retorno, orcamento, lead, reativacao, comercial, administrativo' },
        patientName: { type: Type.STRING, description: 'Nome do paciente vinculado se aplicável' },
      },
      required: ['title', 'date'],
    },
  },
  {
    name: 'createFollowUp',
    description: 'Programa um follow-up comercial direto com um paciente em uma data específica.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientName: { type: Type.STRING, description: 'Nome do paciente' },
        date: { type: Type.STRING, description: 'Data do follow-up no formato YYYY-MM-DD' },
        reason: { type: Type.STRING, description: 'Motivo do contato (ex: Retorno sobre Sculptra, Decisão do botox)' },
        procedureName: { type: Type.STRING, description: 'Procedimento de interesse' },
        priority: { type: Type.STRING, description: 'normal ou alta' },
      },
      required: ['patientName', 'date', 'reason'],
    },
  },
  {
    name: 'completeTask',
    description: 'Marca uma tarefa pendente como concluída no banco de dados.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientName: { type: Type.STRING, description: 'Nome do paciente associado à tarefa' },
        taskTitleQuery: { type: Type.STRING, description: 'Palavras do título da tarefa' },
      },
    },
  },
  {
    name: 'createOpportunity',
    description: 'Cria ou atualiza uma oportunidade comercial no funil de vendas (Pipeline).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientName: { type: Type.STRING, description: 'Nome do paciente' },
        procedureName: { type: Type.STRING, description: 'Nome do procedimento ou protocolo' },
        stage: { type: Type.STRING, description: 'novo_interesse, qualificacao, agendamento, proposta, aguardando_decisao, follow_up, fechado, perdido, reativacao' },
        estimatedValue: { type: Type.NUMBER, description: 'Valor estimado em reais (ex: 1450)' },
        interest: { type: Type.STRING, description: 'Detalhes do interesse do paciente' },
        objection: { type: Type.STRING, description: 'Objeção apresentada pelo paciente' },
        nextAction: { type: Type.STRING, description: 'Próxima ação comercial programada' },
        nextActionDate: { type: Type.STRING, description: 'Data da próxima ação (YYYY-MM-DD)' },
      },
      required: ['patientName', 'procedureName'],
    },
  },
  {
    name: 'moveOpportunity',
    description: 'Move a etapa de uma oportunidade existente no funil de vendas (ex: para aguardando_decisao, fechado, perdido).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientName: { type: Type.STRING, description: 'Nome do paciente' },
        newStage: { type: Type.STRING, description: 'novo_interesse, proposta, aguardando_decisao, follow_up, fechado, perdido' },
        procedureName: { type: Type.STRING, description: 'Procedimento se houver múltiplos' },
        reasonOrObjection: { type: Type.STRING, description: 'Motivo de perda ou objeção' },
      },
      required: ['patientName', 'newStage'],
    },
  },
  {
    name: 'getTodayTasks',
    description: 'Consulta tarefas e follow-ups cadastrados para uma data (padrão: hoje).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: 'Data a consultar (YYYY-MM-DD)' },
      },
    },
  },
  {
    name: 'getOverdueTasks',
    description: 'Consulta tarefas e follow-ups que estão atrasados no CRM.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'getPatientHistory',
    description: 'Consulta o histórico completo do paciente: ficha, timeline de atendimentos, oportunidades no pipeline e tarefas programadas.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientName: { type: Type.STRING, description: 'Nome do paciente a consultar' },
      },
      required: ['patientName'],
    },
  },
  {
    name: 'getOpportunitiesWithoutNextAction',
    description: 'Lista oportunidades no pipeline que estão abertas e sem nenhuma próxima ação agendada.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'searchCRM',
    description: 'Executa busca textual livre em todo o CRM (pacientes, tarefas, oportunidades, procedimentos).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Termo de busca' },
      },
      required: ['query'],
    },
  },
];

/**
 * Despachador de ferramentas que executa a chamada e garante a gravação no banco
 */
export function executeCRMTool(name: string, args: any, author = 'Iza (Assistente Virtual)'): ToolResult {
  console.log(`[CRM Tools Execution] Calling "${name}" with args:`, JSON.stringify(args));
  const toolFn = (crmTools as any)[name];
  if (!toolFn) {
    return {
      success: false,
      message: `Ferramenta "${name}" não encontrada no sistema.`,
    };
  }
  try {
    return toolFn(args, author);
  } catch (err: any) {
    console.error(`[CRM Tool Error in ${name}]:`, err);
    return {
      success: false,
      message: `Erro ao executar ${name}: ${err.message}`,
    };
  }
}
