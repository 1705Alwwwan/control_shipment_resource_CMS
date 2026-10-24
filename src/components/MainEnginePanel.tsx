import React from 'react';
import { useMarine } from '../context/MarineContext';
import { Activity, Thermometer, Gauge, Zap, Wind, AlertTriangle, ShieldCheck, BarChart2 } from 'lucide-react';

interface MainEnginePanelProps {
  onOpenVibrationModal: () => void;
}

export const MainEnginePanel: React.FC<MainEnginePanelProps> = ({ onOpenVibrationModal }) => {
  const { activeVessel, language } = useMarine();
  const me = activeVessel.mainEngine;

  // Calculate average exhaust gas temp
  const avgExhaustTemp =
    me.cylinders.reduce((acc, c) => acc + c.exhaustTemp, 0) / me.cylinders.length;

  // Vibration ISO zone helper (ISO 10816-6 for Marine Propulsion > 300kW)
  // Zone A: < 2.8 mm/s (Newly commissioned)
  // Zone B: 2.8 - 4.5 mm/s (Acceptable for unrestricted long-term operation)
  // Zone C: 4.5 - 7.1 mm/s (Unsatisfactory, warning)
  // Zone D: > 7.1 mm/s (Unacceptable, trip/damage hazard)
  const getIsoZone = (v: number) => {
    if (v < 2.8) return { zone: 'Zone A', label: 'Prima / Baru', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (v <= 4.5) return { zone: 'Zone B', label: 'Normal / Laik Laut', color: 'text-emerald-300', bg: 'bg-emerald-500/10' };
    if (v <= 7.1) return { zone: 'Zone C', label: 'Peringatan / Alert', color: 'text-amber-400', bg: 'bg-amber-500/15' };
    return { zone: 'Zone D', label: 'Bahaya Kritis', color: 'text-rose-400', bg: 'bg-rose-500/20' };
  };

  const isoThrust = getIsoZone(me.thrustBearingVibration);
  const isoTc = getIsoZone(me.turbochargerVibration);

  return (
    <div className="space-y-6">
      {/* Top Engine Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* RPM & Telegraph */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'id' ? 'Putaran Mesin Utama' : 'Main Engine Speed'}</span>
            <span className="font-mono text-cyan-400 font-semibold">{me.telegraph}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {me.rpm.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">RPM</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
              <span>{me.loadPercent.toFixed(1)}% {language === 'id' ? 'Beban' : 'Load'}</span>
              <span>Max: {me.maxRpm} RPM</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  me.loadPercent > 90 ? 'bg-rose-500' : me.loadPercent > 80 ? 'bg-amber-400' : 'bg-cyan-500'
                }`}
                style={{ width: `${Math.min(100, (me.rpm / me.maxRpm) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Shaft Power & Torque */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'id' ? 'Daya Poros (Shaft Power)' : 'Shaft Power'}</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {me.powerKw.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-mono text-slate-400">kW</span>
            <span className="text-xs text-slate-500 font-mono">
              ({Math.round(me.powerKw * 1.341)} BHP)
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex justify-between font-mono">
            <span>Torsi Poros:</span>
            <span className="text-slate-200 font-semibold">{me.torqueKnm.toFixed(1)} kNm</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono flex justify-between mt-0.5">
            <span>Jam Operasi:</span>
            <span>{me.runningHours.toLocaleString('id-ID')} Jam</span>
          </div>
        </div>

        {/* Lube Oil Pressure & Temp */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'id' ? 'Minyak Pelumas (Lube Oil)' : 'Lube Oil System'}</span>
            <Gauge className={`w-4 h-4 ${me.lubeOilPressure < 3.2 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold font-mono tabular-nums ${
                me.lubeOilPressure < 3.2 ? 'text-rose-400' : 'text-white'
              }`}
            >
              {me.lubeOilPressure.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">Bar</span>
            <span className="text-[11px] text-slate-500 font-mono">(Nom: 4.2)</span>
          </div>
          <div className="mt-3 flex justify-between text-xs font-mono text-slate-400">
            <span>Suhu Masuk / Keluar:</span>
            <span className="text-slate-200 font-semibold">{me.lubeOilTempIn}° / {me.lubeOilTempOut}°C</span>
          </div>
          <div className="text-[11px] font-mono mt-0.5 flex justify-between">
            <span className="text-slate-500">Status Pompa LO:</span>
            <span className="text-emerald-400 font-medium">Duty #1 Running</span>
          </div>
        </div>

        {/* Scavenge & Turbocharger */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'id' ? 'Udara Bilas & Turbocharger' : 'Scavenge Air & TC'}</span>
            <Wind className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {me.scavengeAirPressure.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">Bar</span>
            <span className="text-xs text-slate-400 font-mono">({me.scavengeAirTemp}°C)</span>
          </div>
          <div className="mt-3 flex justify-between text-xs font-mono text-slate-400">
            <span>Putaran TC:</span>
            <span className="text-slate-200 font-semibold">{me.turbochargerRpm.toLocaleString('id-ID')} RPM</span>
          </div>
          <div className="text-[11px] font-mono mt-0.5 flex justify-between">
            <span>Air Cooler ΔP:</span>
            <span className="text-emerald-400 font-medium">0.08 Bar (Bersih)</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Exhaust Gas Multi-Cylinder Bar Chart & ISO Vibration Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exhaust Gas Temperatures by Cylinder (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-amber-400" />
                <span>{language === 'id' ? 'Temperatur Gas Buang per Silinder' : 'Exhaust Gas Cylinder Balance'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rata-rata: <span className="font-mono text-white font-semibold">{avgExhaustTemp.toFixed(1)}°C</span> · Ambang Deviasi IACS: ±35°C
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              Model: {me.model}
            </div>
          </div>

          {/* Cylinder Bar Graph */}
          <div className="grid grid-cols-6 gap-3 pt-4 pb-2">
            {me.cylinders.map(cyl => {
              const diffFromAvg = cyl.exhaustTemp - avgExhaustTemp;
              const isOverheated = cyl.exhaustTemp > 415 || Math.abs(diffFromAvg) > 35;
              const barHeightPercent = Math.min(100, Math.max(10, ((cyl.exhaustTemp - 300) / 150) * 100));

              return (
                <div key={cyl.cylinderNumber} className="flex flex-col items-center">
                  <div className="text-[11px] font-mono font-bold text-slate-300 mb-1">
                    Cyl #{cyl.cylinderNumber}
                  </div>

                  {/* Vertical Bar Container */}
                  <div className="w-full h-44 bg-slate-950 rounded-lg border border-slate-800/80 p-1 flex flex-col justify-end relative">
                    {/* Dev line marker */}
                    <div className="absolute top-[35%] left-0 right-0 border-b border-dashed border-slate-700/60 pointer-events-none" />

                    <div
                      className={`w-full rounded transition-all duration-300 ${
                        isOverheated
                          ? 'bg-gradient-to-t from-rose-700 to-rose-500 animate-pulse'
                          : 'bg-gradient-to-t from-cyan-600 to-amber-400'
                      }`}
                      style={{ height: `${barHeightPercent}%` }}
                    />
                  </div>

                  {/* Temperature readout */}
                  <div className="mt-2 text-center">
                    <span
                      className={`font-mono text-xs font-bold tabular-nums block ${
                        isOverheated ? 'text-rose-400 font-bold' : 'text-white'
                      }`}
                    >
                      {cyl.exhaustTemp}°C
                    </span>
                    <span
                      className={`text-[10px] font-mono block ${
                        diffFromAvg > 0 ? (isOverheated ? 'text-rose-400' : 'text-amber-400') : 'text-cyan-400'
                      }`}
                    >
                      {diffFromAvg >= 0 ? `+${diffFromAvg.toFixed(0)}` : diffFromAvg.toFixed(0)}°C
                    </span>
                  </div>

                  {/* Peak & Comp pressure footer */}
                  <div className="mt-2 text-[10px] font-mono text-slate-500 text-center leading-tight">
                    <div>Pmax: {cyl.pMax} bar</div>
                    <div>Pcomp: {cyl.pComp} bar</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-cyan-600 to-amber-400" />
                Nominal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                Deviasi Berlebih / Bahaya
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              Suhu Air Pendingin Keluar: 83.2°C – 85.0°C (Normal)
            </div>
          </div>
        </div>

        {/* ISO 10816 Vibration & CBM Diagnostics Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  {language === 'id' ? 'Pemantauan Getaran ISO' : 'ISO Vibration Telemetry'}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                ISO 10816-6
              </span>
            </div>

            {/* Thrust Bearing Telemetry */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">
                  {language === 'id' ? 'Bantalan Poros Dorong (Thrust)' : 'Thrust Bearing Vibration'}
                </span>
                <span className={`text-[11px] font-mono font-bold ${isoThrust.color}`}>
                  {isoThrust.zone} ({isoThrust.label})
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl font-bold font-mono tabular-nums ${isoThrust.color}`}>
                    {me.thrustBearingVibration.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-slate-400">mm/s RMS</span>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-slate-400 text-[10px] block">SUHU BANTALAN</span>
                  <span className={`font-bold ${me.thrustBearingTemp > 80 ? 'text-rose-400' : 'text-white'}`}>
                    {me.thrustBearingTemp.toFixed(1)}°C
                  </span>
                </div>
              </div>
            </div>

            {/* Turbocharger Vibration */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Turbocharger Rotor</span>
                <span className={`text-[11px] font-mono font-bold ${isoTc.color}`}>
                  {isoTc.zone}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl font-bold font-mono tabular-nums ${isoTc.color}`}>
                    {me.turbochargerVibration.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-slate-400">mm/s RMS</span>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-slate-400 text-[10px] block">BATAS ISO ZONE C</span>
                  <span className="text-slate-300 font-semibold">4.5 mm/s</span>
                </div>
              </div>
            </div>

            {/* Flywheel & Crankshaft */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Roda Gila (Flywheel)</span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Zone A (Prima)</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-white tabular-nums">
                  {me.flywheelVibration.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-slate-400">mm/s RMS</span>
              </div>
            </div>
          </div>

          {/* Action button: open modal */}
          <button
            onClick={onOpenVibrationModal}
            className="mt-4 w-full py-2.5 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
            <span>{language === 'id' ? 'Buka Spektrum Harmonik & FFT' : 'Open FFT Harmonic Spectrum'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
