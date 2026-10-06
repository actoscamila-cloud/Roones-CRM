import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  Search,
  Plus,
  Phone,
  Calendar,
  ArrowRight,
  Filter,
  MessageCircle,
  Tag,
  Sparkles,
} from 'lucide-react';
import { PatientStatus } from '../types/crm';

interface PacientesViewProps {
  onOpenNewPatientModal?: () => void;
}

export const PacientesView: React.FC<PacientesViewProps> = ({ onOpenNewPatientModal }) => {
  const { state, setSelectedPatientId, selectedClientId, setSelectedClientId } = useCRM();
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!state) return null;

  const selectedClient = state.clients.find((c) => c.id === selectedClientId);

  const filteredPatients = state.patients.filter((p) => {
    const matchesClient = selectedClientId === 'todos' || p.clientId === selectedClientId;
    const matchesStatus = filterStatus === 'todos' || p.status === filterStatus;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.phone.includes(term) ||
      p.origin.toLowerCase().includes(term) ||
      (p.clientName && p.clientName.toLowerCase().includes(term)) ||
      p.tags.some((t) => t.toLowerCase().includes(term));
    return matchesClient && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#0F2042] font-display">
            Diretório de Pacientes & Leads
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {filteredPatients.length} pacientes {selectedClient ? `cadastradas na ${selectedClient.name}` : `em todas as ${state.clients.length} clínicas parceiras`}
          </p>
        </div>

        {onOpenNewPatientModal && (
          <button
            onClick={onOpenNewPatientModal}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#0F2042] hover:bg-[#1A365D] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors w-full sm:w-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Paciente</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Filter Tabs (Interactive Filter Controls, anti-pill discipline) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-lg w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'todos', label: 'Todas' },
            { id: 'lead', label: 'Leads' },
            { id: 'em_atendimento', label: 'Em Atendimento' },
            { id: 'ativo', label: 'Ativas' },
            { id: 'inativo', label: 'Inativas (+120d)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Patients List Grid */}
      {filteredPatients.length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center p-6 space-y-2">
          <p className="text-sm font-semibold text-slate-700">Nenhuma paciente encontrada com esses filtros.</p>
          <p className="text-xs text-slate-400">
            Experimente limpar o termo de busca ou fale com a IA para cadastrar uma nova paciente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map((patient) => {
            const opps = state.opportunities.filter((o) => o.patientId === patient.id);
            const activeOpp = opps[0];

            return (
              <div
                key={patient.id}
                onClick={() => setSelectedPatientId(patient.id)}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display truncate group-hover:text-blue-900">
                          {patient.name}
                        </h3>
                        {patient.clientName && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded text-blue-800 bg-blue-50 border border-blue-200 shrink-0">
                            {patient.clientName}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded text-slate-700 bg-slate-100 border border-slate-200 uppercase shrink-0">
                          {patient.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {patient.phone || 'Sem telefone'}
                        </span>
                        <span>·</span>
                        <span>Origem: {patient.origin}</span>
                      </div>
                    </div>

                    <div className="p-1 text-slate-300 group-hover:text-slate-600 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                    {patient.tags.slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px]"
                      >
                        {tag}
                      </span>
                    ))}
                    {patient.tags.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{patient.tags.length - 3}</span>
                    )}
                  </div>
                </div>

                {/* Bottom Commercial Snapshot */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  {/* Opportunity in progress */}
                  {activeOpp && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">Oportunidade:</span>
                      <span className="font-semibold text-slate-900">
                        {activeOpp.procedureName} (R$ {activeOpp.estimatedValue || 0})
                      </span>
                    </div>
                  )}

                  {/* Next Action */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 shrink-0">Próxima Ação:</span>
                    <span
                      className={`text-right font-medium truncate ${
                        patient.nextAction ? 'text-blue-900' : 'text-rose-600 font-bold'
                      }`}
                    >
                      {patient.nextAction || 'Sem próxima ação cadastrada'}
                    </span>
                  </div>

                  {/* Last interaction */}
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Último contato:</span>
                    <span>
                      {new Date(patient.lastInteractionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
