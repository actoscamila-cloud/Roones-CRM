import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { X, Calendar, Clock, User, CheckSquare } from 'lucide-react';
import { TaskPriority, TaskCategory } from '../types/crm';

interface NewTaskModalProps {
  onClose: () => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ onClose }) => {
  const { state, quickCreateTask } = useCRM();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [patientId, setPatientId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [category, setCategory] = useState<TaskCategory>('follow-up');
  const [date, setDate] = useState('2026-10-04');
  const [time, setTime] = useState('10:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const selectedPat = state?.patients.find((p) => p.id === patientId);

    await quickCreateTask({
      title: title.trim(),
      description: description.trim(),
      patientId: patientId || undefined,
      patientName: selectedPat ? selectedPat.name : undefined,
      priority,
      category,
      date,
      time,
      origin: 'manual',
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-900" />
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Nova Tarefa / Follow-up
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Título da Tarefa *</label>
            <input
              type="text"
              required
              placeholder="Ex: Juliana — Retornar sobre preenchimento de olheira"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Vincular a Paciente</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="">Nenhum (Tarefa geral da clínica)</option>
              {state?.patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Data *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Horário</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="follow-up">Follow-up</option>
                <option value="lead">Lead</option>
                <option value="orcamento">Orçamento</option>
                <option value="reativacao">Reativação</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Descrição / Contexto</label>
            <textarea
              rows={2}
              placeholder="Detalhes ou lembretes específicos para esta ligação..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-2 bg-[#0F2042] hover:bg-[#1A365D] text-white font-semibold rounded-xl disabled:opacity-40"
            >
              {isSubmitting ? 'Salvando...' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
