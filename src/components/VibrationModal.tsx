import React from 'react';
import { useMarine } from '../context/MarineContext';
import { X, Activity, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';

interface VibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VibrationModal: React.FC<VibrationModalProps> = ({ isOpen, onClose }) => {
  const { activeVessel, language } = useMarine();
  if (!isOpen) return null;

  const me = activeVessel.mainEngine;
  const vib = me.thrustBearingVibration;
  const isCritical = vib > 7.1;
  const isWarning = vib > 4.5;

  // Simulated FFT Spectrum data points for Marine Thrust Bearing
  const baseFreq = Number((me.rpm / 60).toFixed(2)); // 1X running frequency in Hz (~1.6 Hz)
  const spectrumPoints = [
    { freq: Number((baseFreq * 0.5).toFixed(1)), amp: 0.35, label: '0.5X Sub-Harmonic', note: 'Oil Whirl / Clearance' },
    { freq: Number(baseFreq.toFixed(1)), amp: isCritical ? 4.8 : 1.85, label: '1X RPM', note: 'Unbalance / Mass Center' },
    { freq: Number((baseFreq * 2).toFixed(1)), amp: isCritical ? 3.4 : 1.1, label: '2X RPM', note: 'Shaft Angular Misalignment' },
    { freq: Number((baseFreq * 3).toFixed(1)), amp: 0.65, label: '3X Harmonics', note: 'Mechanical Looseness' },
    { freq: Number((baseFreq * 4).toFixed(1)), amp: isCritical ? 2.9 : 0.9, label: '4X BPF (Propeller)', note: 'Blade Pass Frequency' },
    { freq: 48.5, amp: isCritical ? 3.8 : 0.45, label: 'BPFO (Bearing)', note: 'Outer Race Ball Pass' },
    { freq: 72.0, amp: isCritical ? 2.5 : 0.3, label: 'BPFI (Bearing)', note: 'Inner Race Ball Pass' },
    { freq: 125.0, amp: 0.2, label: 'High Freq Noise', note: 'Hydraulic turbulence' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {language === 'id' ? 'Diagnostik Spektrum Getaran ISO 10816-6' : 'ISO 10816-6 FFT Vibration Analysis'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Titik Sensor: Bantalan Poros Dorong (Thrust Bearing) · 1X = {baseFreq} Hz ({me.rpm} RPM)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ISO Zone Status Banner */}
        <div className={`mt-4 p-4 rounded-lg border flex items-center justify-between gap-4 ${
          isCritical
            ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            : isWarning
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center gap-3">
            {isCritical ? (
              <ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse shrink-0" />
            ) : (
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
            )}
            <div>
              <div className="text-sm font-bold">
                {isCritical
                  ? (language === 'id' ? 'ZONA D: KONDISI KRITIS - BAHAYA KERUSAKAN BANTALAN' : 'ZONE D: CRITICAL DANGER - BEARING DAMAGE HAZARD')
                  : isWarning
                  ? (language === 'id' ? 'ZONA C: PERINGATAN - MEMERLUKAN INSPEKSI BERKALA' : 'ZONE C: WARNING - INSPECTION RECOMMENDED')
                  : (language === 'id' ? 'ZONA B / A: OPERASI NORMAL & LAIK LAUT' : 'ZONE A/B: NOMINAL SEAWORTHY OPERATION')}
              </div>
              <div className="text-xs opacity-90 font-mono mt-0.5">
                Total RMS: {vib.toFixed(2)} mm/s · Suhu Sensor: {me.thrustBearingTemp.toFixed(1)}°C · Ambang Trip: 7.1 mm/s
              </div>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-2xl font-bold tabular-nums">{vib.toFixed(2)}</span>
            <span className="text-xs ml-1">mm/s</span>
          </div>
        </div>

        {/* FFT Frequency Spectrum Graph */}
        <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-300 font-mono">
              FFT SPECTRUM (0 - 150 Hz)
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-500" /> Zone A/B (&lt;4.5)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-amber-500" /> Zone C (4.5-7.1)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-rose-500" /> Zone D (&gt;7.1)
              </span>
            </div>
          </div>

          {/* Bar Chart Representation of Harmonics */}
          <div className="h-48 flex items-end gap-3 pt-6 pb-2 border-b border-slate-800 relative">
            {/* Zone C line */}
            <div className="absolute top-[35%] left-0 right-0 border-b border-dashed border-amber-500/50 flex justify-end pr-2 pointer-events-none">
              <span className="text-[10px] font-mono text-amber-400 bg-slate-950 px-1">Zone C Limit: 4.5 mm/s</span>
            </div>

            {/* Zone D line */}
            <div className="absolute top-[10%] left-0 right-0 border-b border-dashed border-rose-500/50 flex justify-end pr-2 pointer-events-none">
              <span className="text-[10px] font-mono text-rose-400 bg-slate-950 px-1">Zone D Limit: 7.1 mm/s</span>
            </div>

            {spectrumPoints.map((pt, i) => {
              const maxAmp = 6.0;
              const heightPercent = Math.min(100, (pt.amp / maxAmp) * 100);
              const isPtAlert = pt.amp > 3.0;

              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {pt.amp.toFixed(2)}
                  </div>
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      isPtAlert ? 'bg-rose-500' : pt.amp > 1.5 ? 'bg-amber-400' : 'bg-cyan-500'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <div className="text-[10px] font-mono text-slate-400 mt-2 truncate max-w-[65px] text-center" title={pt.label}>
                    {pt.freq}Hz
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-[11px] font-mono text-slate-400">
            {spectrumPoints.slice(0, 4).map((pt, i) => (
              <div key={i} className="p-2 bg-slate-900 rounded border border-slate-800/60">
                <div className="text-white font-semibold">{pt.label}</div>
                <div className="text-slate-400 text-[10px]">{pt.note}</div>
                <div className="text-cyan-400 font-bold mt-1">{pt.amp.toFixed(2)} mm/s</div>
              </div>
            ))}
          </div>
        </div>

        {/* Condition-Based Maintenance Recommendation */}
        <div className="mt-5 p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="text-xs font-bold text-white mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>{language === 'id' ? 'Rekomendasi Teknisi Mesin (CBM Advisory)' : 'Marine Engineer Advisory'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isCritical
              ? 'Terdeteksi amplitudo tinggi pada frekuensi 1X RPM dan puncak BPFO bantalan poros dorong. Segera turunkan putaran mesin (Slow Ahead), periksa temperatur minyak pelumas dan pelat babbitt bearing, serta jadwalkan inspeksi visual endoskopi pada pelabuhan terdekat.'
              : isWarning
              ? 'Getaran berada di Zona C akibat harmonik blade pass frekuensi propeller dan aliran turbulen. Pertahankan pemantauan berkala tiap jam jaga mesin dan catat deviasi temperatur.'
              : 'Profil getaran poros baling-baling dan turbocharger dalam batas aman ISO 10816 Zone B. Tidak terdeteksi cacat bantalan maupun ketidaksejajaran poros (misalignment). Operasi laut penuh dapat diteruskan.'}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            {language === 'id' ? 'Tutup Panel' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
