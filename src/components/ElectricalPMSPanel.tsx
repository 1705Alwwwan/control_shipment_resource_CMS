import React from 'react';
import { useMarine } from '../context/MarineContext';
import { Zap, BatteryCharging, Gauge, ShieldAlert, Cpu, Power, Activity } from 'lucide-react';

export const ElectricalPMSPanel: React.FC = () => {
  const { activeVessel, language } = useMarine();
  const elec = activeVessel.electrical;
  const gens = activeVessel.generators;

  const loadPercent = Math.round((elec.totalLoadKw / elec.totalCapacityKw) * 100);

  return (
    <div className="space-y-6">
      {/* MSB & Grid Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Electrical Load */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'id' ? 'Beban Main Switchboard (MSB)' : 'MSB Total Grid Load'}</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {elec.totalLoadKw}
            </span>
            <span className="text-xs font-mono text-slate-400">kW</span>
            <span className="text-xs font-mono text-cyan-400">({loadPercent}%)</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
              <span>Kapasitas Online: {elec.totalCapacityKw} kW</span>
              <span>Reserve: {elec.totalCapacityKw - elec.totalLoadKw} kW</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  loadPercent > 85 ? 'bg-rose-500' : loadPercent > 70 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, loadPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Grid Frequency */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'id' ? 'Frekuensi Jaringan Listrik' : 'Grid Frequency'}</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {elec.gridFrequency.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">Hz</span>
            <span className="text-xs font-mono text-slate-500">(Target 60.00 Hz)</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono flex justify-between">
            <span>Bus Tie Breaker:</span>
            <span className="text-emerald-400 font-semibold">CLOSED (Paralel)</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono flex justify-between mt-0.5">
            <span>Toleransi Sinkronisasi:</span>
            <span>±0.2 Hz (Optimal)</span>
          </div>
        </div>

        {/* 24V Emergency Battery Bank */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'id' ? 'Bank Baterai Darurat 24V' : '24V DC Emergency Battery'}</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {elec.batteryBankVoltage.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">V DC</span>
            <span className="text-xs font-mono text-emerald-400">({elec.batteryStateOfCharge}%)</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono flex justify-between">
            <span>Status Pengisi (Charger):</span>
            <span className="text-emerald-400 font-semibold">Float Charge Aktif</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono flex justify-between mt-0.5">
            <span>Otonomi Radio GMDSS:</span>
            <span>&gt; 18 Jam Tanpa Genset</span>
          </div>
        </div>

        {/* Shore Power / Blackout Protection */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'id' ? 'Sistem Proteksi PMS' : 'PMS Automation Mode'}</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              AUTO SHEDDING
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono flex justify-between">
            <span>Sambungan Darat:</span>
            <span className="text-slate-500">Terputus (Di Laut Lepas)</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono flex justify-between mt-0.5">
            <span>Pencegah Blackout:</span>
            <span className="text-emerald-400 font-semibold">Interlock Siap</span>
          </div>
        </div>
      </div>

      {/* Generators Detailed Cards */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">
          {language === 'id' ? 'Status Generator Diesel (Genset) & Pembagian Beban' : 'Diesel Generator Status & Load Sharing'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gens.map(gen => {
            const isRunning = gen.status === 'running';

            return (
              <div
                key={gen.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-white">{gen.name}</span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                        isRunning
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isRunning ? 'RUNNING' : 'STANDBY'}
                    </span>
                  </div>

                  {/* Active Power & Load Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-baseline text-xs font-mono mb-1">
                      <span className="text-slate-400">Daya Aktif:</span>
                      <span className="text-white font-bold tabular-nums">
                        {gen.activePowerKw} / {gen.maxPowerKw} kW
                      </span>
                    </div>

                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isRunning ? 'bg-cyan-500' : 'bg-slate-700'
                        }`}
                        style={{ width: `${gen.loadPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Telemetry Matrix */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500 text-[10px] block">TEGANGAN</span>
                      <span className="text-white font-semibold tabular-nums">{gen.voltage} V AC</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">FREKUENSI</span>
                      <span className="text-white font-semibold tabular-nums">{gen.frequency.toFixed(1)} Hz</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">ARUS (AMPS)</span>
                      <span className="text-cyan-300 font-semibold tabular-nums">{gen.currentAmps} A</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">POWER FACTOR</span>
                      <span className="text-slate-300 font-semibold tabular-nums">{gen.powerFactor.toFixed(2)} (cos φ)</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">KONSUMSI BAHAN BAKAR</span>
                      <span className="text-amber-300 font-semibold tabular-nums">{gen.fuelConsumptionRateLh} L/jam</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">JAM OPERASI</span>
                      <span className="text-slate-400 font-semibold tabular-nums">{gen.runningHours.toLocaleString('id-ID')} jam</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">Auto Governor Status</span>
                  <span className={`font-mono font-medium ${isRunning ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isRunning ? 'Synchronized on Bus A' : 'Ready for Auto-Start'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
