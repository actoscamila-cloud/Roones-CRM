import { CRMState, ClientAccount, Patient, Opportunity, Task, Reminder, Interaction, Procedure } from '../types/crm';

const API_BASE = '/api';

export async function fetchCRMState(): Promise<CRMState> {
  const res = await fetch(`${API_BASE}/db/state`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao carregar dados do CRM');
  return json.data;
}

export async function resetCRMDatabase(): Promise<CRMState> {
  const res = await fetch(`${API_BASE}/db/reset`, { method: 'POST' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao restaurar banco');
  return json.data;
}

export async function clearCRMDatabase(author = 'Camila Rocha'): Promise<CRMState> {
  const res = await fetch(`${API_BASE}/db/clear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao limpar dados');
  return json.data;
}

export async function fetchClientsAPI(): Promise<ClientAccount[]> {
  const res = await fetch(`${API_BASE}/clients`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao carregar clientes');
  return json.data;
}

export async function createClientAPI(data: Partial<ClientAccount>): Promise<ClientAccount> {
  const res = await fetch(`${API_BASE}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao cadastrar cliente');
  return json.data;
}

export async function updateClientAPI(id: string, data: Partial<ClientAccount>): Promise<ClientAccount> {
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao atualizar cliente');
  return json.data;
}

export async function deleteClientAPI(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao excluir cliente');
  return json.success;
}

export async function sendChatMessageAPI(
  message: string,
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [],
  imageBase64?: string,
  imageMimeType?: string,
  activeClientId?: string
) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, imageBase64, imageMimeType, activeClientId }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Falha ao processar mensagem');
  return json;
}

export async function generatePatientSummaryAPI(patientId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/ai/patient-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Falha ao gerar resumo da IA');
  return json.summary;
}

export async function transcribeAudioAPI(audioBase64: string, mimeType = 'audio/webm'): Promise<string> {
  const res = await fetch(`${API_BASE}/ai/transcribe-audio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Falha ao transcrever áudio');
  return json.transcript ?? '';
}

export async function createPatientAPI(patientData: Partial<Patient>): Promise<Patient> {
  const res = await fetch(`${API_BASE}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao criar paciente');
  return json.data;
}

export async function updatePatientAPI(id: string, updates: Partial<Patient>): Promise<Patient> {
  const res = await fetch(`${API_BASE}/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao atualizar paciente');
  return json.data;
}

export async function createOpportunityAPI(oppData: Partial<Opportunity>): Promise<Opportunity> {
  const res = await fetch(`${API_BASE}/opportunities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(oppData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao criar oportunidade');
  return json.data;
}

export async function updateOpportunityAPI(id: string, updates: Partial<Opportunity>): Promise<Opportunity> {
  const res = await fetch(`${API_BASE}/opportunities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao atualizar oportunidade');
  return json.data;
}

export async function createTaskAPI(taskData: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao criar tarefa');
  return json.data;
}

export async function updateTaskAPI(id: string, updates: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao atualizar tarefa');
  return json.data;
}

export async function createInteractionAPI(data: Partial<Interaction>): Promise<Interaction> {
  const res = await fetch(`${API_BASE}/interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao registrar interação');
  return json.data;
}

export async function updateClinicAPI(data: Partial<import('../types/crm').Clinic>): Promise<import('../types/crm').Clinic> {
  const res = await fetch(`${API_BASE}/clinic`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao atualizar dados da clínica');
  return json.data;
}

export async function updateUserAPI(data: Partial<import('../types/crm').User>): Promise<import('../types/crm').User> {
  const res = await fetch(`${API_BASE}/user`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro ao atualizar dados do usuário');
  return json.data;
}
