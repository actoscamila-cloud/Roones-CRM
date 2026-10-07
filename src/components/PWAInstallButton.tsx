import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { Smartphone, Download, Check, Sparkles, X } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'mobile-banner' | 'sidebar' | 'menu-item';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // If already installed in standalone mode, show subtle badge in menu or hide
  if (isInstalled) {
    if (variant === 'menu-item') {
      return (
        <div className="flex items-center gap-2 p-2.5 rounded-xl text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Versão App Ativa (Standalone)</span>
        </div>
      );
    }
    return null;
  }

  const handleClick = async () => {
    // If browser supports direct install prompt, trigger it directly!
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        // If dismissed or failed, show guidance modal
        setShowModal(true);
      }
    } else {
      // iOS or browser without direct prompt: open didactic instructions modal
      setShowModal(true);
    }
  };

  // 1. Mobile Bottom/Floating Banner variant (prominently visible on mobile screens)
  if (variant === 'mobile-banner') {
    if (isBannerDismissed) return null;

    return (
      <>
        <div className="fixed bottom-16 left-3 right-3 md:hidden z-30 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#0F2042] text-white p-3 rounded-2xl shadow-xl border border-blue-900/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-blue-300" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate flex items-center gap-1.5">
                  <span>Usar no Celular</span>
                  <span className="text-[10px] bg-blue-500/30 text-blue-200 font-semibold px-1.5 py-0.2 rounded">App</span>
                </div>
                <div className="text-[10px] text-blue-200 truncate">
                  Instale na tela de início para acesso rápido
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleClick}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>
              <button
                onClick={() => setIsBannerDismissed(true)}
                className="p-1.5 text-blue-300/70 hover:text-white rounded-lg transition"
                aria-label="Dispensar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  // 2. Menu Item variant (inside mobile drawer or desktop sidebar)
  if (variant === 'menu-item' || variant === 'sidebar') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs bg-blue-50 hover:bg-blue-100 text-[#0F2042] font-semibold border border-blue-200 transition-all ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-blue-700 shrink-0" />
            <div className="text-left">
              <div>Baixar / Instalar App</div>
              <div className="text-[10px] text-blue-600 font-normal">Adicionar à tela de início do celular</div>
            </div>
          </div>
          <Download className="w-4 h-4 text-blue-700 shrink-0" />
        </button>

        <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  // 3. Header variant (compact button for desktop & mobile header)
  return (
    <>
      <button
        onClick={handleClick}
        title="Instalar Roones CRM no Celular ou Computador"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 border border-slate-200 hover:border-blue-300 text-slate-700 text-xs font-semibold rounded-lg transition-all active:scale-95 ${className}`}
      >
        <Smartphone className="w-3.5 h-3.5 text-blue-700" />
        <span className="hidden sm:inline">Baixar App</span>
        <span className="sm:hidden">App</span>
      </button>

      <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
