import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Share, PlusSquare, CheckCircle2, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>(isIOS ? 'ios' : 'android');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0F2042] text-white p-5 flex items-start justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <Smartphone className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-base font-display">Instalar Roones CRM</h3>
              <p className="text-xs text-blue-200">Acesse direto da tela inicial do seu celular</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device selector tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 text-center transition-all ${
              activeTab === 'android'
                ? 'border-[#0F2042] text-[#0F2042]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Android / Computador
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 text-center transition-all ${
              activeTab === 'ios'
                ? 'border-[#0F2042] text-[#0F2042]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            iPhone / iPad (iOS)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600">
          {/* Quick install button for supported browsers */}
          {activeTab === 'android' && isInstallable && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-950">Instalação direta disponível!</span>
                <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded-full">1 Clique</span>
              </div>
              <p className="text-[11px] text-blue-800">
                Seu navegador suporta a instalação imediata do aplicativo na tela inicial do celular ou desktop.
              </p>
              <button
                onClick={async () => {
                  const ok = await install();
                  if (ok) onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0F2042] hover:bg-[#1A365D] text-white font-semibold rounded-lg shadow-sm transition"
              >
                <Download className="w-4 h-4 text-blue-300" />
                <span>Instalar Agora no Aparelho</span>
              </button>
            </div>
          )}

          {activeTab === 'android' && !isInstallable && (
            <div className="space-y-3">
              <div className="font-semibold text-slate-900 text-sm">
                Como adicionar no Android (Chrome ou Samsung Internet):
              </div>
              <ol className="space-y-2.5 list-decimal list-inside text-slate-700">
                <li className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-900">Abra o menu</span> do navegador tocando nos <strong>três pontinhos (⋮)</strong> no canto superior direito.
                </li>
                <li className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  Toque na opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                </li>
                <li className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  Confirme em <strong>"Instalar"</strong>. O ícone do Roones CRM aparecerá na gaveta de aplicativos e na tela inicial!
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                <span>Passo a passo no iPhone / iPad (Safari):</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      Toque no botão Compartilhar <Share className="w-3.5 h-3.5 text-blue-600 inline" />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Na barra inferior do Safari, clique no ícone quadrado com uma seta para cima.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      Selecione "Adicionar à Tela de Início" <PlusSquare className="w-3.5 h-3.5 text-slate-700 inline" />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Role o menu para baixo e localize a opção com o ícone de (+).
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      Toque em "Adicionar" no canto superior direito
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Pronto! O app abrirá em tela cheia sem barra do navegador, com máxima velocidade.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advantages of the installed PWA */}
          <div className="border-t border-slate-100 pt-3 space-y-2 text-[11px] text-slate-500">
            <div className="font-semibold text-slate-700">Vantagens da versão App:</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Abre em tela cheia</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Carregamento instantâneo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Gravação de áudio ágil</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Sincronização na nuvem</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition"
          >
            Entendi, fechar
          </button>
        </div>
      </div>
    </div>
  );
};
