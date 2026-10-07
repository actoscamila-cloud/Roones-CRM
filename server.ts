import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/server/store';
import { processUserMessage, generatePatientSummary, transcribeAudio } from './src/server/gemini';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  let PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed)) PORT = parsed;
  }

  let HOST = '0.0.0.0';
  const hostArgIndex = process.argv.indexOf('--host');
  if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
    HOST = process.argv[hostArgIndex + 1];
  }

  // Body parser with 25MB limit for images & audio
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // --- API Endpoints ---

  // 1. Get full state
  app.get('/api/db/state', (req, res) => {
    try {
      const state = db.getState();
      res.json({ success: true, data: state });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Reset database state
  app.post('/api/db/reset', (req, res) => {
    try {
      const state = db.resetToDefault();
      res.json({ success: true, data: state, message: 'Banco de dados restaurado com sucesso.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2.1 Clear all data (Zerar dados fictícios para uso real)
  app.post('/api/db/clear', (req, res) => {
    try {
      const state = db.clearAllData(req.body.author || 'Camila Rocha (SDR)');
      res.json({ success: true, data: state, message: 'Todos os registros foram zerados com sucesso para uso operacional real.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2.2 Clients (Clínicas e Médicas atendidas pela usuária)
  app.get('/api/clients', (req, res) => {
    res.json({ success: true, data: db.getClients() });
  });

  app.post('/api/clients', (req, res) => {
    try {
      const client = db.createClient(req.body, req.body.author || 'Camila Rocha (SDR)');
      res.json({ success: true, data: client });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/clients/:id', (req, res) => {
    try {
      const updated = db.updateClient(req.params.id, req.body, req.body.author || 'Camila Rocha (SDR)');
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Cliente não encontrado' });
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/clients/:id', (req, res) => {
    try {
      const deleted = db.deleteClient(req.params.id, req.body?.author || 'Camila Rocha (SDR)');
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Cliente não encontrado' });
      }
      res.json({ success: true, message: 'Cliente excluído com sucesso.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Patients
  app.get('/api/patients', (req, res) => {
    const clientId = req.query.clientId as string | undefined;
    res.json({ success: true, data: db.getPatients(clientId) });
  });

  app.post('/api/patients', (req, res) => {
    try {
      const patient = db.createPatient(req.body, req.body.author || 'Interface Manual');
      res.json({ success: true, data: patient });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/patients/:id', (req, res) => {
    try {
      const updated = db.updatePatient(req.params.id, req.body, req.body.author || 'Interface Manual');
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Paciente não encontrada' });
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Opportunities
  app.get('/api/opportunities', (req, res) => {
    const clientId = req.query.clientId as string | undefined;
    res.json({ success: true, data: db.getOpportunities(clientId) });
  });

  app.post('/api/opportunities', (req, res) => {
    try {
      const opp = db.createOpportunity(req.body, req.body.author || 'Interface Manual');
      res.json({ success: true, data: opp });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/opportunities/:id', (req, res) => {
    try {
      const updated = db.updateOpportunity(req.params.id, req.body, req.body.author || 'Interface Manual');
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Oportunidade não encontrada' });
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Tasks
  app.get('/api/tasks', (req, res) => {
    const clientId = req.query.clientId as string | undefined;
    res.json({ success: true, data: db.getTasks(clientId) });
  });

  app.post('/api/tasks', (req, res) => {
    try {
      const task = db.createTask(req.body, req.body.author || 'Interface Manual');
      res.json({ success: true, data: task });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/tasks/:id', (req, res) => {
    try {
      const updated = db.updateTask(req.params.id, req.body, req.body.author || 'Interface Manual');
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Tarefa não encontrada' });
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Reminders
  app.get('/api/reminders', (req, res) => {
    res.json({ success: true, data: db.getReminders() });
  });

  app.post('/api/reminders', (req, res) => {
    try {
      const rem = db.createReminder(req.body, req.body.author || 'Interface Manual');
      res.json({ success: true, data: rem });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Interactions
  app.get('/api/interactions', (req, res) => {
    const patientId = req.query.patientId as string | undefined;
    res.json({ success: true, data: db.getInteractions(patientId) });
  });

  app.post('/api/interactions', (req, res) => {
    try {
      const interaction = db.createInteraction(req.body);
      res.json({ success: true, data: interaction });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Procedures
  app.get('/api/procedures', (req, res) => {
    res.json({ success: true, data: db.getProcedures() });
  });

  // Clinic & User Settings Updates
  app.put('/api/clinic', (req, res) => {
    try {
      const updated = db.updateClinic(req.body, req.body.author || 'Interface Manual');
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/user', (req, res) => {
    try {
      const updated = db.updateUser(req.body, req.body.author || 'Interface Manual');
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. Global Search
  app.get('/api/search', (req, res) => {
    const q = (req.query.q as string) || '';
    const results = db.globalSearch(q);
    res.json({ success: true, data: results });
  });

  // 10. AI Chat Processing & History
  app.get('/api/chat/history', (req, res) => {
    try {
      res.json({ success: true, data: db.getChatHistory() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/chat/history', (req, res) => {
    try {
      if (Array.isArray(req.body.messages)) {
        db.setChatHistory(req.body.messages);
      }
      res.json({ success: true, data: db.getChatHistory() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/chat/message', (req, res) => {
    try {
      if (req.body.message) {
        db.appendChatMessage(req.body.message);
      }
      res.json({ success: true, data: db.getChatHistory() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/chat/clear', (req, res) => {
    try {
      db.clearChatHistory();
      res.json({ success: true, data: db.getChatHistory() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history, imageBase64, imageMimeType, activeClientId, userMessage } = req.body;
      if (!message && !imageBase64) {
        return res.status(400).json({ success: false, error: 'Mensagem ou anexo é obrigatório.' });
      }

      if (userMessage) {
        db.appendChatMessage(userMessage);
      }

      const result = await processUserMessage(message || '', history || [], imageBase64, imageMimeType, activeClientId);

      // Create assistant message and persist
      const assistantMessage = {
        id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        sender: 'assistant' as const,
        text: result.reply,
        timestamp: new Date().toISOString(),
        clientContextId: result.clientContextId,
        clientContextName: result.clientContextName,
        actionsExecuted: result.actionsExecuted,
        suggestedPrompts: result.suggestedPrompts,
      };
      db.appendChatMessage(assistantMessage);

      const updatedState = db.getState();

      res.json({
        success: true,
        data: result,
        assistantMessage,
        updatedState,
      });
    } catch (err: any) {
      console.error('[API /api/ai/chat error]:', err);
      res.status(500).json({ success: false, error: err.message || 'Erro ao processar mensagem com IA.' });
    }
  });

  // 11. AI Patient Summary
  app.post('/api/ai/patient-summary', async (req, res) => {
    try {
      const { patientId } = req.body;
      if (!patientId) {
        return res.status(400).json({ success: false, error: 'patientId é obrigatório' });
      }
      const summary = await generatePatientSummary(patientId);
      res.json({ success: true, summary });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 12. Audio Transcription
  app.post('/api/ai/transcribe-audio', async (req, res) => {
    try {
      const { audioBase64, mimeType } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ success: false, error: 'audioBase64 é obrigatório' });
      }
      const transcript = await transcribeAudio(audioBase64, mimeType);
      res.json({ success: true, transcript });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite integration
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Lumina CRM Server rodando em http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar servidor:', err);
});
