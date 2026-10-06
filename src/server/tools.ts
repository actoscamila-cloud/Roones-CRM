import { FunctionDeclaration, Type } from '@google/genai';
import { db } from './store';
import { ChatActionExecution, Patient, Opportunity, Task, Interaction, ClientAccount } from '../types/crm';

export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
  actionExecuted?: ChatActionExecution;
  duplicateFound?: boolean;
  ambiguousMatches?: Array<{ patientName: string; clientName: string }>;
}

function cleanDigits(val?: string): string {
  if (!val) return '';
  return val.replace(/\D/g, '');
}

function formatBrazilianPhone(phone: string): string {
  const digits = cleanDigits(phone);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

// ==========================================
// REAL EXECUTABLE CRM TOOL FUNCTIONS (MULTI-CLIENT)
// ==========================================

export const crmTools = {
  /**
   * 1. findPatient: Localiza paciente considerando cliente ou geral
   */
  findPatient: (args: { nameOrPhone: string; clientName?: string }): ToolResult => {
    const query = args.nameOrPhone?.trim();
    if (!query) {
      return { success: false, message: 'Nome ou telefone não fornecido para busca.' };
    }

    let targetClientId: string | undefined;
    if (args.clientName) {
      const client = db.findClientByName(args.clientName);
      if (client) targetClientId = client.id;
    }

    const found = db.findPatientByName(query, targetClientId);
    if (found.length === 0) {
      return {
        success: false,
        message: `Nenhum paciente encontrado com o termo "${query}"${args.clientName ? ` na conta ${args.clientName}` : ''}.`,
        data: [],
      };
    }

    // Se houver mais de um paciente com o mesmo nome em clientes diferentes
    if (found.length > 1 && !targetClientId) {
      const options = found.map((p) => `${p.name} (${p.clientName})`).join(', ');
      return {
        success: true,
        message: `Encontrei mais de uma paciente: ${options}. De qual clínica você deseja consultar?`,
        data: found,
        ambiguousMatches: found.map((p) => ({ patientName: p.name, clientName: p.clientName || '' })),
      };
    }

    const patient = found[0];
    const opps = db.getOpportunities().filter((o) => o.patientId === patient.id);
    const oppText = opps.length > 0
      ? opps.map((o) => `${o.procedureName} (R$ ${o.estimatedValue || 0} - etapa: ${o.stage})`).join(', ')
      : 'Nenhuma oportunidade aberta';
    const nextAct = patient.nextAction ? `${patient.nextAction} (${patient.nextActionDate || 'sem data'})` : 'Nenhuma próxima ação';

    return {
      success: true,
      message: `Aqui estão os dados da paciente ${patient.name} [${patient.clientName}]:\n• Telefone: ${patient.phone || 'Não informado'}\n• Status: ${patient.status}\n• Oportunidades: ${oppText}\n• Próxima Ação: ${nextAct}`,
      data: found,
    };
  },

  /**
   * 2. findPatients: Lista ou filtra pacientes por múltiplos critérios
   */
  findPatients: (args: { query?: string; status?: string; tag?: string; clientName?: string; withoutNextAction?: boolean }): ToolResult => {
    let targetClientId: string | undefined;
    if (args.clientName) {
      const client = db.findClientByName(args.clientName);
      if (client) targetClientId = client.id;
    }

    let list = db.getPatients(targetClientId);
    if (args.query) {
      const q = args.query.toLowerCase();
      const qDigits = cleanDigits(args.query);
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (qDigits && cleanDigits(p.phone).includes(qDigits))
      );
    }
    if (args.status) {
      list = list.filter((p) => p.status === args.status);
    }
    if (args.tag) {
      list = list.filter((p) => p.tags.some((t) => t.toLowerCase().includes(args.tag!.toLowerCase())));
    }
    if (args.withoutNextAction) {
      list = list.filter((p) => !p.nextAction || p.nextAction.trim() === '');
    }

    if (list.length === 1) {
      const patient = list[0];
      const opps = db.getOpportunities().filter((o) => o.patientId === patient.id);
      const oppText = opps.length > 0
        ? opps.map((o) => `${o.procedureName} (R$ ${o.estimatedValue || 0} - etapa: ${o.stage})`).join(', ')
        : 'Nenhuma oportunidade aberta';
      const nextAct = patient.nextAction ? `${patient.nextAction} (${patient.nextActionDate || 'sem data'})` : 'Nenhuma próxima ação';
      return {
        success: true,
        message: `Aqui estão os dados da paciente ${patient.name} [${patient.clientName}]:\n• Telefone: ${patient.phone || 'Não informado'}\n• Status: ${patient.status}\n• Oportunidades: ${oppText}\n• Próxima Ação: ${nextAct}`,
        data: list,
      };
    }

    const lines = list.slice(0, 8).map((p) => `• ${p.name} [${p.clientName}] (${p.phone || 'Sem fone'}) - Status: ${p.status}`).join('\n');
    return {
      success: true,
      message: `Encontrado(s) ${list.length} paciente(s)${args.clientName ? ` na conta ${args.clientName}` : ''}:\n\n${lines}`,
      data: list,
    };
  },

  /**
   * 3. createPatient: Cadastra novo paciente vinculado ao cliente correto
   */
  createPatient: (
    args: {
      name: string;
      phone?: string;
      clientName?: string;
      clientId?: string;
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

    // Identifica o cliente
    let client: ClientAccount | undefined;
    if (args.clientId) {
      client = db.getClientById(args.clientId);
    } else if (args.clientName) {
      client = db.findClientByName(args.clientName);
    }

    // Default: Clínica Camila Silva se não especificado
    if (!client) {
      client = db.getClientById('cli-camila-silva') || db.getClients()[0];
    }

    const cleanInputPhone = cleanDigits(args.phone);

    // Duplicity check by phone inside the specific client!
    if (cleanInputPhone && cleanInputPhone.length >= 8) {
      const clientPatients = db.getPatients(client.id);
      const match = clientPatients.find((p) => cleanDigits(p.phone).includes(cleanInputPhone) || cleanInputPhone.includes(cleanDigits(p.phone)));
      if (match) {
        return {
          success: false,
          duplicateFound: true,
          message: `Encontrei a paciente ${match.name} com esse telefone (${match.phone}) em ${client.name}. É esta? Para evitar contatos duplicados, mantive o cadastro existente.`,
          data: match,
        };
      }
    }

    const formattedPhone = args.phone ? formatBrazilianPhone(args.phone) : '';

    const patient = db.createPatient(
      {
        name: args.name.trim(),
        phone: formattedPhone,
        whatsapp: cleanInputPhone ? `55${cleanInputPhone}` : '',
        clientId: client.id,
        clientName: client.name,
        origin: args.origin || 'Conversa com Iza (SDR)',
        tags: args.tags && args.tags.length > 0 ? args.tags : ['Novo Contato', client.shortName],
        status: 'lead',
        commercialNotes: args.commercialNotes || '',
        nextAction: args.nextAction,
        nextActionDate: args.nextActionDate,
      },
      author
    );

    const actionExecuted: ChatActionExecution = {
      type: 'Cadastro de Paciente',
      description: `Cadastrada paciente: ${patient.name}${patient.phone ? ` (${patient.phone})` : ''} para ${client.name}.`,
      entityType: 'paciente',
      entityId: patient.id,
      entityName: patient.name,
      clientName: client.name,
    };

    return {
      success: true,
      message: `Paciente ${patient.name} cadastrada com sucesso para a ${client.name}.`,
      data: patient,
      actionExecuted,
    };
  },

  /**
   * 4. updatePatient: Atualiza dados cadastrais
   */
  updatePatient: (
    args: {
      patientId?: string;
      patientName?: string;
      clientName?: string;
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
      let targetClientId: string | undefined;
      if (args.clientName) {
        const cl = db.findClientByName(args.clientName);
        if (cl) targetClientId = cl.id;
      }
      const found = db.findPatientByName(args.patientName, targetClientId);
      if (found.length > 0) targetPatient = found[0];
    }

    if (!targetPatient) {
      return {
        success: false,
        message: `Paciente "${args.patientName || args.patientId}" não foi encontrada no banco de dados.`,
      };
    }

    const updates: Partial<Patient> = {};
    if (args.phone) updates.phone = formatBrazilianPhone(args.phone);
    if (args.status) updates.status = args.status;
    if (args.nextAction !== undefined) updates.nextAction = args.nextAction;
    if (args.nextActionDate !== undefined) updates.nextActionDate = args.nextActionDate;
    if (args.commercialNotes) updates.commercialNotes = args.commercialNotes;
    if (args.addTags && args.addTags.length > 0) {
      const merged = Array.from(new Set([...targetPatient.tags, ...args.addTags]));
      updates.tags = merged;
    }

    const updated = db.updatePatient(targetPatient.id, updates, author);

    const actionExecuted: ChatActionExecution = {
      type: 'Atualização de Paciente',
      description: `Atualizados dados da paciente ${targetPatient.name} (${targetPatient.clientName}).`,
      entityType: 'paciente',
      entityId: targetPatient.id,
      entityName: targetPatient.name,
      clientName: targetPatient.clientName,
    };

    return {
      success: true,
      message: `Paciente ${targetPatient.name} atualizada com sucesso.`,
      data: updated,
      actionExecuted,
    };
  },

  /**
   * 5. createInteraction: Registra interação na timeline do paciente
   */
  createInteraction: (
    args: {
      patientId?: string;
      patientName?: string;
      clientName?: string;
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
      let targetClientId: string | undefined;
      if (args.clientName) {
        const cl = db.findClientByName(args.clientName);
        if (cl) targetClientId = cl.id;
      }
      const found = db.findPatientByName(args.patientName, targetClientId);
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
      clientId: targetPatient.clientId,
      clientName: targetPatient.clientName,
      type: args.type || 'mensagem',
      content: args.content,
      author: args.author || author,
      date: args.date || new Date().toISOString(),
      origin: 'chat_ia',
    });

    const actionExecuted: ChatActionExecution = {
      type: 'Registro de Interação',
      description: `Registrada interação (${interaction.type}) na timeline de ${targetPatient.name} (${targetPatient.clientName}).`,
      entityType: 'paciente',
      entityId: targetPatient.id,
      entityName: targetPatient.name,
      clientName: targetPatient.clientName,
    };

    return {
      success: true,
      message: `Interação registrada na timeline de ${targetPatient.name}.`,
      data: interaction,
      actionExecuted,
    };
  },

  /**
   * 6. createTask: Cria tarefa para um cliente OU tarefa interna sem cliente
   */
  createTask: (
    args: {
      title: string;
      description?: string;
      date: string;
      time?: string;
      priority?: Task['priority'];
      category?: Task['category'];
      clientName?: string;
      patientName?: string;
      opportunityId?: string;
      responsible?: string;
    },
    author = 'Iza (Assistente Virtual)'
  ): ToolResult => {
    if (!args.title) {
      return { success: false, message: 'Título da tarefa é obrigatório.' };
    }

    let client: ClientAccount | undefined;
    if (args.clientName) {
      client = db.findClientByName(args.clientName);
    }

    let patient: Patient | undefined;
    if (args.patientName) {
      const found = db.findPatientByName(args.patientName, client?.id);
      if (found.length > 0) {
        patient = found[0];
        if (!client) client = db.getClientById(patient.clientId);
      }
    }

    const isInternal = args.category === 'interna' || (!client && !patient && !args.clientName);

    const task = db.createTask(
      {
        title: args.title,
        description: args.description,
        date: args.date || '2026-10-04',
        time: args.time || '10:00',
        priority: args.priority || 'normal',
        category: isInternal ? 'interna' : (args.category || 'comercial'),
        clientId: client?.id,
        clientName: client?.name,
        patientId: patient?.id,
        patientName: patient?.name,
        opportunityId: args.opportunityId,
        responsible: args.responsible || 'Camila Rocha',
        status: 'pendente',
        origin: 'ia_chat',
      },
      author
    );

    if (patient) {
      db.updatePatient(
        patient.id,
        {
          nextAction: args.title,
          nextActionDate: args.date,
        },
        author
      );
    }

    const actionExecuted: ChatActionExecution = {
      type: 'Criação de Tarefa',
      description: `Criada tarefa: "${task.title}" para ${task.date} (${task.clientName || 'Interna'}).`,
      entityType: 'tarefa',
      entityId: task.id,
      entityName: task.title,
      clientName: task.clientName,
    };

    return {
      success: true,
      message: `Tarefa criada para ${task.date}: "${task.title}"${task.clientName ? ` (${task.clientName})` : ' (Interna)'}.`,
      data: task,
      actionExecuted,
    };
  },

  /**
   * 7. updateTask: Atualiza uma tarefa existente
   */
  updateTask: (
    args: {
      taskId: string;
      title?: string;
      date?: string;
      status?: Task['status'];
      priority?: Task['priority'];
      description?: string;
    },
    author = 'Iza (Assistente Virtual)'
  ): ToolResult => {
    const updated = db.updateTask(args.taskId, args, author);
    if (!updated) {
      return { success: false, message: `Tarefa com ID ${args.taskId} não encontrada.` };
    }
    const actionExecuted: ChatActionExecution = {
      type: 'Atualização de Tarefa',
      description: `Tarefa "${updated.title}" atualizada (${updated.status}).`,
      entityType: 'tarefa',
      entityId: updated.id,
      entityName: updated.title,
      clientName: updated.clientName,
    };
    return {
      success: true,
      message: `Tarefa "${updated.title}" atualizada com sucesso.`,
      data: updated,
      actionExecuted,
    };
  },

  /**
   * 8. completeTask: Marca tarefa como concluída
   */
  completeTask: (
    args: { taskId?: string; patientName?: string; taskTitleQuery?: string; clientName?: string },
    author = 'Iza (Assistente Virtual)'
  ): ToolResult => {
    let taskToComplete: Task | undefined;

    let targetClientId: string | undefined;
    if (args.clientName) {
      const cl = db.findClientByName(args.clientName);
      if (cl) targetClientId = cl.id;
    }

    const pool = db.getTasks(targetClientId);

    if (args.taskId) {
      taskToComplete = pool.find((t) => t.id === args.taskId);
    } else if (args.patientName) {
      const pTarget = args.patientName.trim().toLowerCase();
      // 1. Match exato ou substring do nome completo
      taskToComplete = pool.find((t) => {
        if (t.status === 'concluida') return false;
        if (!t.patientName) return false;
        const pCurrent = t.patientName.toLowerCase();
        return pCurrent.includes(pTarget) || pTarget.includes(pCurrent);
      });

      // 2. Se não encontrou, tenta por partes do nome (ex: "Ana Beatriz")
      if (!taskToComplete) {
        const targetParts = pTarget.split(/\s+/).filter((w) => w.length > 2);
        taskToComplete = pool.find((t) => {
          if (t.status === 'concluida') return false;
          const pCurrent = (t.patientName || '').toLowerCase();
          const tTitle = t.title.toLowerCase();
          return targetParts.every((part) => pCurrent.includes(part) || tTitle.includes(part));
        });
      }

      // 3. Se ainda não encontrou, tenta pelo primeiro nome (>2 chars)
      if (!taskToComplete) {
        const firstWord = pTarget.split(/\s+/)[0];
        if (firstWord && firstWord.length > 2) {
          taskToComplete = pool.find((t) => {
            if (t.status === 'concluida') return false;
            const pWords = (t.patientName || '').toLowerCase().split(/\s+/);
            const tWords = t.title.toLowerCase().split(/\s+/);
            return pWords.includes(firstWord) || tWords.includes(firstWord);
          });
        }
      }
    } else if (args.taskTitleQuery) {
      const q = args.taskTitleQuery.toLowerCase();
      taskToComplete = pool.find((t) => t.title.toLowerCase().includes(q) && t.status !== 'concluida');
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
      clientName: taskToComplete.clientName,
    };

    return {
      success: true,
      message: `Tarefa "${taskToComplete.title}" marcada como concluída no sistema.`,
      data: updated,
      actionExecuted,
    };
  },

  /**
   * 9. createOpportunity: Cria ou atualiza oportunidade vinculada a cliente e paciente
   */
  createOpportunity: (
    args: {
      patientName: string;
      procedureName: string;
      clientName?: string;
      clientId?: string;
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
    let client: ClientAccount | undefined;
    if (args.clientId) {
      client = db.getClientById(args.clientId);
    } else if (args.clientName) {
      client = db.findClientByName(args.clientName);
    }

    let patient: Patient | undefined;
    const found = db.findPatientByName(args.patientName, client?.id);
    if (found.length > 0) {
      patient = found[0];
      if (!client) client = db.getClientById(patient.clientId);
    } else {
      if (!client) client = db.getClientById('cli-camila-silva') || db.getClients()[0];
      patient = db.createPatient(
        {
          name: args.patientName || 'Nova Paciente',
          status: 'lead',
          clientId: client.id,
          clientName: client.name,
          origin: 'Chat Comercial Iza',
        },
        author
      );
    }

    if (!client) {
      client = db.getClientById(patient.clientId) || db.getClients()[0];
    }

    const existingOpp = db
      .getOpportunities(client.id)
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
          nextAction: args.nextAction !== undefined ? args.nextAction : existingOpp.nextAction,
          nextActionDate: args.nextActionDate !== undefined ? args.nextActionDate : existingOpp.nextActionDate,
          notes: args.notes || existingOpp.notes,
        },
        author
      );

      const actionExecuted: ChatActionExecution = {
        type: 'Atualização de Oportunidade',
        description: `Atualizada oportunidade de ${patient.name} (${args.procedureName}) na ${client.name}.`,
        entityType: 'oportunidade',
        entityId: existingOpp.id,
        entityName: `${patient.name} - ${args.procedureName}`,
        clientName: client.name,
      };

      return {
        success: true,
        message: `Oportunidade de ${args.procedureName} para ${patient.name} (${client.name}) atualizada.`,
        data: updated,
        actionExecuted,
      };
    }

    const opp = db.createOpportunity(
      {
        clientId: client.id,
        clientName: client.name,
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
      description: `Criada oportunidade: ${args.procedureName} (R$ ${args.estimatedValue || 0}) para ${patient.name} [${client.name}].`,
      entityType: 'oportunidade',
      entityId: opp.id,
      entityName: `${patient.name} - ${args.procedureName}`,
      clientName: client.name,
    };

    return {
      success: true,
      message: `Oportunidade de ${args.procedureName} criada para ${patient.name} na ${client.name} com sucesso.`,
      data: opp,
      actionExecuted,
    };
  },

  /**
   * 10. moveOpportunity: Move etapa no pipeline
   */
  moveOpportunity: (
    args: {
      patientName: string;
      newStage: Opportunity['stage'];
      procedureName?: string;
      clientName?: string;
      reasonOrObjection?: string;
    },
    author = 'Iza (Assistente Virtual)'
  ): ToolResult => {
    let targetClientId: string | undefined;
    if (args.clientName) {
      const cl = db.findClientByName(args.clientName);
      if (cl) targetClientId = cl.id;
    }

    const opps = db.getOpportunities(targetClientId);
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
        message: `Não foi encontrada nenhuma oportunidade aberta para ${args.patientName}${args.clientName ? ` na conta ${args.clientName}` : ''}.`,
      };
    }

    const updates: Partial<Opportunity> = { stage: args.newStage };
    if (args.reasonOrObjection) updates.objection = args.reasonOrObjection;

    const updated = db.updateOpportunity(opp.id, updates, author);

    const actionExecuted: ChatActionExecution = {
      type: 'Movimentação no Pipeline',
      description: `Oportunidade de ${opp.patientName} (${opp.procedureName}) movida para "${args.newStage}".`,
      entityType: 'oportunidade',
      entityId: opp.id,
      entityName: `${opp.patientName} - ${opp.procedureName}`,
      clientName: opp.clientName,
    };

    return {
      success: true,
      message: `Oportunidade de ${opp.patientName} (${opp.clientName}) movida para ${args.newStage}.`,
      data: updated,
      actionExecuted,
    };
  },

  /**
   * 11. createFollowUp: Programa follow-up com cliente e data
   */
  createFollowUp: (
    args: {
      patientName: string;
      date: string;
      reason: string;
      procedureName?: string;
      clientName?: string;
      priority?: Task['priority'];
    },
    author = 'Iza (Assistente Virtual)'
  ): ToolResult => {
    let client: ClientAccount | undefined;
    if (args.clientName) {
      client = db.findClientByName(args.clientName);
    }

    let patient: Patient | undefined;
    const found = db.findPatientByName(args.patientName, client?.id);
    if (found.length > 0) {
      patient = found[0];
      if (!client) client = db.getClientById(patient.clientId);
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
        clientId: client?.id,
        clientName: client?.name,
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
      description: `Follow-up agendado para ${args.date} com ${patientTitle} (${task.clientName || 'Cliente'}).`,
      entityType: 'tarefa',
      entityId: task.id,
      entityName: task.title,
      clientName: task.clientName,
    };

    return {
      success: true,
      message: `Follow-up com ${patientTitle} agendado para ${args.date}${task.clientName ? ` na ${task.clientName}` : ''}.`,
      data: task,
      actionExecuted,
    };
  },

  /**
   * 12. getTodayTasks: Consulta tarefas por data e por cliente (ou geral de todas as clínicas)
   */
  getTodayTasks: (args: { date?: string; clientName?: string }): ToolResult => {
    const targetDate = args.date || '2026-10-04';

    let targetClientId: string | undefined;
    let clientAccount: ClientAccount | undefined;
    if (args.clientName) {
      clientAccount = db.findClientByName(args.clientName);
      if (clientAccount) targetClientId = clientAccount.id;
    }

    const allTasks = db.getTasks(targetClientId);
    const todayTasks = allTasks.filter((t) => t.date === targetDate && t.status !== 'concluida');

    return {
      success: true,
      message: `Encontradas ${todayTasks.length} tarefa(s) para ${targetDate}${clientAccount ? ` na ${clientAccount.name}` : ' em todas as contas'}.`,
      data: todayTasks,
    };
  },

  /**
   * 13. getOverdueTasks: Consulta tarefas atrasadas filtradas ou consolidadas
   */
  getOverdueTasks: (args?: { clientName?: string }): ToolResult => {
    const todayStr = '2026-10-04';
    let targetClientId: string | undefined;
    if (args?.clientName) {
      const cl = db.findClientByName(args.clientName);
      if (cl) targetClientId = cl.id;
    }

    const overdue = db.getTasks(targetClientId).filter((t) => (t.status === 'atrasada' || t.status === 'pendente') && t.date < todayStr);
    return {
      success: true,
      message: `Encontradas ${overdue.length} tarefa(s) atrasada(s).`,
      data: overdue,
    };
  },

  /**
   * 14. getPipeline: Visão geral de oportunidades filtradas por cliente ou total
   */
  getPipeline: (args?: { clientName?: string }): ToolResult => {
    let targetClientId: string | undefined;
    if (args?.clientName) {
      const cl = db.findClientByName(args.clientName);
      if (cl) targetClientId = cl.id;
    }

    const opps = db.getOpportunities(targetClientId);
    const totalValue = opps.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
    return {
      success: true,
      message: `Pipeline com ${opps.length} oportunidades totalizando R$ ${totalValue.toLocaleString('pt-BR')}.`,
      data: opps,
    };
  },

  /**
   * 15. getOpportunitiesWithoutNextAction: Lista oportunidades sem próxima ação
   */
  getOpportunitiesWithoutNextAction: (args?: { clientName?: string }): ToolResult => {
    let targetClientId: string | undefined;
    if (args?.clientName) {
      const cl = db.findClientByName(args.clientName);
      if (cl) targetClientId = cl.id;
    }

    const opps = db.getOpportunities(targetClientId).filter((o) => (!o.nextAction || o.nextAction.trim() === '') && o.stage !== 'fechado' && o.stage !== 'perdido');
    return {
      success: true,
      message: `Existem ${opps.length} oportunidade(s) abertas sem próxima ação definida.`,
      data: opps,
    };
  },

  /**
   * 16. getClientsSummary: Visão consolidada das clínicas atendidas
   */
  getClientsSummary: (): ToolResult => {
    const clients = db.getClients();
    const tasks = db.getTasks();
    const opps = db.getOpportunities();

    const summary = clients.map((c) => {
      const clientTasks = tasks.filter((t) => t.clientId === c.id && t.status !== 'concluida');
      const clientOpps = opps.filter((o) => o.clientId === c.id && o.stage !== 'fechado' && o.stage !== 'perdido');
      return {
        id: c.id,
        name: c.name,
        shortName: c.shortName,
        doctorOrOwner: c.doctorOrOwner,
        pendingTasks: clientTasks.length,
        openOpportunities: clientOpps.length,
        pipelineValue: clientOpps.reduce((s, o) => s + (o.estimatedValue || 0), 0),
      };
    });

    const internalTasks = tasks.filter((t) => !t.clientId && t.status !== 'concluida');

    return {
      success: true,
      message: `Você atende ${clients.length} contas comerciais e possui ${internalTasks.length} tarefas internas pendentes.`,
      data: { clients: summary, internalTasksCount: internalTasks.length },
    };
  },

  /**
   * 17. getPatientHistory: Consulta ficha completa da paciente
   */
  getPatientHistory: (args: { patientName: string; clientName?: string }): ToolResult => {
    let targetClientId: string | undefined;
    if (args.clientName) {
      const cl = db.findClientByName(args.clientName);
      if (cl) targetClientId = cl.id;
    }

    const found = db.findPatientByName(args.patientName, targetClientId);
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
      message: `Histórico completo de ${patient.name} (${patient.clientName}) carregado.`,
      data: {
        patient,
        interactions,
        opportunities,
        tasks,
      },
    };
  },

  /**
   * 18. searchCRM: Busca global
   */
  searchCRM: (args: { query: string; clientName?: string }): ToolResult => {
    let targetClientId: string | undefined;
    if (args.clientName) {
      const cl = db.findClientByName(args.clientName);
      if (cl) targetClientId = cl.id;
    }
    const results = db.globalSearch(args.query, targetClientId);
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
    description: 'Cadastra novo paciente. Pode vincular à clínica/cliente indicada (ex: Camila Silva, Face Doctor, Thayline).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Nome completo do paciente' },
        phone: { type: Type.STRING, description: 'Telefone com DDD' },
        clientName: { type: Type.STRING, description: 'Nome da clínica ou cliente atendida (ex: Clínica Camila Silva, Face Doctor, Dra. Thayline)' },
        origin: { type: Type.STRING, description: 'Origem do lead' },
        nextAction: { type: Type.STRING, description: 'Próxima ação' },
        nextActionDate: { type: Type.STRING, description: 'Data da próxima ação (YYYY-MM-DD)' },
      },
      required: ['name'],
    },
  },
  {
    name: 'createTask',
    description: 'Cria uma tarefa ou lembrete operacional vinculado a uma clínica (ex: Camila Silva, Face Doctor, Thayline) OU tarefa interna pessoal da SDR.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Título claro da tarefa ou lembrete' },
        description: { type: Type.STRING, description: 'Instruções adicionais ou detalhes' },
        date: { type: Type.STRING, description: 'Data (YYYY-MM-DD)' },
        clientName: { type: Type.STRING, description: 'Nome da clínica/cliente se houver vínculo (ex: Face Doctor, Camila Silva, Dra. Thayline). Deixar vazio se for tarefa interna!' },
        patientName: { type: Type.STRING, description: 'Nome do paciente vinculado se houver' },
        time: { type: Type.STRING, description: 'Horário da tarefa no formato HH:MM (ex: 16:00, 10:00)' },
        category: { type: Type.STRING, description: 'follow-up, lead, campanha, interna, comercial' },
        priority: { type: Type.STRING, description: 'baixa, normal, alta, urgente' },
      },
      required: ['title', 'date'],
    },
  },
  {
    name: 'completeTask',
    description: 'Marca tarefa como concluída no banco de dados.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientName: { type: Type.STRING, description: 'Nome do paciente ou palavra-chave da tarefa' },
        clientName: { type: Type.STRING, description: 'Clínica relacionada se houver' },
      },
    },
  },
  {
    name: 'createOpportunity',
    description: 'Cria oportunidade comercial vinculada a um paciente e sua respectiva clínica/cliente.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientName: { type: Type.STRING, description: 'Nome da paciente' },
        procedureName: { type: Type.STRING, description: 'Procedimento' },
        clientName: { type: Type.STRING, description: 'Clínica atendida (Camila Silva, Face Doctor, Thayline)' },
        estimatedValue: { type: Type.NUMBER, description: 'Valor em reais' },
        stage: { type: Type.STRING, description: 'novo_interesse, proposta, aguardando_decisao, fechado, perdido' },
        nextAction: { type: Type.STRING, description: 'Próxima ação' },
        nextActionDate: { type: Type.STRING, description: 'Data da próxima ação (YYYY-MM-DD)' },
      },
      required: ['patientName', 'procedureName'],
    },
  },
  {
    name: 'createFollowUp',
    description: 'Agenda follow-up comercial para um paciente em uma data específica.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientName: { type: Type.STRING, description: 'Nome da paciente' },
        date: { type: Type.STRING, description: 'Data (YYYY-MM-DD)' },
        reason: { type: Type.STRING, description: 'Motivo ou objetivo do contato' },
        procedureName: { type: Type.STRING, description: 'Procedimento relacionado se houver (ex: Botox, Ultraformer)' },
        clientName: { type: Type.STRING, description: 'Clínica atendida (ex: Dra. Thayline, Face Doctor, Camila Silva)' },
        priority: { type: Type.STRING, description: 'baixa, normal, alta, urgente' },
      },
      required: ['patientName', 'date', 'reason'],
    },
  },
  {
    name: 'getTodayTasks',
    description: 'Consulta tarefas de hoje ou de uma data, podendo filtrar por clínica ou consultar todas.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: 'Data no formato YYYY-MM-DD' },
        clientName: { type: Type.STRING, description: 'Nome da clínica específica para filtrar (ex: Camila Silva, Face Doctor, Thayline)' },
      },
    },
  },
  {
    name: 'getOverdueTasks',
    description: 'Consulta tarefas atrasadas (geral ou filtrado por clínica).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        clientName: { type: Type.STRING, description: 'Nome da clínica se quiser filtrar' },
      },
    },
  },
  {
    name: 'getPipeline',
    description: 'Consulta o pipeline comercial (geral ou de uma clínica específica).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        clientName: { type: Type.STRING, description: 'Nome da clínica' },
      },
    },
  },
  {
    name: 'getClientsSummary',
    description: 'Visão executiva com total de tarefas e oportunidades de cada clínica atendida pela Camila.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'findPatient',
    description: 'Busca paciente por nome ou telefone, considerando a clínica se informada.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        nameOrPhone: { type: Type.STRING, description: 'Nome ou telefone' },
        clientName: { type: Type.STRING, description: 'Clínica se informada' },
      },
      required: ['nameOrPhone'],
    },
  },
  {
    name: 'getOpportunitiesWithoutNextAction',
    description: 'Lista oportunidades sem próxima ação agendada.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        clientName: { type: Type.STRING, description: 'Filtrar por clínica' },
      },
    },
  },
];

export function executeCRMTool(name: string, args: any, author = 'Iza (Assistente Virtual)'): ToolResult {
  console.log(`[CRM Tools Multi-Client] Executing "${name}" with args:`, JSON.stringify(args));
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
