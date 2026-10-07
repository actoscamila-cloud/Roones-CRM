import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const SyncIndicator: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { syncStatus, lastSyncTime, forceSync } = useCRM();
  const [isRotating, setIsRotating] = useState(false);

  const handleManualSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    await forceSync();
    setTimeout(() => setIsRotating(false), 600);
  };

  const formattedTime = lastSyncTime
    ? lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  if (compact) {
    return (
      <button
        onClick={handleManualSync}
        title={`Status de Sincronização: ${syncStatus}. Última sincronização: ${formattedTime}. Clique para sincronizar agora.`}
        className="flex items-center gap-1 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      >
        {syncStatus === 'synced' && (
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        )}
        {syncStatus === 'syncing' && (
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRotating || syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
        )}
        {syncStatus === 'offline' && (
          <CloudOff className="w-3.5 h-3.5 text-amber-500" />
        )}
        {syncStatus === 'error' && (
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleManualSync}
      title="Clique para sincronizar dados com o servidor agora"
      className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium border border-slate-200/80 bg-slate-50 hover:bg-slate-100/90 text-slate-600 transition-all cursor-pointer"
    >
      {syncStatus === 'synced' && (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600">Salvo na nuvem</span>
          <RefreshCw className={`w-3 h-3 text-slate-400 hover:text-slate-600 ml-0.5 ${isRotating ? 'animate-spin' : ''}`} />
        </>
      )}

      {syncStatus === 'syncing' && (
        <>
          <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
          <span className="text-blue-700 font-semibold">Sincronizando...</span>
        </>
      )}

      {syncStatus === 'offline' && (
        <>
          <CloudOff className="w-3 h-3 text-amber-500" />
          <span className="text-amber-700">Offline (salvo local)</span>
        </>
      )}

      {syncStatus === 'error' && (
        <>
          <AlertCircle className="w-3 h-3 text-rose-500" />
          <span className="text-rose-700">Reconectar</span>
        </>
      )}
    </button>
  );
};
