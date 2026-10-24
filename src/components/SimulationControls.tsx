import React from 'react';
import { useMarine } from '../context/MarineContext';
import { Sliders, AlertOctagon, RotateCcw, Play, Pause, FastForward } from 'lucide-react';
import { Vessel } from '../types/marine';

export const SimulationControls: React.FC = () => {
  const {
    activeVessel,
    setTelegraph,
    triggerFault,
    activeFault,
    simSpeed,
    setSimSpeed,
    isPaused,
    setIsPaused,
    language,
  } = useMarine();

  const me = activeVessel.mainEngine;

  const telegraphOrders: Vessel['mainEngine']['telegraph'][] = [
    'Full Ahead',
    'Half Ahead',
    'Slow Ahead',
    'Dead Slow Ahead',
    'Stop',
    'Astern',
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">
            {language === 'id' ? 'Kontrol Telegraf Jembatan & Simulasi Anomali' : 'Bridge Telegraph & Fault Injection Simulator'}
          </h3>
        </div>

        {/* Sim speed controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Lanjut' : 'Jeda'}</span>
          </button>

          <div className="flex items-center bg-slate-950 rounded border border-slate-800 p-0.5">
            {[1, 2, 5].map(spd => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  simSpeed === spd
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bridge Engine Telegraph Lever */}
        <div>
          <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span>{language === 'id' ? 'Tuas Telegraf Mesin (Bridge Engine Order)' : 'Engine Order Telegraph'}</span>
            <span className="font-mono text-cyan-400 font-bold">{me.telegraph}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {telegraphOrders.map(order => {
              const isSelected = me.telegraph === order;
              return (
                <button
                  key={order}
                  onClick={() => setTelegraph(order)}
                  className={`py-2 px-1 text-[11px] font-mono font-medium rounded-lg border transition-all text-center ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm shadow-cyan-500/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {order}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Mengubah perintah telegraf secara otomatis memodulasi RPM poros baling-baling, beban %, daya kW, dan laju bakar bahan bakar.
          </p>
        </div>

        {/* Fault Injection / Emergency Drill Scenarios */}
        <div>
          <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span>{language === 'id' ? 'Latihan Darurat & Uji Anomali Sistem (Drill)' : 'Fault Scenarios / Marine Drills'}</span>
            {activeFault && (
              <span className="text-[11px] font-mono text-rose-400 font-bold animate-pulse">
                ANOMALI AKTIF: {activeFault}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => triggerFault('thrust_vibration')}
              className={`p-2 text-left rounded-lg border text-xs transition-colors ${
                activeFault === 'thrust_vibration'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-rose-500/30'
              }`}
            >
              <div className="font-semibold text-[11px] leading-tight">Getaran Poros Kritis</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">&gt; 7.1 mm/s Zone D</div>
            </button>

            <button
              onClick={() => triggerFault('cylinder_temp')}
              className={`p-2 text-left rounded-lg border text-xs transition-colors ${
                activeFault === 'cylinder_temp'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-500/30'
              }`}
            >
              <div className="font-semibold text-[11px] leading-tight">Suhu Silinder #4</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Exhaust 438°C High</div>
            </button>

            <button
              onClick={() => triggerFault('low_lube_oil')}
              className={`p-2 text-left rounded-lg border text-xs transition-colors ${
                activeFault === 'low_lube_oil'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-rose-500/30'
              }`}
            >
              <div className="font-semibold text-[11px] leading-tight">Tekanan LO Rendah</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">2.85 Bar (&lt;3.2)</div>
            </button>

            <button
              onClick={() => triggerFault('high_bilge')}
              className={`p-2 text-left rounded-lg border text-xs transition-colors ${
                activeFault === 'high_bilge'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-500/30'
              }`}
            >
              <div className="font-semibold text-[11px] leading-tight">Got Mesin Penuh</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Bilge Well 860 mm</div>
            </button>

            <button
              onClick={() => triggerFault('ows_violation')}
              className={`p-2 text-left rounded-lg border text-xs transition-colors ${
                activeFault === 'ows_violation'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-rose-500/30'
              }`}
            >
              <div className="font-semibold text-[11px] leading-tight">OWS &gt; 15 PPM</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">MARPOL Violation</div>
            </button>

            <button
              onClick={() => triggerFault('reset')}
              className="p-2 text-left rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs transition-colors flex items-center justify-center gap-1.5 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Normal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
