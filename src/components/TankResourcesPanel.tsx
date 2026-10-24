import React, { useState } from 'react';
import { useMarine } from '../context/MarineContext';
import { Droplets, Flame, Shield, ArrowRightLeft, Anchor, AlertTriangle, CheckCircle2, Waves, RefreshCw } from 'lucide-react';

export const TankResourcesPanel: React.FC = () => {
  const { activeVessel, toggleTransferPump, language } = useMarine();
  const [filterType, setFilterType] = useState<string>('ALL');

  const tanks = activeVessel.tanks;
  const res = activeVessel.resources;
  const nav = activeVessel.navigation;

  const filteredTanks = filterType === 'ALL'
    ? tanks
    : tanks.filter(t => t.type === filterType);

  const getTankColor = (type: string) => {
    switch (type) {
      case 'HFO': return { bar: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      case 'MGO': return { bar: 'bg-yellow-400', text: 'text-yellow-300', badge: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' };
      case 'FW': return { bar: 'bg-sky-500', text: 'text-sky-400', badge: 'bg-sky-500/10 text-sky-300 border-sky-500/30' };
      case 'BALLAST': return { bar: 'bg-cyan-500', text: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' };
      case 'BILGE': return { bar: 'bg-slate-400', text: 'text-slate-300', badge: 'bg-slate-500/10 text-slate-300 border-slate-500/30' };
      case 'SLUDGE': return { bar: 'bg-stone-500', text: 'text-stone-300', badge: 'bg-stone-500/10 text-stone-300 border-stone-500/30' };
      default: return { bar: 'bg-cyan-500', text: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Resource KPI Overview Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Fuel & Steaming Autonomy */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'id' ? 'Total Cadangan Bahan Bakar' : 'Total Fuel Oil Onboard'}</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {res.totalFuelTonnes.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">MT</span>
            <span className="text-xs font-mono text-amber-400">
              ({res.daysFuelRemaining.toFixed(1)} {language === 'id' ? 'Hari' : 'Days'})
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono flex justify-between">
            <span>Laju Konsumsi:</span>
            <span className="text-white font-semibold">{res.fuelConsumptionRateTonsDay.toFixed(1)} MT/hari</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono flex justify-between mt-0.5">
            <span>Jarak Jelajah Aman:</span>
            <span>{res.steamingRangeNm.toLocaleString('id-ID')} Mil Laut (NM)</span>
          </div>
        </div>

        {/* Fresh Water Resources & RO Maker */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'id' ? 'Cadangan Air Tawar (FW)' : 'Fresh Water Reserve'}</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {res.totalFreshWaterM3}
            </span>
            <span className="text-xs font-mono text-slate-400">m³</span>
            <span className="text-xs font-mono text-sky-400">
              ({res.daysWaterRemaining.toFixed(1)} {language === 'id' ? 'Hari' : 'Days'})
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono flex justify-between">
            <span>Produksi RO Plant:</span>
            <span className="text-emerald-400 font-semibold">+{res.freshWaterProductionM3Day} m³/hari</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono flex justify-between mt-0.5">
            <span>Konsumsi Harian Kru:</span>
            <span>{res.dailyFreshWaterConsumptionM3} m³/hari</span>
          </div>
        </div>

        {/* Vessel Trim & Stability */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'id' ? 'Trim & Stabilitas Kapal' : 'Trim & Vessel Stability'}</span>
            <Anchor className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              +{nav.trimMeters.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">m (Stern)</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono flex justify-between">
            <span>Kemiringan (Heel):</span>
            <span className="text-white font-semibold">{nav.heelDeg}° Kanan (Stbd)</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono flex justify-between mt-0.5">
            <span>Sarat Depan / Belakang:</span>
            <span>8.4m / 9.05m</span>
          </div>
        </div>

        {/* Environmental MARPOL Compliance (OWS & Bilge) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{language === 'id' ? 'Kepatuhan MARPOL (OWS)' : 'MARPOL OWS Monitor'}</span>
            <Shield className={`w-4 h-4 ${res.owsOverboardPpm > 15 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold font-mono tabular-nums ${
                res.owsOverboardPpm > 15 ? 'text-rose-400 font-bold' : 'text-emerald-400'
              }`}
            >
              {res.owsOverboardPpm.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">PPM</span>
            <span className="text-[11px] text-slate-500 font-mono">(Max 15 PPM)</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono flex justify-between">
            <span>Level Got ER (Bilge):</span>
            <span className={`font-semibold ${res.bilgeLevelMm > 800 ? 'text-rose-400' : 'text-slate-200'}`}>
              {res.bilgeLevelMm} mm
            </span>
          </div>
          <div className="text-[11px] font-mono mt-0.5 flex justify-between">
            <span>Katup Buang Laut:</span>
            <span className={res.owsOverboardPpm > 15 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {res.owsOverboardPpm > 15 ? 'Tertutup (Interlock)' : 'Siap Beroperasi'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs for Tank View */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
          {[
            { id: 'ALL', label: language === 'id' ? 'Semua Tangki' : 'All Tanks' },
            { id: 'HFO', label: 'HFO (Bunker)' },
            { id: 'MGO', label: 'MGO (Gas Oil)' },
            { id: 'FW', label: language === 'id' ? 'Air Tawar' : 'Fresh Water' },
            { id: 'BALLAST', label: language === 'id' ? 'Air Balas' : 'Ballast' },
            { id: 'BILGE', label: 'Bilge & Sludge' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filterType === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {filteredTanks.length} {language === 'id' ? 'Tangki Terdaftar' : 'Tanks Monitored'}
        </div>
      </div>

      {/* Tank Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTanks.map(tank => {
          const colors = getTankColor(tank.type);
          const isHigh = tank.currentPercent > 90;
          const isLow = tank.currentPercent < 15;

          return (
            <div
              key={tank.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">{tank.name}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">{tank.location}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${colors.badge}`}>
                    {tank.type}
                  </span>
                </div>

                {/* Level Progress Bar & Sounding */}
                <div className="space-y-1.5 my-3">
                  <div className="flex items-baseline justify-between text-xs font-mono">
                    <span className="text-slate-400">{language === 'id' ? 'Persentase Isi' : 'Fill Level'}:</span>
                    <span className={`font-bold tabular-nums ${colors.text}`}>
                      {tank.currentPercent.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                      style={{ width: `${Math.min(100, tank.currentPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Tank Spec Matrix */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 text-[10px] block">VOLUME AKTUAL</span>
                    <span className="text-white font-semibold tabular-nums">
                      {tank.currentM3.toFixed(1)} / {tank.capacityM3} m³
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block">SOUNDING / DUGA</span>
                    <span className="text-slate-300 font-semibold tabular-nums">
                      {tank.soundingCm} / {tank.maxSoundingCm} cm
                    </span>
                  </div>

                  {tank.temperatureC !== undefined && (
                    <div>
                      <span className="text-slate-500 text-[10px] block">SUHU TANGKI</span>
                      <span className="text-amber-300 font-semibold tabular-nums">
                        {tank.temperatureC}°C
                      </span>
                    </div>
                  )}

                  {tank.density !== undefined && (
                    <div>
                      <span className="text-slate-500 text-[10px] block">MASSA JENIS</span>
                      <span className="text-slate-300 font-semibold tabular-nums">
                        {tank.density} kg/m³
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transfer Pump Action if applicable */}
              {tank.transferPumpActive !== undefined && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                    Pompa Transfer:
                  </span>
                  <button
                    onClick={() => toggleTransferPump(tank.id)}
                    className={`px-2.5 py-1 text-xs font-mono font-medium rounded border transition-colors ${
                      tank.transferPumpActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {tank.transferPumpActive ? 'BERJALAN (ON)' : 'MATI (STANDBY)'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
