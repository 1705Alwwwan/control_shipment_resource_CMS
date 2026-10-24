import React from 'react';
import { useMarine } from '../context/MarineContext';
import { Ship, Bell, BellOff, Volume2, VolumeX, FileSpreadsheet, ShieldAlert, Activity } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNoonReport: () => void;
  onOpenAlarms: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNoonReport,
  onOpenAlarms,
}) => {
  const {
    activeVessel,
    unacknowledgedCount,
    activeAlarmCount,
    isMuted,
    toggleMute,
    language,
    setLanguage,
  } = useMarine();

  const isCritical = activeVessel.mainEngine.thrustBearingVibration > 7.1 ||
    activeVessel.mainEngine.lubeOilPressure < 3.2 ||
    activeVessel.resources.owsOverboardPpm > 15;

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-8 max-w-[1720px] mx-auto">
        {/* Zone 1: Brand title wordmark with subtle vessel icon */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Ship className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <a href="/" className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              MARINETEK <span className="text-cyan-400 font-mono text-sm font-semibold">CMS</span>
            </a>
            <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap leading-none">
              ISO 13374 / BKI Telemetri
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {[
            { id: 'overview', label: language === 'id' ? 'Ikhtisar Kapal' : 'Vessel Overview' },
            { id: 'machinery', label: language === 'id' ? 'Permesinan & Propulsi' : 'Machinery & Propulsion' },
            { id: 'tanks', label: language === 'id' ? 'Tangki & Sumber Daya' : 'Tanks & Resources' },
            { id: 'electrical', label: language === 'id' ? 'Kelistrikan & PMS' : 'Electrical PMS' },
            { id: 'alarms', label: language === 'id' ? 'Sistem Alarm' : 'Alarms & Drills' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Action & Quick Telemetry Controls */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
            <button
              onClick={() => setLanguage('id')}
              className={`px-2 py-0.5 rounded ${language === 'id' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Bahasa Indonesia"
            >
              ID
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Alarm Status & Buzzer Mute */}
          <button
            onClick={onOpenAlarms}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors whitespace-nowrap ${
              isCritical
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                : activeAlarmCount > 0
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}
            title="Buka Panel Alarm"
          >
            {isCritical ? (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Bell className="w-3.5 h-3.5" />
            )}
            <span>
              {unacknowledgedCount > 0 ? `${unacknowledgedCount} ALARM` : 'NOMINAL'}
            </span>
          </button>

          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isMuted
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title={isMuted ? 'Buzzer dibisukan' : 'Buzzer aktif'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Primary Action: Noon Report Generator */}
          <button
            onClick={onOpenNoonReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-900 bg-cyan-400 hover:bg-cyan-300 font-sans rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-cyan-500/20 font-semibold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'Laporan Noon' : 'Noon Report'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
