import React, { useState, useRef, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  Paperclip,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  Calendar,
  Layers,
  User,
  Clock,
  Trash2,
  Building2,
  Loader2,
  FileAudio,
  Upload,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { transcribeAudioAPI } from '../services/api';

export type VoiceRecordingState = 'IDLE' | 'RECORDING' | 'PROCESSING' | 'TRANSCRIBING' | 'TRANSCRIBED' | 'ERROR';

const FormattedMessage: React.FC<{ text: string; isUser: boolean }> = ({ text, isUser }) => {
  if (isUser) {
    return <div className="whitespace-pre-line">{text}</div>;
  }

  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-slate-800">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        if (trimmed.startsWith('>')) {
          const content = trimmed.replace(/^>\s*/, '');
          return (
            <div
              key={idx}
              className="my-2 border-l-2 border-blue-500 bg-blue-50/70 p-2.5 rounded-r-xl text-xs sm:text-sm text-slate-800 italic"
            >
              {renderInlineStyles(content)}
            </div>
          );
        }

        return (
          <div key={idx} className="text-xs sm:text-sm">
            {renderInlineStyles(line)}
          </div>
        );
      })}
    </div>
  );
};

function renderInlineStyles(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={i} className="italic text-slate-700">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export const ChatView: React.FC = () => {
  const {
    state,
    selectedClientId,
    setSelectedClientId,
    chatMessages,
    sendChatMessage,
    isChatProcessing,
    setSelectedPatientId,
    setActiveView,
  } = useCRM();

  const [inputText, setInputText] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceRecordingState>('IDLE');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [transcribedPreview, setTranscribedPreview] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveVolume, setLiveVolume] = useState<number>(0);
  const [attachedImage, setAttachedImage] = useState<{ base64: string; name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const selectedMimeTypeRef = useRef<string>('audio/webm');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef<string>('');

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatProcessing]);

  // Audio recording timer based on real voiceState
  useEffect(() => {
    if (voiceState === 'RECORDING') {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (voiceState === 'IDLE') {
        setRecordingSeconds(0);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [voiceState]);

  // Process uploaded audio file (WhatsApp, voice memos, .mp3, .ogg, .m4a, .wav)
  const handleAudioFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so user can choose another or same file if needed
    e.target.value = '';

    setVoiceError(null);
    setVoiceState('PROCESSING');

    try {
      console.log(`[VOICE FILE] Arquivo de áudio recebido: "${file.name}", tipo: "${file.type}", tamanho: ${file.size} bytes`);
      if (file.size === 0) {
        throw new Error('O arquivo de áudio selecionado está vazio (0 bytes).');
      }

      // Convert file to pure Base64
      const pureBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          const base64 = res.includes(',') ? res.split(',')[1] : res;
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Erro ao ler o arquivo de áudio selecionado.'));
        reader.readAsDataURL(file);
      });

      setVoiceState('TRANSCRIBING');
      console.log('[VOICE FILE] Enviando arquivo para transcrição Speech-to-Text...');

      // Detect MIME type with fallback to file extension
      let mime = file.type || 'audio/webm';
      if (!mime.startsWith('audio/')) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'mp3') mime = 'audio/mp3';
        else if (ext === 'wav') mime = 'audio/wav';
        else if (ext === 'ogg' || ext === 'opus') mime = 'audio/ogg';
        else if (ext === 'm4a' || ext === 'aac') mime = 'audio/mp4';
        else mime = 'audio/webm';
      }

      const transcript = await transcribeAudioAPI(pureBase64, mime);
      console.log(`[VOICE FILE] Transcrição retornada: "${transcript}"`);

      const cleanTranscript = (transcript || '').trim();
      if (!cleanTranscript) {
        throw new Error('O arquivo de áudio foi processado, mas nenhuma fala perceptível foi detectada nele.');
      }

      setTranscribedPreview(cleanTranscript);
      setVoiceState('TRANSCRIBED');

      // Send to chatbot with estimated duration badge
      const estimatedSecs = Math.max(2, Math.round(file.size / 16000));
      await sendChatMessage(cleanTranscript, undefined, undefined, undefined, estimatedSecs);

      setTimeout(() => {
        setVoiceState('IDLE');
        setTranscribedPreview(null);
      }, 1200);
    } catch (err: any) {
      console.error('[VOICE FILE] Erro ao processar áudio:', err);
      setVoiceError(err.message || 'Falha ao processar e transcrever o arquivo de áudio.');
      setVoiceState('ERROR');
    }
  };

  // 1. Start Audio Recording (Microphone Capture & MediaRecorder Setup)
  const startRecording = async () => {
    setVoiceError(null);
    setTranscribedPreview(null);
    liveTranscriptRef.current = '';

    // Audit microphone capability in browser environment
    if (!navigator?.mediaDevices?.getUserMedia) {
      console.error('[VOICE] Microphone permission: denied (navigator.mediaDevices.getUserMedia não suportado)');
      console.log('[VOICE] MediaStream obtained: false');
      setVoiceError('Não foi possível acessar o microfone neste navegador. Utilize o botão "Enviar Áudio" para enviar áudios do WhatsApp ou gravações do celular.');
      setVoiceState('ERROR');
      return;
    }

    let stream: MediaStream;
    try {
      try {
        // High fidelity audio constraints with autoGainControl enabled and noise gating disabled to prevent muting laptop microphones
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            autoGainControl: true,
            echoCancellation: false,
            noiseSuppression: false,
          },
        });
      } catch (advancedErr) {
        console.warn('[VOICE] Falha com restrições avançadas de áudio, tentando com áudio padrão...', advancedErr);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      console.log('[VOICE] Microphone permission: granted');
      console.log('[VOICE] MediaStream obtained: true');
    } catch (err: any) {
      console.error('[VOICE] Microphone permission: denied', err);
      console.log('[VOICE] MediaStream obtained: false');

      const isNotAllowed = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      const isNotFound = err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError';

      const errorMsg = isNotAllowed
        ? 'O navegador bloqueou o acesso ao microfone nesta janela. Clique no ícone de cadeado 🔒 na barra de endereços para permitir o microfone, ou envie diretamente o arquivo de áudio (WhatsApp/celular) pelo botão ao lado.'
        : isNotFound
        ? 'Nenhum dispositivo de microfone foi encontrado no sistema. Você pode enviar arquivos de áudio gravados diretamente.'
        : `Não foi possível acessar o microfone: ${err.message || 'Erro desconhecido'}`;

      setVoiceError(errorMsg);
      setVoiceState('ERROR');
      return;
    }

    // Connect real-time audio volume analyser to give immediate visual feedback
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateMeter = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setLiveVolume(Math.min(100, Math.round((avg / 64) * 100)));
          animFrameRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();
      }
    } catch (analyserErr) {
      console.warn('[VOICE] AudioContext analyser not initialized:', analyserErr);
    }

    // Start local SpeechRecognition in parallel if browser supports it
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.lang = 'pt-BR';
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (evt: any) => {
          let text = '';
          for (let i = 0; i < evt.results.length; ++i) {
            text += evt.results[i][0].transcript + ' ';
          }
          liveTranscriptRef.current = text.trim();
        };
        rec.onerror = () => {};
        rec.start();
        speechRecognitionRef.current = rec;
      } catch (recErr) {
        console.warn('[VOICE] WebSpeech parallel recognition error:', recErr);
      }
    }

    // Audit audio tracks
    const tracks = stream.getAudioTracks();
    console.log(`[VOICE] Audio tracks: ${tracks.length}`);
    if (tracks.length === 0) {
      stream.getTracks().forEach((t) => t.stop());
      console.error('[VOICE] Nenhum canal de áudio disponível');
      setVoiceError('Não foi possível acessar o microfone: nenhuma faixa de áudio ativa.');
      setVoiceState('ERROR');
      return;
    }

    const mainTrack = tracks[0];
    console.log(`[VOICE] Track label: "${mainTrack.label}", state: "${mainTrack.readyState}", enabled: ${mainTrack.enabled}`);

    // Detect browser supported MIME format in order of fidelity
    const candidateMimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/wav',
    ];

    let chosenMime = '';
    if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
      for (const mime of candidateMimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          chosenMime = mime;
          break;
        }
      }
    }

    selectedMimeTypeRef.current = chosenMime || 'audio/webm';
    console.log(`[VOICE] Selected MIME type for recording: ${selectedMimeTypeRef.current}`);

    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = chosenMime
        ? new MediaRecorder(stream, { mimeType: chosenMime })
        : new MediaRecorder(stream);
      console.log('[VOICE] MediaRecorder created: true');
    } catch (createErr: any) {
      console.warn('[VOICE] MediaRecorder creation with MIME failed, falling back to browser default:', createErr);
      try {
        mediaRecorder = new MediaRecorder(stream);
        console.log('[VOICE] MediaRecorder created: true');
      } catch (fallbackErr: any) {
        stream.getTracks().forEach((t) => t.stop());
        console.error('[VOICE] MediaRecorder created: false', fallbackErr);
        setVoiceError(`Falha ao inicializar o gravador: ${fallbackErr.message}`);
        setVoiceState('ERROR');
        return;
      }
    }

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    // Register ondataavailable to store all chunks
    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        audioChunksRef.current.push(event.data);
        console.log(`[VOICE] Audio chunk received: ${event.data.size} bytes`);
      }
    };

    // Start recording with 500ms timeslice to receive frequent chunks
    try {
      mediaRecorder.start(500);
      console.log('[VOICE] Recording started');
      setVoiceState('RECORDING');
    } catch (startErr: any) {
      stream.getTracks().forEach((t) => t.stop());
      console.error('[VOICE] Failed to start MediaRecorder:', startErr);
      setVoiceError(`Erro ao iniciar a gravação: ${startErr.message}`);
      setVoiceState('ERROR');
    }
  };

  // 2. Stop Recording & Complete Transcription Pipeline
  const stopRecordingAndSend = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      console.warn('[VOICE] stopRecordingAndSend chamado com recorder inativo');
      setVoiceState('IDLE');
      return;
    }

    // Stop volume analyser and animation frame
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    setLiveVolume(0);

    // Stop parallel speech recognition
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch {}
    }

    const recordedDuration = recordingSeconds;
    setVoiceState('PROCESSING');

    // Flush any pending audio before stopping
    if (recorder.state === 'recording') {
      try { recorder.requestData(); } catch {}
    }

    try {
      // Avoid race conditions between stop(), ondataavailable and onstop by awaiting the onstop Promise
      const audioBlob: Blob = await new Promise((resolve, reject) => {
        let stopTimeout: any = null;

        recorder.onstop = () => {
          if (stopTimeout) clearTimeout(stopTimeout);
          console.log('[VOICE] Recording stopped');

          try {
            // Stop and release all microphone tracks
            if (recorder.stream) {
              recorder.stream.getTracks().forEach((track) => track.stop());
            }

            const finalMime = recorder.mimeType || selectedMimeTypeRef.current || 'audio/webm';
            const blob = new Blob(audioChunksRef.current, { type: finalMime });

            console.log(`[VOICE] Blob size: ${blob.size} bytes`);
            console.log(`[VOICE] Blob type: ${blob.type}`);

            if (blob.size === 0) {
              reject(new Error('O áudio gravado está vazio (tamanho do arquivo é 0 bytes).'));
              return;
            }

            resolve(blob);
          } catch (blobErr) {
            reject(blobErr);
          }
        };

        recorder.onerror = (event: any) => {
          if (stopTimeout) clearTimeout(stopTimeout);
          console.error('[VOICE] MediaRecorder error event:', event.error);
          reject(event.error || new Error('Erro ocorrido durante a captura do áudio.'));
        };

        // Safety fallback timer to prevent hanging
        stopTimeout = setTimeout(() => {
          if (recorder.stream) {
            recorder.stream.getTracks().forEach((track) => track.stop());
          }
          if (audioChunksRef.current.length > 0) {
            const finalMime = recorder.mimeType || selectedMimeTypeRef.current || 'audio/webm';
            const blob = new Blob(audioChunksRef.current, { type: finalMime });
            resolve(blob);
          } else {
            reject(new Error('Tempo limite excedido ao finalizar a gravação.'));
          }
        }, 3000);

        try {
          recorder.stop();
        } catch (stopErr) {
          if (stopTimeout) clearTimeout(stopTimeout);
          reject(stopErr);
        }
      });

      // 3. Convert Blob to pure Base64
      const audioBase64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const pureBase64 = result.includes(',') ? result.split(',')[1] : result;
          resolve(pureBase64);
        };
        reader.onerror = () => reject(new Error('Falha ao processar arquivo de áudio para envio.'));
        reader.readAsDataURL(audioBlob);
      });

      // 4. Send audio for speech-to-text transcription
      setVoiceState('TRANSCRIBING');
      console.log('[VOICE] Sending audio for transcription');
      console.log('[VOICE] Transcription request started');

      let transcript = '';
      try {
        transcript = await transcribeAudioAPI(audioBase64, audioBlob.type);
      } catch (apiErr: any) {
        console.warn('[VOICE] transcribeAudioAPI error:', apiErr.message);
      }

      console.log('[VOICE] Transcription response received:', transcript);

      // 5. Validate transcribed text, with local speech fallback if needed
      let cleanTranscript = (transcript || '').trim();

      // Rescue text if local speech recognition heard words
      if (!cleanTranscript && liveTranscriptRef.current) {
        console.log(`[VOICE] Transcrição resgatada pelo motor de fala local: "${liveTranscriptRef.current}"`);
        cleanTranscript = liveTranscriptRef.current.trim();
      }

      if (!cleanTranscript) {
        console.warn('[VOICE] Transcribed text is empty (no speech detected)');
        setVoiceError('O microfone gravou, mas o som capturado ficou muito baixo ou silenciado nas configurações do computador. Fale mais próximo ao microfone ou use o botão "Enviar Áudio" abaixo.');
        setVoiceState('ERROR');
        return;
      }

      // 6. Show success state and send to chatbot
      setTranscribedPreview(cleanTranscript);
      setVoiceState('TRANSCRIBED');
      console.log('[VOICE] Sending transcription to chatbot:', cleanTranscript);

      // Forward directly into chatbot message flow with recorded duration badge
      await sendChatMessage(cleanTranscript, undefined, undefined, undefined, recordedDuration || 1);

      setTimeout(() => {
        setVoiceState('IDLE');
        setTranscribedPreview(null);
      }, 1200);
    } catch (err: any) {
      console.error('[VOICE] Erro na cadeia de voz:', err);
      const isTranscribeError = err.message && (err.message.includes('transcrever') || err.message.includes('transcrição'));
      const errorMsg = isTranscribeError
        ? `O áudio foi enviado, mas o serviço de transcrição retornou um erro: ${err.message}`
        : err.message || 'O áudio foi gravado, mas a transcrição falhou.';
      setVoiceError(errorMsg);
      setVoiceState('ERROR');
    }
  };

  // 3. Cancel Recording
  const cancelRecording = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    setLiveVolume(0);
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch {}
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {}
      if (recorder.stream) {
        recorder.stream.getTracks().forEach((track) => track.stop());
      }
    }
    audioChunksRef.current = [];
    setVoiceState('IDLE');
    setVoiceError(null);
    setTranscribedPreview(null);
    console.log('[VOICE] Recording canceled by user');
  };

  // Image Upload Handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setAttachedImage({
        base64,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    if (!inputText.trim() && !attachedImage) return;

    const textToSend = inputText.trim() || 'Analise este print e extraia as informações comerciais.';
    const imageBase64 = attachedImage?.base64;
    const imageName = attachedImage?.name;

    setInputText('');
    setAttachedImage(null);

    sendChatMessage(textToSend, undefined, imageBase64, imageName);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 max-w-4xl w-full mx-auto bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Top Header of Chat */}
      <div className="px-3 py-2.5 sm:p-4 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0F2042] flex items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-display truncate">
                Iza · Copiloto Comercial 24h
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online em tempo real" />
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate hidden sm:block">
              Atualiza timeline, funil e tarefas das clínicas em tempo real.
            </p>
          </div>
        </div>

        {/* Client selector (Desktop only, as header already has it) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-blue-900 shrink-0" />
            <span className="text-[10px] text-slate-500 font-medium">Contexto:</span>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-transparent text-slate-900 font-semibold text-xs focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos os Clientes</option>
              {state?.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F8FAFC]">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div
                className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed max-w-[90%] sm:max-w-[80%] ${
                  isUser
                    ? 'bg-[#0F2042] text-white rounded-br-xs shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                }`}
              >
                {/* User Attached Image Preview */}
                {msg.imageData && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-white/20 max-w-xs">
                    <img
                      src={`data:image/png;base64,${msg.imageData}`}
                      alt={msg.imageName || 'Anexo'}
                      className="w-full object-cover max-h-48"
                    />
                    {msg.imageName && (
                      <div className="bg-black/30 text-[10px] text-white px-2 py-0.5 truncate">
                        {msg.imageName}
                      </div>
                    )}
                  </div>
                )}

                {/* Voice note indicator if message originated from audio */}
                {isUser && msg.audioDuration && (
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-blue-200 bg-white/10 px-2.5 py-1 rounded-lg w-fit">
                    <Mic className="w-3.5 h-3.5 text-blue-300" />
                    <span>Mensagem de voz ({formatSeconds(msg.audioDuration)}) • Transcrito</span>
                  </div>
                )}

                <FormattedMessage text={msg.text} isUser={isUser} />

                {/* Timestamp */}
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    isUser ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {/* Real Executed Actions Cards (Requirement 26 & 49) */}
              {!isUser && msg.actionsExecuted && msg.actionsExecuted.length > 0 && (
                <div className="mt-2.5 space-y-2 max-w-[90%] sm:max-w-[80%] w-full">
                  <div className="text-[11px] font-semibold text-slate-500 px-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ações executadas no CRM:</span>
                  </div>

                  {msg.actionsExecuted.map((act, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-emerald-200/70 rounded-xl text-xs shadow-2xs flex items-start justify-between gap-3 hover:border-emerald-300 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {act.type}
                        </div>
                        <p className="text-slate-600 mt-0.5">{act.description}</p>
                      </div>

                      {act.entityId && act.entityType === 'paciente' && (
                        <button
                          onClick={() => {
                            setSelectedPatientId(act.entityId!);
                            setActiveView('pacientes');
                          }}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-medium rounded-md flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <span>Ver Ficha</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {act.entityType === 'oportunidade' && (
                        <button
                          onClick={() => setActiveView('pipeline')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[11px] font-medium rounded-md flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <span>Pipeline</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {act.entityType === 'tarefa' && (
                        <button
                          onClick={() => setActiveView('tarefas')}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-medium rounded-md flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <span>Tarefas</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Follow-up Prompts */}
              {!isUser && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%] sm:max-w-[80%]">
                  {msg.suggestedPrompts.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => {
                        setInputText(sug);
                      }}
                      className="text-[11px] text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors text-left"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Processing Indicator */}
        {isChatProcessing && (
          <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl w-fit text-xs text-slate-500 shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-800 animate-spin" />
            <span>A Iza está processando e sincronizando o CRM...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Audio Recording Active Banner */}
      {voiceState === 'RECORDING' && (
        <div className="p-3 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-rose-800 text-xs px-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-rose-900">Gravando áudio da SDR...</span>
              {liveVolume > 4 ? (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Voz detectada
                </span>
              ) : (
                <span className="text-rose-600 text-[11px] font-normal">(fale agora)</span>
              )}
            </div>
            {/* Visual audio wave bars reacting to live volume */}
            <div className="flex items-center gap-0.5 ml-1 h-6">
              <span
                style={{ height: `${Math.max(6, Math.min(24, 6 + (liveVolume * 0.18)))}px` }}
                className="w-1 bg-rose-500 rounded-full transition-all duration-75"
              ></span>
              <span
                style={{ height: `${Math.max(8, Math.min(26, 8 + (liveVolume * 0.28)))}px` }}
                className="w-1 bg-rose-600 rounded-full transition-all duration-75"
              ></span>
              <span
                style={{ height: `${Math.max(5, Math.min(20, 5 + (liveVolume * 0.15)))}px` }}
                className="w-1 bg-rose-400 rounded-full transition-all duration-75"
              ></span>
              <span
                style={{ height: `${Math.max(7, Math.min(24, 7 + (liveVolume * 0.24)))}px` }}
                className="w-1 bg-rose-500 rounded-full transition-all duration-75"
              ></span>
            </div>
            <span className="font-mono text-rose-950 font-bold ml-2 bg-rose-100/80 px-2 py-0.5 rounded text-[11px]">
              {formatSeconds(recordingSeconds)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-800 text-xs font-medium hover:bg-rose-100/50 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={stopRecordingAndSend}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Concluir e Transcrever</span>
            </button>
          </div>
        </div>
      )}

      {/* Processing Audio File Banner */}
      {voiceState === 'PROCESSING' && (
        <div className="p-3 bg-blue-50 border-t border-blue-200 flex items-center justify-between text-blue-900 text-xs px-4">
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="font-medium">Processando áudio capturado e montando arquivo...</span>
          </div>
          <span className="text-[10px] text-blue-500 font-mono">MediaRecorder.onstop</span>
        </div>
      )}

      {/* Transcribing Audio Speech-to-Text Banner */}
      {voiceState === 'TRANSCRIBING' && (
        <div className="p-3 bg-indigo-50 border-t border-indigo-200 flex items-center justify-between text-indigo-900 text-xs px-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
            <span className="font-medium">Transcrevendo áudio com Inteligência Artificial (Speech-to-Text)...</span>
          </div>
          <span className="text-[10px] text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded font-medium">
            Gemini 3.5 Transcribe
          </span>
        </div>
      )}

      {/* Transcribed Success Banner */}
      {voiceState === 'TRANSCRIBED' && (
        <div className="p-3 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-emerald-900 text-xs px-4">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold shrink-0">Áudio transcrito:</span>
            <span className="italic text-emerald-800 truncate">"{transcribedPreview}"</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
            Enviando ao Chatbot...
          </span>
        </div>
      )}

      {/* Error State Banner */}
      {voiceState === 'ERROR' && voiceError && (
        <div className="p-3 bg-rose-50 border-t border-rose-300 flex flex-col sm:flex-row sm:items-center justify-between text-rose-900 text-xs px-4 gap-2.5">
          <div className="flex items-start sm:items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
            <div className="leading-snug">
              <span className="font-semibold">{voiceError}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
            {/* Fallback button to upload WhatsApp or phone audio file */}
            <button
              type="button"
              onClick={() => audioFileInputRef.current?.click()}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Selecione um áudio gravado no WhatsApp ou no celular (.mp3, .ogg, .m4a, .wav)"
            >
              <FileAudio className="w-3.5 h-3.5" />
              <span>Enviar Áudio (.mp3 / WhatsApp)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setVoiceError(null);
                setVoiceState('IDLE');
                startRecording();
              }}
              className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Tentar Novamente</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setVoiceState('IDLE');
                setVoiceError(null);
              }}
              className="text-rose-500 hover:text-rose-700 p-1 text-xs font-semibold hover:bg-rose-100 rounded transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Attached Image Preview Bar */}
      {attachedImage && (
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <ImageIcon className="w-4 h-4 text-blue-800 shrink-0" />
            <span className="font-medium text-slate-700 truncate">{attachedImage.name}</span>
            <span className="text-[10px] text-slate-400 shrink-0">Print anexado para análise</span>
          </div>
          <button
            onClick={() => setAttachedImage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Input Controls Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80 space-y-2.5">
        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold shrink-0">Sugestões:</span>
          {[
            'O que tenho para fazer hoje?',
            'O que está atrasado na Face Doctor?',
            'Tarefas de hoje na Camila Silva',
            'Oportunidades sem próxima ação',
            'Cadastrar nova paciente',
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                sendChatMessage(prompt);
              }}
              className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-medium whitespace-nowrap transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-2">
          {/* Hidden File Input for Prints/Screenshots */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Hidden File Input for Audio Files (.mp3, .ogg do WhatsApp, .m4a, .wav, .webm) */}
          <input
            type="file"
            ref={audioFileInputRef}
            onChange={handleAudioFileSelect}
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm,.aac"
            className="hidden"
          />

          {/* Attach Print / Image Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Anexar print de conversa ou orçamento"
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Upload Audio File Button (.mp3, WhatsApp audio, voice memos) */}
          <button
            type="button"
            onClick={() => audioFileInputRef.current?.click()}
            disabled={voiceState === 'PROCESSING' || voiceState === 'TRANSCRIBING' || isChatProcessing}
            title="Enviar arquivo de áudio (áudios gravados no WhatsApp, celular, .mp3, .ogg, .m4a)"
            className="p-2.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <FileAudio className="w-5 h-5" />
          </button>

          {/* Microphone Live Audio Record Button */}
          <button
            type="button"
            onClick={() => {
              if (voiceState === 'RECORDING') {
                stopRecordingAndSend();
              } else if (voiceState === 'IDLE' || voiceState === 'ERROR') {
                startRecording();
              }
            }}
            disabled={voiceState === 'PROCESSING' || voiceState === 'TRANSCRIBING' || isChatProcessing}
            title={
              voiceState === 'RECORDING'
                ? 'Concluir gravação e transcrever'
                : voiceState === 'PROCESSING' || voiceState === 'TRANSCRIBING'
                ? 'Processando áudio...'
                : 'Gravar áudio ao vivo pelo microfone'
            }
            className={`p-2.5 rounded-xl transition-colors shrink-0 cursor-pointer ${
              voiceState === 'RECORDING'
                ? 'bg-rose-600 text-white animate-pulse shadow-sm ring-2 ring-rose-300'
                : voiceState === 'PROCESSING' || voiceState === 'TRANSCRIBING'
                ? 'bg-blue-100 text-blue-600 cursor-wait'
                : 'text-slate-500 hover:text-blue-900 hover:bg-blue-50'
            }`}
          >
            {voiceState === 'RECORDING' ? (
              <MicOff className="w-5 h-5" />
            ) : voiceState === 'PROCESSING' || voiceState === 'TRANSCRIBING' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Text Area */}
          <div className="flex-1 relative">
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite o que aconteceu... (ex: 'Falei com a Fernanda...')"
              className="w-full resize-none py-2.5 px-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:bg-white focus:border-blue-900 transition-all text-slate-800 placeholder-slate-400 max-h-32"
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={(!inputText.trim() && !attachedImage) || isChatProcessing}
            className="p-2.5 bg-[#0F2042] hover:bg-[#1A365D] disabled:opacity-30 text-white rounded-xl transition-colors shrink-0 shadow-xs"
            title="Enviar mensagem"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Quick helper tip for the SDR */}
        <div className="mt-2 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
          <span>Dica: Experimente ditar ou digitar</span>
          <span className="font-medium text-slate-600">
            "Falei com a Juliana, ela quer olheira mês que vem. Me lembra de chamar depois do dia 10"
          </span>
        </div>
      </div>
    </div>
  );
};
