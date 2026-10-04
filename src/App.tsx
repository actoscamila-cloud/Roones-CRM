import React, { useState } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { MeuDiaView } from './views/MeuDiaView';
import { ChatView } from './views/ChatView';
import { PacientesView } from './views/PacientesView';
import { PipelineView } from './views/PipelineView';
import { TarefasView } from './views/TarefasView';
import { FollowUpsView } from './views/FollowUpsView';
import { ReativacaoView } from './views/ReativacaoView';
import { ConfigView } from './views/ConfigView';
import { PatientDetailModal } from './components/PatientDetailModal';
import { NewTaskModal } from './components/NewTaskModal';
import { NewPatientModal } from './components/NewPatientModal';
import { Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView, setActiveView, selectedPatientId, setSelectedPatientId, loading, error } = useCRM();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 space-y-2">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0F2042] font-display tracking-tight">Roones CRM</h2>
          <p className="text-xs text-slate-500 mt-1">Carregando dados com a assistente Iza...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Sticky Minimalist Header */}
      <Header />

      {/* Main App Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Navigation (Desktop) & Bottom Navigation (Mobile) */}
        <Navigation />

        {/* Dynamic Center Stage View */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between">
              <span>{error}</span>
            </div>
          )}

          {activeView === 'meu-dia' && (
            <MeuDiaView
              onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
              onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
            />
          )}

          {activeView === 'chat' && <ChatView />}

          {activeView === 'pacientes' && (
            <PacientesView onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)} />
          )}

          {activeView === 'pipeline' && <PipelineView />}

          {activeView === 'tarefas' && (
            <TarefasView onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)} />
          )}

          {activeView === 'follow-ups' && <FollowUpsView />}

          {activeView === 'reativacao' && <ReativacaoView />}

          {activeView === 'config' && <ConfigView />}
        </main>
      </div>

      {/* Floating Quick AI Trigger Button (when not on chat screen) */}
      {activeView !== 'chat' && (
        <button
          onClick={() => setActiveView('chat')}
          className="fixed bottom-18 md:bottom-6 right-4 sm:right-6 z-40 px-4 py-3 bg-[#0F2042] hover:bg-[#1A365D] text-white rounded-full shadow-lg flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 group"
          title="Falar com a Iza"
        >
          <Sparkles className="w-4 h-4 text-blue-300 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Conversar com a Iza</span>
          <span className="sm:hidden">Iza</span>
        </button>
      )}

      {/* Patient Detail Modal */}
      {selectedPatientId && (
        <PatientDetailModal
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
        />
      )}

      {/* New Task Modal */}
      {isNewTaskModalOpen && (
        <NewTaskModal onClose={() => setIsNewTaskModalOpen(false)} />
      )}

      {/* New Patient Modal */}
      {isNewPatientModalOpen && (
        <NewPatientModal onClose={() => setIsNewPatientModalOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <CRMProvider>
      <AppContent />
    </CRMProvider>
  );
}
