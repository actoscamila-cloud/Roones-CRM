import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { X, UserPlus, Phone, Tag, Building2 } from 'lucide-react';

interface NewPatientModalProps {
  onClose: () => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ onClose }) => {
  const { state, quickCreatePatient, setSelectedPatientId, setActiveView, selectedClientId } = useCRM();

  const defaultClient = selectedClientId !== 'todos'
    ? selectedClientId
    : (state?.clients[0]?.id || 'cli-camila-silva');

  const [clientId, setClientId] = useState(defaultClient);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [origin, setOrigin] = useState('Instagram');
  const [notes, setNotes] = useState('');
  const [nextAction, setNextAction] = useState('Fazer primeiro contato de qualificação');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const chosenClient = state?.clients.find((c) => c.id === clientId);

    const newPat = await quickCreatePatient({
      name: name.trim(),
      phone: phone.trim(),
      clientId,
      clientName: chosenClient?.name,
      origin,
      commercialNotes: notes.trim(),
      nextAction: nextAction.trim() || undefined,
      nextActionDate: '2026-10-04T16:00:00.000Z',
      tags: ['Lead Novo', origin],
      status: 'lead',
    });

    setIsSubmitting(false);
    onClose();

    if (newPat?.id) {
      setSelectedPatientId(newPat.id);
      setActiveView('pacientes');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-900" />
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Cadastrar Paciente / Lead
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Cliente / Clínica Vinculada (Obrigatório) */}
          <div>
            <label className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
              <Building2 className="w-3.5 h-3.5 text-blue-900" />
              <span>Cliente / Clínica Vinculada *</span>
            </label>
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full p-2.5 bg-blue-50/50 border border-blue-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-900"
            >
              {state?.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.doctorOrOwner})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              Cada paciente deve pertencer estritamente a uma clínica da sua carteira.
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nome Completo da Paciente *</label>
            <input
              type="text"
              required
              placeholder="Ex: Mariana Souza"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                placeholder="(11) 98877-6655"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Canal de Origem</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="Instagram">Instagram Direct</option>
                <option value="Google">Google Ads / Site</option>
                <option value="Indicação">Indicação de Paciente</option>
                <option value="WhatsApp Direto">WhatsApp Direto</option>
                <option value="Retorno">Retorno de Procedimento</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Próxima Ação Comercial</label>
            <input
              type="text"
              placeholder="Ex: Enviar opções de horários com Dra. Sofia"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Observações Comerciais</label>
            <textarea
              rows={2}
              placeholder="Interesse em procedimentos, preferências de horário..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 bg-[#0F2042] hover:bg-[#1A365D] text-white font-semibold rounded-xl disabled:opacity-40"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
