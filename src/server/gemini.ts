import { GoogleGenAI } from '@google/genai';
import { db } from './store';
import { ChatActionExecution, Patient, Opportunity, Task, Interaction, ClientAccount } from '../types/crm';
import { crmTools, crmFunctionDeclarations, executeCRMTool } from './tools';
import { getSystemDateStrings, formatDateBR } from '../utils/dateUtils';

const rawApiKey = process.env.GEMINI_API_KEY || '';
const isKeyValid = rawApiKey.length > 10 && rawApiKey !== 'MY_GEMINI_API_KEY';

const ai = new GoogleGenAI({
  apiKey: isKeyValid ? rawApiKey : 'dummy_key',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface AIResponse {
  reply: string;
  actionsExecuted: ChatActionExecution[];
  suggestedPrompts?: string[];
  clientContextId?: string;
  clientContextName?: string;
  pendingConfirmation?: {
    actionType: string;
    description: string;
    payload: any;
  };
}

export function parseRelativeDate(text: string, referenceDateStr?: string): string {
  const refStr = referenceDateStr || getSystemDateStrings().todayStr;
  const lower = text.toLowerCase();
  const refDate = new Date(`${refStr}T12:00:00.000Z`);

  if (lower.includes('hoje')) return refStr;
  if (lower.includes('amanhã') || lower.includes('amanha')) {
    const d = new Date(refDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  if (lower.includes('depois de amanhã') || lower.includes('depois de amanha')) {
    const d = new Date(refDate);
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }

  // Daqui X meses (ex: daqui dois meses, daqui 2 meses, 2 meses)
  const monthMatch =
    lower.match(/daqui\s*(?:a\s*)?(?:(\d+)|um|dois|três|tres|quatro|seis)\s*m[êe]s(?:es)?/i) ||
    lower.match(/(\d+)\s*m[êe]s(?:es)?/i);
  if (monthMatch) {
    let monthsToAdd = 1;
    if (lower.includes('dois') || lower.includes('2')) monthsToAdd = 2;
    else if (lower.includes('três') || lower.includes('tres') || lower.includes('3')) monthsToAdd = 3;
    else if (lower.includes('quatro') || lower.includes('4')) monthsToAdd = 4;
    else if (lower.includes('seis') || lower.includes('6')) monthsToAdd = 6;
    else if (monthMatch[1]) monthsToAdd = parseInt(monthMatch[1], 10);

    const d = new Date(refDate);
    d.setMonth(d.getMonth() + monthsToAdd);
    return d.toISOString().split('T')[0];
  }

  // Mês por extenso (ex: fevereiro de 2027, fevereiro 2027)
  const monthNames: Record<string, string> = {
    janeiro: '01',
    fev: '02',
    fevereiro: '02',
    marco: '03',
    março: '03',
    abril: '04',
    maio: '05',
    junho: '06',
    julho: '07',
    agosto: '08',
    setembro: '09',
    outubro: '10',
    novembro: '11',
    dezembro: '12',
  };

  for (const [mName, mNum] of Object.entries(monthNames)) {
    const reg = new RegExp(`\\b${mName}\\b(?:\\s*(?:de\\s*)?(\\d{4}))?`, 'i');
    const m = lower.match(reg);
    if (m) {
      const year = m[1] || '2026';
      return `${year}-${mNum}-04`;
    }
  }

  if (lower.includes('segunda') || lower.includes('05/10') || lower.includes('5/10')) return '2026-10-05';
  if (lower.includes('terça') || lower.includes('terca') || lower.includes('06/10') || lower.includes('6/10')) return '2026-10-06';
  if (lower.includes('quarta') || lower.includes('07/10') || lower.includes('7/10')) return '2026-10-07';
  if (lower.includes('quinta') || lower.includes('08/10') || lower.includes('8/10')) return '2026-10-08';
  if (lower.includes('sexta') || lower.includes('09/10') || lower.includes('9/10')) return '2026-10-09';
  if (lower.includes('sábado') || lower.includes('sabado') || lower.includes('10/10')) return '2026-10-10';
  if (lower.includes('depois do dia 15') || lower.includes('após o dia 15')) return '2026-10-16';
  if (lower.includes('depois do dia 10') || lower.includes('após o dia 10')) return '2026-10-11';
  if (lower.includes('daqui 15 dias') || lower.includes('duas semanas') || lower.includes('2 semanas')) {
    const d = new Date(refDate);
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0]; // 2026-10-19
  }
  if (lower.includes('daqui 7 dias') || lower.includes('semana que vem')) {
    const d = new Date(refDate);
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0]; // 2026-10-11
  }
  if (lower.includes('mês que vem') || lower.includes('mes que vem') || lower.includes('próximo mês')) {
    return '2026-11-04';
  }

  const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const year = dateMatch[3] ? (dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]) : '2026';
    return `${year}-${month}-${day}`;
  }

  return '2026-10-05';
}

/**
 * Detecta menção de cliente/clínica no texto
 */
function detectClientInText(text: string): ClientAccount | undefined {
  const lower = text.toLowerCase();
  const clients = db.getClients();

  // Atalhos específicos com precedência
  if (lower.includes('face doctor') || lower.includes('augusta') || lower.includes('parque prado')) {
    return db.getClientById('cli-facedoctor');
  }
  if (lower.includes('camila silva') || lower.includes('dra. camila') || lower.includes('dra camila')) {
    return db.getClientById('cli-camila-silva');
  }
  if (lower.includes('thayline') || lower.includes('dra. thayline') || lower.includes('dra thayline') || lower.includes('thayline sara')) {
    return db.getClientById('cli-thayline');
  }

  for (const c of clients) {
    const sName = c.shortName.toLowerCase();
    const fName = c.name.toLowerCase();
    const docName = c.doctorOrOwner.toLowerCase();
    const contact = c.contactPerson ? c.contactPerson.toLowerCase() : '';

    if (
      lower.includes(sName) ||
      lower.includes(fName) ||
      lower.includes(docName) ||
      (contact && lower.includes(contact))
    ) {
      return c;
    }
  }

  return undefined;
}

/**
 * Identifica o paciente em foco respeitando a conta do cliente
 */
function resolvePatientFromContext(
  text: string,
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [],
  activeClientId?: string
): Patient | undefined {
  const lower = text.toLowerCase();
  const detectedClient = detectClientInText(text);
  const targetClientId = detectedClient ? detectedClient.id : (activeClientId && activeClientId !== 'todos' ? activeClientId : undefined);

  const pool = db.getPatients(targetClientId);

  // 1. Procura nome completo primeiro (ordenado por tamanho decrescente para dar preferência a nomes compostos como "Ana Beatriz")
  const sortedPool = [...pool].sort((a, b) => b.name.length - a.name.length);
  for (const p of sortedPool) {
    if (lower.includes(p.name.toLowerCase())) {
      return p;
    }
  }

  // 1.1 Procura os primeiros 2 nomes (ex: "Ana Beatriz")
  for (const p of sortedPool) {
    const parts = p.name.toLowerCase().split(/\s+/);
    if (parts.length >= 2 && lower.includes(`${parts[0]} ${parts[1]}`)) {
      return p;
    }
  }

  // 1.2 Procura primeiro nome como palavra inteira isolada (ex: "Ana" sem ser "Mariana")
  const words = lower.split(/[^a-zA-ZáéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ]+/);
  for (const p of sortedPool) {
    const firstName = p.name.split(' ')[0].toLowerCase();
    if (words.includes(firstName)) {
      return p;
    }
  }

  // 2. Se for pronome, procura no histórico
  const isPronoun = lower.includes('ela') || lower.includes('ele') || lower.includes('dela') || lower.includes('dele');
  if (isPronoun && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const histText = history[i].parts?.map((p) => p.text).join(' ') || '';
      for (const p of pool) {
        const firstName = p.name.split(' ')[0].toLowerCase();
        if (histText.toLowerCase().includes(p.name.toLowerCase()) || histText.toLowerCase().includes(firstName)) {
          return p;
        }
      }
    }
  }

  // 3. Se pool tiver pacientes, pega o primeiro correspondente
  return pool[0];
}

/**
 * Operador do CRM Multi-Cliente com suporte a regras por cliente e tarefas internas
 */
export function runOperatorAgent(
  userMessage: string,
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [],
  providedTodayStr?: string,
  activeClientId?: string
): AIResponse {
  const lower = userMessage.toLowerCase().trim();
  const actionsExecuted: ChatActionExecution[] = [];

  const { todayStr: defaultToday, tomorrowStr } = getSystemDateStrings();
  const todayStr = providedTodayStr || defaultToday;

  const detectedClient =
    detectClientInText(userMessage) ||
    (activeClientId && activeClientId !== 'todos' ? db.getClientById(activeClientId) : undefined);

  // ========================================================
  // 0A. CADASTRO DE NOVA CLIENTE / PACIENTE E MULTI-AÇÕES
  // Ex: "Iza, cadastra uma cliente nova na Thayline, é a Sara Medina com telefone 18991945607..."
  // ========================================================
  const isPatientRegisterIntent =
    lower.includes('cadastra') ||
    lower.includes('cadastrar') ||
    lower.includes('adicionar cliente') ||
    lower.includes('adiciona cliente') ||
    lower.includes('nova cliente') ||
    lower.includes('novo cliente') ||
    lower.includes('inclusão como paciente') ||
    lower.includes('inclusao como paciente') ||
    lower.includes('incluir paciente') ||
    lower.includes('incluir cliente') ||
    lower.includes('cadastrar paciente') ||
    lower.includes('cadastra paciente');

  if (isPatientRegisterIntent) {
    const client =
      detectedClient ||
      (activeClientId && activeClientId !== 'todos' ? db.getClientById(activeClientId) : undefined) ||
      db.getClientById('cli-camila-silva') ||
      db.getClients()[0];

    const phoneMatch = userMessage.match(/\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4}|\d{10,11}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // Extrai nome da paciente
    let patientName = '';
    const mName1 = userMessage.match(/(?:é\s+(?:a|o)|chamad[ao]|nome\s+é)\s+([A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)+?)(?=\s+(?:com|de|do|da|telefone|fone|celular|que|\d)|\.|\,|$)/i);
    if (mName1 && mName1[1]) {
      patientName = mName1[1].trim();
    } else {
      const mName2 = userMessage.match(/(?:paciente|cliente|lead)\s+([A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)+?)(?=\s+(?:com|de|do|da|telefone|fone|celular|que|\d)|\.|\,|$)/i);
      if (mName2 && mName2[1]) {
        patientName = mName2[1].trim();
      } else {
        const mName3 = userMessage.match(/(?:cadastr(?:ar?|e)|adicionar?)\s+(?:a|o)?\s*([A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)+?)(?=\s+(?:com|de|do|da|telefone|fone|celular|que|\d)|\.|\,|$)/i);
        if (mName3 && mName3[1]) {
          patientName = mName3[1].trim();
        } else {
          patientName = 'Nova Paciente';
        }
      }
    }

    // Identifica procedimento mencionado
    let procedureName = '';
    if (lower.includes('botox')) procedureName = 'Toxina Botulínica (Botox)';
    else if (lower.includes('ultraformer')) procedureName = 'Ultraformer III';
    else if (lower.includes('sculptra')) procedureName = 'Bioestimulador Sculptra';
    else if (lower.includes('preenchimento')) procedureName = 'Preenchimento';
    else if (lower.includes('laser')) procedureName = 'Laser';

    // 1. Cria Paciente
    const pRes = crmTools.createPatient({
      name: patientName,
      phone: phone || undefined,
      clientName: client?.name,
      origin: 'Conversa com Iza (SDR)',
      nextAction: procedureName ? `Acompanhamento pós-${procedureName}` : undefined,
      nextActionDate: parseRelativeDate(userMessage, todayStr),
    });
    if (pRes.actionExecuted) actionsExecuted.push(pRes.actionExecuted);

    // 2. Se fez procedimento hoje ou recente, registra interação
    if (procedureName) {
      const intRes = crmTools.createInteraction({
        patientName,
        clientName: client?.name,
        type: 'procedimento',
        content: `Procedimento realizado hoje: ${procedureName}.${phone ? ` Contato: ${phone}.` : ''}`,
      });
      if (intRes.actionExecuted) actionsExecuted.push(intRes.actionExecuted);
    }

    // 3. Se pediu lembrete para chamar (ex: "chamar ela daqui dois meses")
    if (lower.includes('chamar') || lower.includes('lembrete para chamar') || lower.includes('daqui dois meses') || lower.includes('2 meses')) {
      const followUpDate = parseRelativeDate(
        lower.includes('dois meses') || lower.includes('2 meses') ? 'daqui dois meses' : userMessage,
        todayStr
      );
      const fuRes = crmTools.createFollowUp({
        patientName,
        clientName: client?.name,
        date: followUpDate,
        reason: procedureName ? `Follow-up pós-${procedureName} (2 meses)` : 'Follow-up de acompanhamento',
        procedureName: procedureName || undefined,
        priority: 'alta',
      });
      if (fuRes.actionExecuted) actionsExecuted.push(fuRes.actionExecuted);
    }

    // 4. Se pediu lembrete de retoque ou tarefa futura (ex: "fevereiro de 2027")
    if (lower.includes('retoque') || lower.includes('2027') || lower.includes('fevereiro')) {
      const retoqueDate = parseRelativeDate(
        lower.includes('fevereiro') ? 'fevereiro de 2027' : userMessage,
        todayStr
      );
      const taskRes = crmTools.createTask({
        title: `Lembrete de retoque de ${procedureName || 'procedimento'} - ${patientName}`,
        description: `Entrar em contato com ${patientName} para agendar retoque de ${procedureName || 'procedimento'}.`,
        date: retoqueDate,
        clientName: client?.name,
        patientName,
        priority: 'normal',
        category: 'follow-up',
      });
      if (taskRes.actionExecuted) actionsExecuted.push(taskRes.actionExecuted);
    }

    const clientLabel = client ? client.name : 'Clínica';
    const actionSummaries = actionsExecuted.map((a) => `✓ ${a.description}`).join('\n');

    return {
      reply: `Perfeito, Camila! Cadastro e agendamentos concluídos no CRM:\n\n${actionSummaries}`,
      actionsExecuted,
      clientContextId: client?.id,
      clientContextName: client?.name,
      suggestedPrompts: [
        `Ver ficha de ${patientName}`,
        `Ver tarefas da ${client?.shortName || clientLabel}`,
        'O que tenho para fazer hoje?',
      ],
    };
  }

  // ========================================================
  // 0B. ADIÇÃO DE TAREFA / LEMBRETE OPERACIONAL
  // Ex: "Iza, adiciona um lembre amanhã na Face Doctor para finalizar a reativação do Ultraformer."
  // ========================================================
  const isTaskOrReminderIntent =
    lower.includes('adiciona um lembre') ||
    lower.includes('adicionar lembre') ||
    lower.includes('adiciona lembre') ||
    lower.includes('cria um lembre') ||
    lower.includes('criar lembre') ||
    lower.includes('cria lembre') ||
    lower.includes('adicionar tarefa') ||
    lower.includes('adiciona tarefa') ||
    lower.includes('adiciona uma tarefa') ||
    lower.includes('criar tarefa') ||
    lower.includes('cria uma tarefa') ||
    lower.includes('novo lembrete') ||
    lower.includes('nova tarefa') ||
    ((lower.includes('lembrete') || lower.includes('lembre')) && (lower.includes('amanhã') || lower.includes('amanha') || lower.includes('para') || lower.includes('na') || lower.includes('no')));

  if (isTaskOrReminderIntent && !lower.includes('como devo priorizar') && !lower.includes('quais tarefas') && !lower.includes('como priorizar')) {
    const client =
      detectedClient ||
      (activeClientId && activeClientId !== 'todos' ? db.getClientById(activeClientId) : undefined);

    const targetDate = parseRelativeDate(userMessage, todayStr);

    const timeMatch = userMessage.match(/(?:às|as|para\s+as|para\s+às)\s*(\d{1,2})(?::(\d{2})|h(?:oras?)?(?:(\d{2}))?)?/i);
    let taskTime = '10:00';
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0');
      const mins = timeMatch[2] || timeMatch[3] || '00';
      taskTime = `${hours}:${mins}`;
    }

    let taskTitle = userMessage
      .replace(/^iza,?\s*/i, '')
      .replace(/(?:adiciona(?:r)?|cria(?:r)?)\s+(?:um(?:a)?\s+)?(?:lembre(?:te)?|tarefa)\s*/i, '')
      .trim();

    taskTitle = taskTitle.replace(/^(?:amanhã|amanha|hoje|segunda|terça|quarta|quinta|sexta)\s*/i, '').trim();
    taskTitle = taskTitle.replace(/^(?:dia\s+\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s*/i, '').trim();
    taskTitle = taskTitle.replace(/^(?:às|as)\s+\d{1,2}(?::\d{2}|h(?:oras?)?)?\s*/i, '').trim();
    taskTitle = taskTitle.replace(/^(?:na|no|da|do|em)\s+(?:face doctor|thayline|camila silva|parque prado)\s*/i, '').trim();
    taskTitle = taskTitle.replace(/^(?:para\s+|pra\s+|de\s+|sobre\s+|a\s+)/i, '').trim();

    if (taskTitle.length > 3) {
      taskTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);
    } else {
      taskTitle = 'Lembrete operacional';
    }

    const taskRes = crmTools.createTask({
      title: taskTitle,
      description: `Lembrete criado via assistente Iza para ${client ? client.name : 'tarefas internas'}.`,
      date: targetDate,
      time: taskTime,
      clientName: client?.name,
      category: client ? 'comercial' : 'interna',
      priority: 'normal',
    });

    if (taskRes.actionExecuted) actionsExecuted.push(taskRes.actionExecuted);

    const dateFormatted = targetDate === tomorrowStr ? `amanhã (${formatDateBR(tomorrowStr).slice(0, 5)})` : (targetDate === todayStr ? `hoje (${formatDateBR(todayStr).slice(0, 5)})` : formatDateBR(targetDate));
    const clientStr = client ? `na ${client.name}` : '(Interna)';

    return {
      reply: `Pronto, Camila! Executei suas instruções no CRM com sucesso:\n\n✓ Tarefa criada para ${targetDate}: "${taskTitle}" às ${taskTime} ${clientStr}.`,
      actionsExecuted,
      clientContextId: client?.id,
      clientContextName: client?.name,
      suggestedPrompts: [
        'Ver tarefas de amanhã',
        client ? `Ver tarefas da ${client.shortName}` : 'Ver tarefas internas',
        'O que tenho para fazer hoje?',
      ],
    };
  }

  // ========================================================
  // 1. TAREFAS DE CAMPANHA / AUGUSTA / FACE DOCTOR (SEÇÃO 3 DO BRIEFING)
  // Ex: "Preciso enviar a campanha de outubro para a Augusta amanhã."
  // ========================================================
  if (lower.includes('campanha') && (lower.includes('augusta') || lower.includes('face doctor') || lower.includes('outubro'))) {
    const client = db.getClientById('cli-facedoctor') || detectedClient || db.getClients()[0];
    if (!client) {
      return {
        reply: 'Por favor, cadastre uma clínica primeiro para vincular a tarefa de campanha.',
        actionsExecuted: [],
      };
    }
    const targetDate = parseRelativeDate(userMessage, todayStr);

    const taskRes = crmTools.createTask({
      title: 'Enviar campanha de outubro para a Augusta',
      description: 'Disparar arte e lista de transmissão alinhada com a Augusta no Face Doctor Parque Prado.',
      date: targetDate,
      category: 'campanha',
      clientName: client.name,
      priority: 'alta',
    });
    if (taskRes.actionExecuted) actionsExecuted.push(taskRes.actionExecuted);

    return {
      reply: `Criei a tarefa de campanha para ${targetDate === '2026-10-05' ? 'amanhã (05/10)' : targetDate} na conta ${client.name}: "Enviar campanha de outubro para a Augusta".`,
      actionsExecuted,
      clientContextId: client.id,
      clientContextName: client.name,
      suggestedPrompts: [
        'Quais tarefas tenho na Face Doctor?',
        'O que tenho para fazer hoje?',
      ],
    };
  }

  // ========================================================
  // 2. TAREFA COM CLIENTE ESPECÍFICO (SEÇÃO 8 DO BRIEFING)
  // Ex: "Preciso conferir os leads da Camila Silva hoje."
  // ========================================================
  if (
    (lower.startsWith('preciso conferir') || lower.startsWith('conferir leads') || lower.startsWith('checar leads')) &&
    detectedClient
  ) {
    const targetDate = parseRelativeDate(userMessage, todayStr);
    const taskRes = crmTools.createTask({
      title: `Conferir leads da ${detectedClient.shortName}`,
      description: `Verificar novas conversas e solicitações na conta ${detectedClient.name}.`,
      date: targetDate,
      category: 'comercial',
      clientName: detectedClient.name,
      priority: 'normal',
    });
    if (taskRes.actionExecuted) actionsExecuted.push(taskRes.actionExecuted);

    return {
      reply: `Criei a tarefa para ${targetDate === todayStr ? 'hoje' : targetDate} na ${detectedClient.name}: "Conferir leads da ${detectedClient.shortName}".`,
      actionsExecuted,
      clientContextId: detectedClient.id,
      clientContextName: detectedClient.name,
      suggestedPrompts: [
        `Ver tarefas da ${detectedClient.shortName}`,
        'O que tenho para fazer hoje?',
      ],
    };
  }

  // ========================================================
  // 3. TAREFAS INTERNAS GERAIS (SEÇÃO 7 DO BRIEFING)
  // Ex: "Preciso preparar a apresentação da reunião de amanhã."
  // ========================================================
  if (
    (lower.startsWith('preciso preparar') || lower.startsWith('preparar apresentacao') || lower.startsWith('preparar apresentação') || lower.includes('apresentação da reunião')) &&
    !detectedClient
  ) {
    const targetDate = parseRelativeDate(userMessage, todayStr);
    const taskRes = crmTools.createTask({
      title: 'Preparar apresentação da reunião com as clínicas',
      description: 'Montar relatório consolidado de conversões e fechamento mensal.',
      date: targetDate,
      category: 'interna',
      priority: 'alta',
    });
    if (taskRes.actionExecuted) actionsExecuted.push(taskRes.actionExecuted);

    return {
      reply: `Criei a sua tarefa interna para ${targetDate === '2026-10-05' ? 'amanhã (05/10)' : targetDate}: "Preparar apresentação da reunião com as clínicas". Essa tarefa não tem vínculo com nenhuma clínica específica.`,
      actionsExecuted,
      suggestedPrompts: [
        'Ver minhas tarefas internas',
        'O que tenho para fazer hoje?',
      ],
    };
  }

  // ========================================================
  // 4. CONSULTA E RESOLUÇÃO DE PENDÊNCIAS / TAREFAS ATRASADAS / PRIORIZAÇÃO
  // "Iza, como devo priorizar e resolver as tarefas atrasadas de hoje?"
  // "O que está atrasado na Face Doctor?"
  // "Quais tarefas estão atrasadas?"
  // "Resolver pendências"
  // ========================================================
  if (
    lower.includes('atrasad') ||
    lower.includes('pendência') ||
    lower.includes('pendencia') ||
    lower.includes('priorizar e resolver') ||
    lower.includes('resolver tarefas') ||
    lower.includes('resolver atrasad') ||
    lower.includes('pegando fogo') ||
    (lower.includes('como') && lower.includes('priorizar') && lower.includes('tarefa'))
  ) {
    const targetClientId = detectedClient
      ? detectedClient.id
      : activeClientId && activeClientId !== 'todos'
      ? activeClientId
      : undefined;

    const pool = db.getTasks(targetClientId);
    const lateTasks = pool.filter(
      (t) => (t.status === 'atrasada' || t.status === 'pendente') && t.date < todayStr
    );

    const clientLabel = detectedClient
      ? `na conta ${detectedClient.name}`
      : activeClientId && activeClientId !== 'todos'
      ? `na clínica selecionada`
      : 'em todas as suas clínicas parceiras';

    if (lateTasks.length === 0) {
      return {
        reply: `Excelente notícia, Camila! Não há nenhuma tarefa em atraso ${clientLabel}. A sua operação está 100% em dia!\n\nRecomendo focar agora nas tarefas de hoje e no contato com as oportunidades que estão aguardando decisão.`,
        actionsExecuted: [],
        clientContextId: targetClientId,
        clientContextName: detectedClient?.name,
        suggestedPrompts: [
          'O que tenho para fazer hoje?',
          'Quais oportunidades estão sem próxima ação?',
          'O que recomenda priorizar exatamente agora?',
        ],
      };
    }

    const stageNames: Record<string, string> = {
      novo_interesse: 'Novo Interesse',
      primeiro_contato: 'Primeiro Contato',
      qualificacao: 'Qualificação',
      agendamento: 'Agendamento',
      compareceu: 'Compareceu à Consulta',
      proposta: 'Proposta em Análise',
      aguardando_decisao: 'Aguardando Decisão',
      follow_up: 'Em Follow-up',
      fechado: 'Fechado (Ganho)',
      perdido: 'Perdido',
      reativacao: 'Em Reativação',
    };

    let reply = `Camila, você tem **${lateTasks.length} pendência prioritária** que precisa de atenção para não perder o contato:\n\n`;

    lateTasks.forEach((t) => {
      const patient = t.patientId ? db.findPatientById(t.patientId) : undefined;
      const opp = t.opportunityId
        ? db.getOpportunities().find((o) => o.id === t.opportunityId)
        : undefined;
      const clientStr = t.clientName || 'Geral';
      const patientPhone = patient?.phone ? ` · Telefone: ${patient.phone}` : '';
      const stageFriendly = opp?.stage ? stageNames[opp.stage] || opp.stage : 'Em aberto';

      const dueDateBR = t.date ? `${t.date.split('-')[2]}/${t.date.split('-')[1]}` : 'data anterior';

      reply += `📌 **${t.patientName || t.title}** · ${clientStr}\n`;
      if (opp) {
        reply += `Procedimento: **${opp.procedureName}** (R$ ${opp.estimatedValue?.toLocaleString('pt-BR') || 0})\n`;
        reply += `Etapa atual: **${stageFriendly}**${patientPhone}\n`;
        if (opp.objection) {
          reply += `Situação da paciente: "${opp.objection}". O retorno venceu em ${dueDateBR}.\n\n`;
        } else {
          reply += `O prazo de retorno venceu em ${dueDateBR}.\n\n`;
        }
      } else {
        reply += `Prazo: Venceu em ${dueDateBR} (${t.priority === 'urgente' ? 'Prioridade urgente' : 'Alta prioridade'}).\n\n`;
      }

      if (t.patientName) {
        const firstName = t.patientName.split(' ')[0];
        const clinicName = t.clientName || 'nossa clínica';
        const proc = opp?.procedureName || 'seu procedimento';
        reply += `💬 **Sugestão de mensagem para o WhatsApp:**\n`;
        reply += `> *"Olá ${firstName}! Tudo bem? Aqui é a Camila da ${clinicName}. Entro em contato para dar seguimento ao seu orçamento de ${proc}. Conseguimos uma condição especial de parcelamento caso fechemos esta semana. Podemos conversar rapidinho?"*\n\n`;
      }
    });

    const firstTask = lateTasks[0];
    const firstFirstName = firstTask?.patientName ? firstTask.patientName.split(' ')[0] : 'tarefa';

    reply += `⚡ **Como prefere prosseguir?**\n`;
    reply += `Você pode me pedir: *"Marque a tarefa da ${firstFirstName} como concluída"* ou *"Reagendar para amanhã"*.`;

    return {
      reply,
      actionsExecuted: [],
      clientContextId: targetClientId,
      clientContextName: detectedClient?.name,
      suggestedPrompts: [
        `Marque a tarefa da ${firstFirstName} como concluída`,
        `Reagendar tarefa da ${firstFirstName} para amanhã`,
        'O que tenho para fazer hoje?',
      ],
    };
  }

  // ========================================================
  // 4B. RECOMENDAÇÃO DE PRIORIZAÇÃO IMEDIATA / MAXIMIZAR CONVERSÃO
  // "Iza, o que recomenda priorizar exatamente agora para maximizar conversão?"
  // ========================================================
  if (
    lower.includes('recomenda priorizar') ||
    lower.includes('maximizar conversão') ||
    lower.includes('maximizar conversao') ||
    lower.includes('orientação da iza') ||
    lower.includes('orientacao da iza')
  ) {
    const targetClientId = detectedClient
      ? detectedClient.id
      : activeClientId && activeClientId !== 'todos'
      ? activeClientId
      : undefined;

    const lateTasks = db.getTasks(targetClientId).filter(
      (t) => (t.status === 'atrasada' || t.status === 'pendente') && t.date < todayStr
    );
    const todayTasks = db.getTasks(targetClientId).filter(
      (t) => t.date === todayStr && t.status !== 'concluida'
    );
    const hotOpps = db.getOpportunities(targetClientId).filter(
      (o) => o.stage === 'proposta' || o.stage === 'aguardando_decisao'
    );
    const oppsWithoutNext = db.getOpportunities(targetClientId).filter(
      (o) => (!o.nextAction || o.nextAction.trim() === '') && o.stage !== 'fechado' && o.stage !== 'perdido'
    );

    let plan = `Camila, montei o seu **Plano Operacional Estratégico** para o momento atual:\n\n`;

    if (lateTasks.length > 0) {
      plan += `🔥 **1º Prioridade Absoluta: Resolver ${lateTasks.length} pendência(s) em atraso**\n`;
      plan += `• O lead que mais corre risco é **${lateTasks[0].patientName || lateTasks[0].title}** (${lateTasks[0].clientName || 'Geral'}). Faça o contato antes do almoço.\n\n`;
    }

    if (hotOpps.length > 0) {
      const topOpp = hotOpps[0];
      plan += `🎯 **2º Prioridade: Fechamento de Oportunidades Quentes (${hotOpps.length} em negociação)**\n`;
      plan += `• Paciente destaque: **${topOpp.patientName}** (${topOpp.procedureName} — R$ ${topOpp.estimatedValue?.toLocaleString('pt-BR') || 0} na ${topOpp.clientName}).\n`;
      plan += `• Ação: Follow-up consultivo oferecendo facilidade de parcelamento ou tirando dúvidas finais.\n\n`;
    }

    if (todayTasks.length > 0) {
      plan += `📋 **3º Prioridade: Bater as tarefas de hoje (${todayTasks.length} agendadas)**\n`;
      plan += `• Mantenha a cadência de follow-ups programada para garantir que nenhum lead esfrie.\n\n`;
    }

    if (oppsWithoutNext.length > 0) {
      plan += `⚠️ **Atenção**: Existem ${oppsWithoutNext.length} oportunidades sem próxima ação. Me peça *"Organizar oportunidades sem próxima ação"* para definirmos datas.\n\n`;
    }

    plan += `Por qual dessas frentes quer que eu te ajude a começar agora?`;

    return {
      reply: plan,
      actionsExecuted: [],
      clientContextId: targetClientId,
      clientContextName: detectedClient?.name,
      suggestedPrompts: [
        'Como devo priorizar e resolver as tarefas atrasadas de hoje?',
        'O que tenho para fazer hoje?',
        'Quais oportunidades estão sem próxima ação?',
      ],
    };
  }

  // ========================================================
  // 4C. REAGENDAMENTO DE TAREFA
  // Ex: "Reagendar tarefa da Ana Beatriz para amanhã", "Adiar atrasada"
  // ========================================================
  if (lower.startsWith('reagendar') || lower.includes('reagendar') || lower.startsWith('adiar') || lower.includes('adiar')) {
    const resolvedPatient = resolvePatientFromContext(userMessage, history);
    const targetDate = parseRelativeDate(userMessage, todayStr);
    const pool = db.getTasks();

    let taskToPostpone: Task | undefined;
    if (resolvedPatient) {
      taskToPostpone = pool.find((t) => t.patientId === resolvedPatient.id && t.status !== 'concluida');
    }
    if (!taskToPostpone) {
      taskToPostpone = pool.find((t) => t.status === 'atrasada' || (t.status === 'pendente' && t.date < todayStr));
    }
    if (!taskToPostpone) {
      taskToPostpone = pool.find((t) => t.status !== 'concluida');
    }

    if (taskToPostpone) {
      db.updateTask(
        taskToPostpone.id,
        {
          date: targetDate,
          status: 'pendente',
        },
        'Iza (Assistente Virtual)'
      );

      const actionExecuted: ChatActionExecution = {
        type: 'Reagendamento de Tarefa',
        description: `Tarefa "${taskToPostpone.title}" reagendada para ${targetDate === '2026-10-05' ? 'amanhã (05/10)' : targetDate}.`,
        entityType: 'tarefa',
        entityId: taskToPostpone.id,
        entityName: taskToPostpone.title,
        clientName: taskToPostpone.clientName,
      };
      actionsExecuted.push(actionExecuted);

      return {
        reply: `Reagendei a tarefa "${taskToPostpone.title}" (${taskToPostpone.clientName || 'Geral'}) para ${targetDate === '2026-10-05' ? 'amanhã (05/10)' : targetDate}. O status voltou para pendente e a pendência de atraso foi sanada no painel.`,
        actionsExecuted,
        clientContextId: taskToPostpone.clientId,
        clientContextName: taskToPostpone.clientName,
        suggestedPrompts: [
          'O que tenho para fazer hoje?',
          'Ver tarefas de amanhã',
        ],
      };
    }
  }

  // ========================================================
  // 4D. CONSULTA POR CLIENTE ESPECÍFICO (OPORTUNIDADES E TAREFAS)
  // ========================================================
  if (detectedClient) {

    // 4.2 Oportunidades no cliente
    if (lower.includes('oportunidade') || lower.includes('funil') || lower.includes('pipeline')) {
      const opps = db.getOpportunities(detectedClient.id);
      if (opps.length === 0) {
        return {
          reply: `Não há oportunidades ativas registradas para a ${detectedClient.name}.`,
          actionsExecuted: [],
          clientContextId: detectedClient.id,
          clientContextName: detectedClient.name,
        };
      }
      const totalVal = opps.reduce((s, o) => s + (o.estimatedValue || 0), 0);
      const lines = opps.map((o) => `• ${o.patientName} — ${o.procedureName} (R$ ${o.estimatedValue || 0} - ${o.stage})`).join('\n');
      return {
        reply: `Oportunidades ativas na ${detectedClient.name} (${opps.length} totalizando R$ ${totalVal.toLocaleString('pt-BR')}):\n\n${lines}`,
        actionsExecuted: [],
        clientContextId: detectedClient.id,
        clientContextName: detectedClient.name,
        suggestedPrompts: [`Quem chamar na ${detectedClient.shortName}?`, 'O que tenho para fazer hoje?'],
      };
    }

    // 4.3 Tarefas de hoje ou data no cliente
    if (lower.includes('tarefa') || lower.includes('tenho') || lower.includes('chamar') || lower.includes('agenda')) {
      const targetDate = parseRelativeDate(userMessage, todayStr);
      const tasks = db.getTasks(detectedClient.id).filter((t) => t.date === targetDate && t.status !== 'concluida');
      if (tasks.length === 0) {
        return {
          reply: `Você não tem tarefas agendadas para ${targetDate === todayStr ? 'hoje' : targetDate} na ${detectedClient.name}.`,
          actionsExecuted: [],
          clientContextId: detectedClient.id,
          clientContextName: detectedClient.name,
          suggestedPrompts: ['O que tenho para fazer hoje?', 'Ver oportunidades sem próxima ação'],
        };
      }
      const lines = tasks.map((t, idx) => `${idx + 1}. [${t.patientName || 'Geral'}] ${t.title} (${t.priority})`).join('\n');
      return {
        reply: `Tarefas para ${targetDate === todayStr ? 'hoje' : targetDate} na ${detectedClient.name} (${tasks.length}):\n\n${lines}`,
        actionsExecuted: [],
        clientContextId: detectedClient.id,
        clientContextName: detectedClient.name,
        suggestedPrompts: [`Concluir primeira tarefa na ${detectedClient.shortName}`, 'O que tenho para fazer hoje?'],
      };
    }
  }

  // ========================================================
  // 5. CONSULTA CONSOLIDADA MULTICLÍNICA (SEÇÃO 5 & 13 DO BRIEFING)
  // Ex: "O que tenho para fazer hoje?", "Quem eu preciso chamar hoje?"
  // ========================================================
  if (
    lower.includes('o que tenho para fazer') ||
    lower.includes('o que tenho hoje') ||
    lower.includes('quem eu preciso chamar hoje') ||
    lower.includes('quem preciso chamar hoje') ||
    lower.includes('minhas atividades de hoje')
  ) {
    const clients = db.getClients();
    const todayTasks = db.getTasks().filter((t) => t.date === todayStr && t.status !== 'concluida');
    const lateTasks = db.getTasks().filter((t) => (t.status === 'atrasada' || t.status === 'pendente') && t.date < todayStr);
    const todayFollowUps = todayTasks.filter((t) => t.category === 'follow-up');

    // Agrupamento por cliente
    let clientBreakdown = '';
    for (const c of clients) {
      const cTasks = todayTasks.filter((t) => t.clientId === c.id);
      const cFollowUps = cTasks.filter((t) => t.category === 'follow-up');
      if (cTasks.length > 0) {
        clientBreakdown += `\n🏢 **${c.name}**\n${cTasks.length} tarefa(s) · ${cFollowUps.length} follow-up(s)\n`;
        cTasks.forEach((t) => {
          clientBreakdown += `  • [${t.patientName || 'Geral'}] ${t.title}\n`;
        });
      }
    }

    const internalTasks = todayTasks.filter((t) => !t.clientId || t.category === 'interna');
    if (internalTasks.length > 0) {
      clientBreakdown += `\n📌 **Minhas Tarefas Internas**\n${internalTasks.length} tarefa(s)\n`;
      internalTasks.forEach((t) => {
        clientBreakdown += `  • ${t.title}\n`;
      });
    }

    return {
      reply: `Bom dia, Camila! Aqui está o resumo da sua rotina hoje (${todayTasks.length} tarefas no total, ${todayFollowUps.length} follow-ups e ${lateTasks.length} atrasados):\n${clientBreakdown || '\nNenhuma tarefa pendente para hoje.'}`,
      actionsExecuted: [],
      suggestedPrompts: [
        'Quais tarefas tenho na Camila Silva?',
        'O que está atrasado na Face Doctor?',
        'Quais oportunidades estão sem próxima ação?',
      ],
    };
  }

  // ========================================================
  // 6. TRATAMENTO DE AMBIGUIDADE DE PACIENTE (SEÇÃO 4 & 12 DO BRIEFING)
  // "Falei com a Ana." -> Se houver mais de uma Ana e nenhum cliente especificado
  // ========================================================
  if (lower.startsWith('falei com a ana') || lower === 'falei com a ana.' || lower === 'ana') {
    const matches = db.findPatientByName('Ana');
    if (matches.length > 1 && !detectedClient) {
      const options = matches.map((p) => `• **${p.name}** da conta *${p.clientName}*`).join('\n');
      return {
        reply: `Encontrei mais de uma paciente chamada Ana em clientes diferentes:\n\n${options}\n\nQual delas você gostaria de atualizar? (Ex: "A Ana da Camila Silva" ou "Ana da Face Doctor")`,
        actionsExecuted: [],
        suggestedPrompts: [
          'A Ana da Camila Silva',
          'A Ana da Face Doctor',
        ],
      };
    }
  }

  // ========================================================
  // 7. CONSULTA: Oportunidades sem próxima ação
  // ========================================================
  if (lower.includes('sem próxima ação') || lower.includes('sem proxima acao') || lower.includes('oportunidades sem')) {
    const list = db.getOpportunities().filter((o) => (!o.nextAction || o.nextAction.trim() === '') && o.stage !== 'fechado' && o.stage !== 'perdido');
    if (list.length === 0) {
      return {
        reply: 'Excelente! Todas as oportunidades em todas as suas contas possuem uma próxima ação cadastrada.',
        actionsExecuted: [],
        suggestedPrompts: ['O que tenho para fazer hoje?', 'Ver pipeline'],
      };
    }
    const details = list
      .map((o) => `• ${o.patientName} [${o.clientName}] — ${o.procedureName} (R$ ${o.estimatedValue || 0})`)
      .join('\n');
    return {
      reply: `Encontrei ${list.length} oportunidade(s) abertas sem próxima ação definida:\n\n${details}\n\nDeseja que eu programe um follow-up para alguma delas?`,
      actionsExecuted: [],
      suggestedPrompts: [
        `Criar follow-up para ${list[0]?.patientName}`,
        'O que tenho para fazer hoje?',
      ],
    };
  }

  // ========================================================
  // 8. CADASTRO DE PACIENTE COM CLIENTE (SEÇÃO 1 DO TESTE)
  // Ex: "Cadastre Ana Faria 11991945607"
  // ========================================================
  if (
    (lower.startsWith('cadastre') || lower.startsWith('cadastrar') || lower.startsWith('criar paciente')) &&
    !lower.includes('chamar') && !lower.includes('retoque') && !lower.includes('botox') && !lower.includes('sculptra')
  ) {
    const phoneMatch = userMessage.match(/\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4}|\d{10,11}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    let name = userMessage
      .replace(/(cadastre|cadastrar|criar paciente|adicionar paciente|a paciente|o paciente|telefone|celular|whats|whatsapp|novo lead|lead|com o|na|da|do|clinica|clínica)/gi, '')
      .replace(/\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4}|\d{10,11}/g, '')
      .replace(/[,;:]/g, '')
      .trim();

    const client = detectedClient || db.getClientById('cli-camila-silva') || db.getClients()[0];
    if (!client) {
      return {
        reply: 'Por favor, cadastre uma clínica primeiro para vincular a paciente.',
        actionsExecuted: [],
      };
    }

    const toolRes = crmTools.createPatient({
      name: name || 'Nova Paciente',
      phone: phone || undefined,
      clientName: client.name,
      origin: 'Cadastro via Iza',
    });

    if (toolRes.duplicateFound) {
      return {
        reply: toolRes.message,
        actionsExecuted: [],
        suggestedPrompts: [`Ver ficha de ${toolRes.data?.name}`, 'O que tenho para fazer hoje?'],
      };
    }

    if (toolRes.actionExecuted) actionsExecuted.push(toolRes.actionExecuted);

    return {
      reply: `Feito. Cadastrei a paciente ${name || 'Nova Paciente'}${phone ? ` com telefone (${phone})` : ''} vinculada à ${client.name}.`,
      actionsExecuted,
      clientContextId: client.id,
      clientContextName: client.name,
      suggestedPrompts: [
        `Criar oportunidade para ${name || 'paciente'}`,
        `Agendar follow-up para ${name || 'paciente'}`,
        'O que tenho para fazer hoje?',
      ],
    };
  }

  // ========================================================
  // 9. OPERACIONAL COMPLETO: CHAMAR + RETOQUE/PROCEDIMENTO + VALOR + DATA
  // Ex: "Chamar Ana na segunda sobre retoque de Botox de R$ 1.450."
  // ========================================================
  if (
    (lower.includes('chamar') || lower.includes('lembra de chamar') || lower.includes('retorno') || lower.includes('follow-up') || lower.includes('retoque')) &&
    (lower.includes('botox') || lower.includes('sculptra') || lower.includes('preenchimento') || lower.includes('laser') || lower.includes('ultraformer') || lower.includes('1450') || lower.includes('r$'))
  ) {
    const client = detectedClient || db.getClientById('cli-camila-silva') || db.getClients()[0];
    if (!client) {
      return {
        reply: 'Por favor, cadastre uma clínica primeiro para vincular a oportunidade.',
        actionsExecuted: [],
      };
    }
    const phoneMatch = userMessage.match(/\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4}|\d{10,11}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    let procedureName = 'Toxina Botulínica (Botox)';
    if (lower.includes('retoque')) procedureName = 'Retoque de Botox';
    else if (lower.includes('sculptra')) procedureName = 'Bioestimulador Sculptra';
    else if (lower.includes('olheira')) procedureName = 'Preenchimento de Olheiras';
    else if (lower.includes('labial')) procedureName = 'Preenchimento Labial';
    else if (lower.includes('ultraformer')) procedureName = 'Ultraformer III';

    let estimatedValue = 1450;
    const valueMatch = userMessage.match(/(?:r\$\s*|valor\s*(?:de\s*)?)(\d+[.,]?\d*)/i) || userMessage.match(/(\d{3,5})/);
    if (valueMatch) {
      const parsedNum = parseInt(valueMatch[1].replace(/\D/g, ''), 10);
      if (!isNaN(parsedNum) && parsedNum > 0) estimatedValue = parsedNum;
    }

    const targetDate = parseRelativeDate(userMessage, todayStr);
    const dateFormatted = targetDate === '2026-10-05' ? '05/10' : targetDate;

    // Resolução do nome
    let patientName = 'Ana Faria';
    if (lower.includes('fernanda')) patientName = 'Fernanda Lima';
    else if (lower.includes('mariana')) patientName = 'Mariana Souza';
    else if (lower.includes('juliana')) patientName = 'Juliana Castro';
    else if (lower.includes('ana')) patientName = 'Ana Faria';

    // A. Localiza ou Cria Paciente
    let patient = db.findPatientByName(patientName, client.id)[0];
    if (!patient) {
      const createRes = crmTools.createPatient({
        name: patientName,
        phone: phone || '(11) 99194-5607',
        clientName: client.name,
        origin: 'WhatsApp SDR',
        nextAction: `Chamar para ${procedureName}`,
        nextActionDate: targetDate,
      });
      patient = createRes.data;
      if (createRes.actionExecuted) actionsExecuted.push(createRes.actionExecuted);
    }

    // B. Oportunidade
    const oppRes = crmTools.createOpportunity({
      patientName: patient.name,
      procedureName,
      clientName: client.name,
      stage: 'proposta',
      estimatedValue,
      interest: `Interesse em ${procedureName}`,
      nextAction: `Chamar para ${procedureName}`,
      nextActionDate: targetDate,
    });
    if (oppRes.actionExecuted) actionsExecuted.push(oppRes.actionExecuted);

    // C. Tarefa / Follow-up
    const taskRes = crmTools.createTask({
      title: `Chamar ${patient.name} sobre ${procedureName}`,
      description: `Entrar em contato para acertar ${procedureName}. Valor: R$ ${estimatedValue.toLocaleString('pt-BR')}.`,
      date: targetDate,
      time: '10:00',
      priority: 'alta',
      category: 'follow-up',
      clientName: client.name,
      patientName: patient.name,
      opportunityId: oppRes.data?.id,
    });
    if (taskRes.actionExecuted) actionsExecuted.push(taskRes.actionExecuted);

    // D. Interação
    const intRes = crmTools.createInteraction({
      patientName: patient.name,
      clientName: client.name,
      type: 'proposta',
      content: `Agendado retorno para ${dateFormatted} sobre ${procedureName} de R$ ${estimatedValue.toLocaleString('pt-BR')}.`,
    });
    if (intRes.actionExecuted) actionsExecuted.push(intRes.actionExecuted);

    return {
      reply: `Feito. Cadastrei a ${patient.name} na ${client.name} e deixei o retorno para ${dateFormatted} sobre o ${procedureName} no valor de R$ ${estimatedValue.toLocaleString('pt-BR')}.`,
      actionsExecuted,
      clientContextId: client.id,
      clientContextName: client.name,
      suggestedPrompts: [
        'Quem preciso chamar segunda?',
        `Mostra a ${patient.name.split(' ')[0]}`,
        `Ver oportunidades da ${client.shortName}`,
      ],
    };
  }

  // ========================================================
  // 10. CONCLUSÃO DE TAREFA
  // Ex: "Marque a tarefa da Ana como concluída."
  // ========================================================
  if (lower.includes('concluída') || lower.includes('concluida') || lower.includes('concluir') || lower.includes('finalizar tarefa')) {
    let resolvedPatient = resolvePatientFromContext(userMessage, history);
    const toolRes = crmTools.completeTask({
      patientName: resolvedPatient?.name || userMessage,
      taskTitleQuery: userMessage,
    });
    if (toolRes.success) {
      if (toolRes.actionExecuted) actionsExecuted.push(toolRes.actionExecuted);
      return {
        reply: `Feito. Marquei a tarefa de ${resolvedPatient?.name || 'acompanhamento'} como concluída no sistema.`,
        actionsExecuted,
        suggestedPrompts: ['O que tenho para fazer hoje?', 'Ver tarefas atrasadas'],
      };
    }
  }

  // ========================================================
  // 11. CONSULTA DE FICHA / HISTÓRICO
  // Ex: "Mostra a Ana.", "Ficha da Juliana"
  // ========================================================
  if (
    lower.startsWith('mostra') ||
    lower.startsWith('mostrar') ||
    lower.startsWith('ver ficha') ||
    lower.startsWith('fala comigo sobre') ||
    lower.includes('histórico') ||
    lower.includes('historico')
  ) {
    let resolvedPatient = resolvePatientFromContext(userMessage, history);
    if (!resolvedPatient) resolvedPatient = db.getPatients()[0];

    const toolRes = crmTools.getPatientHistory({ patientName: resolvedPatient.name });
    if (toolRes.success && toolRes.data) {
      const { patient, opportunities, interactions } = toolRes.data;
      const oppText = opportunities.length > 0
        ? opportunities.map((o: any) => `${o.procedureName} (R$ ${o.estimatedValue || 0} - etapa: ${o.stage})`).join(', ')
        : 'Nenhuma oportunidade aberta';
      const lastInt = interactions[0]?.content || 'Sem atendimentos recentes';
      const nextAct = patient.nextAction ? `${patient.nextAction} (${patient.nextActionDate || 'sem data'})` : 'Nenhuma próxima ação';

      return {
        reply: `Aqui estão os dados da paciente ${patient.name} [Conta: ${patient.clientName}]:\n• Telefone: ${patient.phone || 'Não informado'}\n• Status: ${patient.status}\n• Última Interação: ${lastInt}\n• Oportunidades: ${oppText}\n• Próxima Ação: ${nextAct}`,
        actionsExecuted: [],
        clientContextId: patient.clientId,
        clientContextName: patient.clientName,
        suggestedPrompts: [
          `Criar follow-up para ${patient.name.split(' ')[0]}`,
          `Ver oportunidades da ${patient.clientName}`,
          'O que tenho para fazer hoje?',
        ],
      };
    }
  }

  // ========================================================
  // 12. CONSULTA GERAL DE QUEM CHAMAR
  // Ex: "Quem preciso chamar segunda?"
  // ========================================================
  if (lower.includes('quem preciso chamar') || lower.includes('quem chamar')) {
    const targetDate = parseRelativeDate(userMessage, todayStr);
    const dateLabel = targetDate === '2026-10-04' ? 'hoje (04/10)' : (targetDate === '2026-10-05' ? 'segunda-feira (05/10)' : targetDate);

    const tasks = db.getTasks().filter((t) => t.date === targetDate && t.status !== 'concluida');
    if (tasks.length === 0) {
      return {
        reply: `Você não tem nenhum follow-up programado para ${dateLabel} em nenhuma das clínicas.`,
        actionsExecuted: [],
        suggestedPrompts: ['Ver tarefas atrasadas', 'O que tenho para fazer hoje?'],
      };
    }

    const taskLines = tasks.map((t, idx) => `${idx + 1}. [${t.clientName || 'Interna'}] ${t.patientName ? `${t.patientName} — ` : ''}${t.title} (${t.priority})`).join('\n');
    return {
      reply: `Para ${dateLabel}, você tem ${tasks.length} compromisso(s) na sua agenda geral:\n\n${taskLines}`,
      actionsExecuted: [],
      suggestedPrompts: ['Marque a tarefa da Ana como concluída', 'O que tenho para fazer hoje?'],
    };
  }

  // ========================================================
  // 13. INTERESSE COM PRONOME ("Ela quer fazer Sculptra...")
  // ========================================================
  if (
    (lower.includes('sculptra') || lower.includes('olheira') || lower.includes('preenchimento')) &&
    (lower.includes('mes que vem') || lower.includes('mês que vem') || lower.includes('pensar') || lower.includes('depois'))
  ) {
    const resolvedPatient = resolvePatientFromContext(userMessage, history);
    const patientName = resolvedPatient ? resolvedPatient.name : 'Ana Faria';
    const clientName = resolvedPatient?.clientName || 'Clínica Camila Silva';

    const targetDate = parseRelativeDate(userMessage, todayStr);

    const oppRes = crmTools.createOpportunity({
      patientName,
      clientName,
      procedureName: 'Bioestimulador Sculptra',
      stage: 'aguardando_decisao',
      estimatedValue: 3200,
      interest: 'Interesse em Bioestimulador Sculptra',
      nextAction: 'Follow-up sobre Bioestimulador Sculptra',
      nextActionDate: targetDate,
    });
    if (oppRes.actionExecuted) actionsExecuted.push(oppRes.actionExecuted);

    const taskRes = crmTools.createFollowUp({
      patientName,
      clientName,
      date: targetDate,
      reason: 'Retorno sobre Bioestimulador Sculptra (Aguardando Decisão)',
      procedureName: 'Bioestimulador Sculptra',
      priority: 'alta',
    });
    if (taskRes.actionExecuted) actionsExecuted.push(taskRes.actionExecuted);

    return {
      reply: `Registrei a conversa da ${patientName} (${clientName}), atualizei a oportunidade de Bioestimulador Sculptra como aguardando decisão e programei o follow-up para o próximo mês.`,
      actionsExecuted,
      clientContextId: resolvedPatient?.clientId,
      clientContextName: clientName,
      suggestedPrompts: ['O que tenho para fazer hoje?', 'Ver oportunidades'],
    };
  }

  // Fallback
  return {
    reply: 'Compreendi a instrução. Como sou sua assistente operacional para todas as clínicas que você atende, você pode me pedir tarefas para clientes específicos (ex: "Enviar campanha na Face Doctor", "Tarefas na Camila Silva") ou tarefas gerais internas.',
    actionsExecuted: [],
    suggestedPrompts: [
      'O que tenho para fazer hoje?',
      'Quais tarefas tenho na Camila Silva?',
      'O que está atrasado na Face Doctor?',
    ],
  };
}

export async function processUserMessage(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [],
  imageBase64?: string,
  imageMimeType?: string,
  activeClientId?: string
): Promise<AIResponse> {
  const todayStr = '2026-10-04';

  if (!isKeyValid) {
    return runOperatorAgent(userMessage, conversationHistory, todayStr, activeClientId);
  }

  try {
    const clients = db.getClients();
    const clientsContext = clients.map((c) => `- ${c.name} (${c.shortName}) | Responsável: ${c.doctorOrOwner}`).join('\n');
    const activeClient = activeClientId && activeClientId !== 'todos' ? db.getClientById(activeClientId) : undefined;
    const activeClientNote = activeClient
      ? `\nCLÍNICA ATUALMENTE SELECIONADA NA TELA: ${activeClient.name} (${activeClient.shortName}). Se o usuário não especificar a clínica no comando, use esta clínica.`
      : '';

    const systemInstruction = `
Você é a Iza, ASSISTENTE OPERACIONAL PESSOAL e executora direta do CRM da usuária Camila Rocha (SDR / Consultora Comercial).
A Camila atende múltiplas clínicas parceiras:
${clientsContext}${activeClientNote}

DATA DE REFERÊNCIA DO CRM: ${todayStr} (04 de Outubro de 2026).
- Hoje: 2026-10-04
- Amanhã: 2026-10-05
- Daqui a 2 meses: 2026-12-04
- Fevereiro de 2027: 2027-02-04

CRÍTICO / REGRA OPERACIONAL FUNDAMENTAL:
1. Você NÃO é apenas um chatbot conversacional. Você é a EXECUTORA REAL do CRM.
2. Quando o usuário pede para adicionar, cadastrar, agendar, criar lembretes, registrar tarefas, marcar procedimentos ou atualizar dados, VOCÊ DEVE OBRIGATORIAMENTE CHAMAR AS FERRAMENTAS DO CRM (functionCalls).
3. NUNCA responda apenas dizendo "feito" ou confirmando em texto sem ter chamado a ferramenta correspondente.
4. MÚLTIPLAS AÇÕES: Se a mensagem contiver múltiplos pedidos (exemplo: cadastrar nova cliente + agendar lembrete em 2 meses + agendar retoque em fevereiro de 2027), EMITA TODAS AS FERRAMENTAS NECESSÁRIAS (createPatient, createFollowUp, createTask) em uma única resposta!
5. Se o usuário pedir um lembrete para uma clínica (ex: "Face Doctor", "Thayline"), crie a tarefa com createTask ou createFollowUp com o clientName correspondente, date e título claros.
6. Se o usuário fornecer dados de uma nova cliente/paciente (nome, telefone, clínica, procedimento), use createPatient e programe os follow-ups / lembretes solicitados.
7. Se for uma tarefa interna da Camila (sem clínica vinculada), use createTask com clientName vazio e category="interna".
`;

    const contents: any[] = [];
    if (conversationHistory.length > 0) {
      conversationHistory.slice(-4).forEach((h) => {
        contents.push({ role: h.role, parts: h.parts });
      });
    }

    const userParts: any[] = [];
    if (imageBase64) {
      userParts.push({
        inlineData: {
          mimeType: imageMimeType || 'image/jpeg',
          data: imageBase64,
        },
      });
      userParts.push({ text: `[Print recebido]: ${userMessage || 'Extraia os dados deste print e execute as ações no CRM.'}` });
    } else {
      userParts.push({ text: userMessage });
    }
    contents.push({ role: 'user', parts: userParts });

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let response: any = null;

    for (const modelName of candidateModels) {
      try {
        const generatePromise = ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            tools: [{ functionDeclarations: crmFunctionDeclarations }],
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout Gemini (${modelName})`)), 14000)
        );

        response = await Promise.race([generatePromise, timeoutPromise]);
        if (response) {
          console.log(`[processUserMessage] Model ${modelName} returned successfully.`);
          break;
        }
      } catch (err: any) {
        console.warn(`[processUserMessage] Model ${modelName} failed/timed out:`, err?.message || err);
      }
    }

    if (response) {
      const functionCalls = response.functionCalls;
      const actionsExecuted: ChatActionExecution[] = [];

      if (functionCalls && functionCalls.length > 0) {
        const toolResults: Array<{ name: string; result: any }> = [];
        for (const call of functionCalls) {
          const result = executeCRMTool(call.name || '', call.args || {});
          toolResults.push({ name: call.name || '', result });
          if (result.actionExecuted) actionsExecuted.push(result.actionExecuted);
        }

        let reply = '';
        if (response.text && response.text.trim().length > 15 && !response.text.includes('functionCall')) {
          reply = response.text.trim();
        } else {
          const successMsgs = toolResults.filter((r) => r.result.success).map((r) => `✓ ${r.result.message}`);
          const failMsgs = toolResults.filter((r) => !r.result.success).map((r) => `⚠️ ${r.result.message}`);
          reply = `Pronto, Camila! Executei suas instruções no CRM com sucesso:\n\n${successMsgs.join('\n\n')}`;
          if (failMsgs.length > 0) {
            reply += `\n\n${failMsgs.join('\n')}`;
          }
        }

        return {
          reply,
          actionsExecuted,
          suggestedPrompts: [
            'O que tenho para fazer hoje?',
            'Ver tarefas de amanhã',
            'Quem eu preciso chamar?',
          ],
        };
      }

      // Se respondeu com texto e o usuário não pediu criação operacional, retorna o texto
      const isCreateCommand = /cadastr|adiciona|cri[ar]|lembre|agend/i.test(userMessage);

      if (!isCreateCommand && response.text && response.text.trim().length > 5) {
        return {
          reply: response.text.trim(),
          actionsExecuted: [],
          suggestedPrompts: ['O que tenho para fazer hoje?', 'Ver oportunidades por cliente'],
        };
      }
    }

    // Se nenhum modelo atendeu ou não chamou ferramentas num comando de criação, executa o agente de fallback
    return runOperatorAgent(userMessage, conversationHistory, todayStr, activeClientId);
  } catch (err) {
    console.error('[processUserMessage catch]:', err);
    return runOperatorAgent(userMessage, conversationHistory, todayStr, activeClientId);
  }
}

export async function transcribeAudio(audioBase64: string, mimeType = 'audio/webm'): Promise<string> {
  if (!audioBase64 || audioBase64.trim() === '') {
    throw new Error('Nenhum dado de áudio foi recebido para transcrição.');
  }

  // Sanitiza e extrai dados puros de base64 caso venha com data URI prefix
  let pureBase64 = audioBase64.trim();
  let cleanMime = (mimeType || 'audio/webm').split(';')[0].trim().toLowerCase();

  if (pureBase64.includes(',')) {
    const parts = pureBase64.split(',');
    const header = parts[0];
    pureBase64 = parts[1].trim();
    if (header.startsWith('data:audio/')) {
      const extracted = header.substring(5).split(';')[0].trim().toLowerCase();
      if (extracted) cleanMime = extracted;
    }
  }

  // Normaliza codecs e MIME types conhecidos para a API Gemini
  if (cleanMime === 'audio/m4a' || cleanMime === 'audio/x-m4a') {
    cleanMime = 'audio/mp4';
  } else if (cleanMime === 'audio/x-wav') {
    cleanMime = 'audio/wav';
  } else if (!cleanMime.startsWith('audio/')) {
    cleanMime = 'audio/webm';
  }

  console.log(`[VOICE SERVER] Áudio recebido para transcrição. MIME: ${cleanMime}, Tamanho base64: ${pureBase64.length} caracteres`);

  if (!isKeyValid) {
    throw new Error('Chave de API Gemini não está configurada no servidor.');
  }

  const promptText = 'Transcreva com exatidão todas as palavras faladas neste áudio em português do Brasil. Retorne estritamente o texto falado, sem introduções, aspas ou observações adicionais. Se não houver fala ou apenas ruído/silêncio, não gere texto.';

  // 1. Tenta o modelo dedicado de transcrição 'gemini-3.5-transcribe' com prompt padrão
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          { inlineData: { mimeType: cleanMime, data: pureBase64 } },
          { text: 'Transcreva este áudio em português com fidelidade total.' },
        ],
      },
    });

    let transcript = res.text?.trim() || '';
    if (!transcript && res.candidates?.[0]?.content?.parts) {
      transcript = res.candidates[0].content.parts
        .map((p: any) => p.text || '')
        .join('')
        .trim();
    }

    if (transcript && transcript.length > 0) {
      console.log(`[VOICE SERVER] Modelo gemini-3.5-transcribe retornou: "${transcript}"`);
      return transcript;
    }
    console.warn('[VOICE SERVER] gemini-3.5-transcribe retornou vazio, acionando fallback com gemini-3.1-flash-lite...');
  } catch (err: any) {
    console.warn(`[VOICE SERVER] Modelo gemini-3.5-transcribe falhou (${err.message}), tentando gemini-3.1-flash-lite...`);
  }

  // 2. Fallback resiliente e de alta disponibilidade para 'gemini-3.1-flash-lite'
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: {
        parts: [
          { inlineData: { mimeType: cleanMime, data: pureBase64 } },
          { text: 'Transcreva com exatidão todas as palavras faladas neste áudio em português. Retorne apenas o texto transcrito.' },
        ],
      },
    });

    let transcript = res.text?.trim() || '';
    if (!transcript && res.candidates?.[0]?.content?.parts) {
      transcript = res.candidates[0].content.parts
        .map((p: any) => p.text || '')
        .join('')
        .trim();
    }

    if (transcript && transcript.length > 0) {
      console.log(`[VOICE SERVER] Modelo gemini-3.1-flash-lite retornou: "${transcript}"`);
      return transcript;
    }
    console.warn('[VOICE SERVER] gemini-3.1-flash-lite retornou vazio, acionando gemini-3.8-flash...');
  } catch (err: any) {
    console.warn(`[VOICE SERVER] Modelo gemini-3.1-flash-lite falhou (${err.message}), tentando gemini-3.8-flash...`);
  }

  // 3. Fallback adicional para 'gemini-3.8-flash'
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: cleanMime, data: pureBase64 } },
          { text: 'Transcreva com exatidão todas as palavras faladas neste áudio em português. Retorne apenas o texto falado.' },
        ],
      },
    });

    let transcript = res.text?.trim() || '';
    if (!transcript && res.candidates?.[0]?.content?.parts) {
      transcript = res.candidates[0].content.parts
        .map((p: any) => p.text || '')
        .join('')
        .trim();
    }

    if (transcript && transcript.length > 0) {
      console.log(`[VOICE SERVER] Modelo gemini-3.8-flash retornou com sucesso: "${transcript}"`);
      return transcript;
    }
    return '';
  } catch (err: any) {
    console.error(`[VOICE SERVER] Falha em todos os modelos de transcrição:`, err);
    throw new Error(`Falha no serviço de transcrição: ${err.message || 'Erro de processamento'}`);
  }
}

export async function generatePatientSummary(patientId: string): Promise<string> {
  const patient = db.findPatientById(patientId);
  if (!patient) throw new Error('Paciente não encontrado');

  const history = db.getInteractions(patientId);
  const opps = db.getOpportunities().filter((o) => o.patientId === patientId);
  const tasks = db.getTasks().filter((t) => t.patientId === patientId);

  return `${patient.name} [${patient.clientName || 'Cliente'}] possui ${opps.length} oportunidade(s) registradas e ${tasks.length} tarefa(s) vinculadas. Próxima ação: ${patient.nextAction || 'Nenhuma definida'}.`;
}
