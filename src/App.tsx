import React, { useState } from 'react';
import { MarineProvider, useMarine } from './context/MarineContext';
import { Header } from './components/Header';
import { VesselSchematic } from './components/VesselSchematic';
import { MainEnginePanel } from './components/MainEnginePanel';
import { TankResourcesPanel } from './components/TankResourcesPanel';
import { ElectricalPMSPanel } from './components/ElectricalPMSPanel';
import { SimulationControls } from './components/SimulationControls';
import { VibrationModal } from './components/VibrationModal';
import { NoonReportModal } from './components/NoonReportModal';
import { AlarmsDrawer } from './components/AlarmsDrawer';
import { Ship, ChevronRight, Activity, Gauge, Flame, Droplets, Zap, ShieldCheck } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const {
    vessels,
    activeVessel,
    selectedVesselId,
    setSelectedVesselId,
    activeAlarmCount,
    language,
  } = useMarine();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isVibModalOpen, setIsVibModalOpen] = useState<boolean>(false);
  const [isNoonModalOpen, setIsNoonModalOpen] = useState<boolean>(false);
  const [isAlarmsDrawerOpen, setIsAlarmsDrawerOpen] = useState<boolean>(false);

  const me = activeVessel.mainEngine;
  const res = activeVessel.resources;
  const elec = activeVessel.electrical;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar adhering to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNoonReport={() => setIsNoonModalOpen(true)}
        onOpenAlarms={() => setIsAlarmsDrawerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 lg:p-6 space-y-6">
        {/* Vessel Selector & Navigation Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-1 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">
              {language === 'id' ? 'Kapal Terpantau:' : 'Active Fleet Vessel:'}
            </span>
            <div className="flex items-center gap-2">
              {vessels.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVesselId(v.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    v.id === selectedVesselId
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Ship className="w-3.5 h-3.5" />
                  <span>{v.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({v.vesselType.split(' ')[0]})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span>Standar: BKI / SOLAS Reg. II-1</span>
            <span>·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Telemetri Aktif
            </span>
          </div>
        </div>

        {/* TAB 1: OVERVIEW (IKHTISAR KAPAL & DIAGRAM POTONGAN VISUAL) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Interactive SVG Cross-Section Schematic */}
            <VesselSchematic
              onSelectComponent={key => {
                if (key === 'thrust_bearing') {
                  setIsVibModalOpen(true);
                } else if (key === 'main_engine') {
                  setActiveTab('machinery');
                } else if (key === 'hfo_tanks' || key === 'fw_tank' || key === 'ballast_fp') {
                  setActiveTab('tanks');
                }
              }}
            />

            {/* Quick KPI Strip below vessel schematic */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <div
                onClick={() => setActiveTab('machinery')}
                className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-3.5 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Mesin Utama</span>
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  {me.rpm.toFixed(1)} <span className="text-xs text-slate-400 font-normal">RPM</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  {me.loadPercent.toFixed(0)}% Load · {me.powerKw} kW
                </div>
              </div>

              <div
                onClick={() => setActiveTab('tanks')}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-3.5 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Bahan Bakar HFO</span>
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-bold font-mono text-amber-300 tabular-nums">
                  {res.totalFuelTonnes.toFixed(1)} <span className="text-xs text-slate-400 font-normal">MT</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  {res.daysFuelRemaining.toFixed(1)} Hari Otonomi
                </div>
              </div>

              <div
                onClick={() => setActiveTab('tanks')}
                className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 p-3.5 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Air Tawar (FW)</span>
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="text-xl font-bold font-mono text-sky-300 tabular-nums">
                  {res.totalFreshWaterM3} <span className="text-xs text-slate-400 font-normal">m³</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  RO +{res.freshWaterProductionM3Day} m³/hari
                </div>
              </div>

              <div
                onClick={() => setActiveTab('electrical')}
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-3.5 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Beban Listrik MSB</span>
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  {elec.totalLoadKw} <span className="text-xs text-slate-400 font-normal">kW</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  {elec.gridFrequency.toFixed(2)} Hz · 440V
                </div>
              </div>

              <div
                onClick={() => setIsVibModalOpen(true)}
                className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 p-3.5 rounded-xl cursor-pointer transition-colors col-span-2 lg:col-span-1"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Getaran ISO 10816</span>
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  {me.thrustBearingVibration.toFixed(2)} <span className="text-xs text-slate-400 font-normal">mm/s</span>
                </div>
                <div className="text-[11px] font-mono mt-1 text-cyan-400">
                  Thrust Bearing · Klik FFT
                </div>
              </div>
            </div>

            {/* Bridge Engine Telegraph & Fault Injection Simulator */}
            <SimulationControls />
          </div>
        )}

        {/* TAB 2: MACHINERY & PROPULSION */}
        {activeTab === 'machinery' && (
          <div className="space-y-6">
            <MainEnginePanel onOpenVibrationModal={() => setIsVibModalOpen(true)} />
            <SimulationControls />
          </div>
        )}

        {/* TAB 3: TANKS & RESOURCES */}
        {activeTab === 'tanks' && (
          <div className="space-y-6">
            <TankResourcesPanel />
          </div>
        )}

        {/* TAB 4: ELECTRICAL & PMS */}
        {activeTab === 'electrical' && (
          <div className="space-y-6">
            <ElectricalPMSPanel />
          </div>
        )}

        {/* TAB 5: ALARMS & DRILLS */}
        {activeTab === 'alarms' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white">
                  {language === 'id' ? 'Sistem Alarm & Latihan Darurat Permesinan' : 'Machinery Alarms & Emergency Drills'}
                </h2>
                <p className="text-xs text-slate-400">
                  Manajemen status alarm dan pengujian simulasi anomali sistem secara interaktif.
                </p>
              </div>
              <button
                onClick={() => setIsAlarmsDrawerOpen(true)}
                className="px-3.5 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold hover:bg-rose-500/30 transition-colors"
              >
                Buka Layar Penuh Alarm ({activeAlarmCount})
              </button>
            </div>

            <SimulationControls />
            <TankResourcesPanel />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-4 px-6 text-xs text-slate-500 font-mono">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">MARINETEK CMS v4.2</span>
            <span>—</span>
            <span>BKI Class Certified Condition Monitoring System</span>
          </div>
          <div>
            Data telemetri diperbarui secara real-time · Standar ISO 13374 & ISO 10816-6
          </div>
        </div>
      </footer>

      {/* Vibration FFT Modal */}
      <VibrationModal
        isOpen={isVibModalOpen}
        onClose={() => setIsVibModalOpen(false)}
      />

      {/* Daily Marine Noon Report Modal */}
      <NoonReportModal
        isOpen={isNoonModalOpen}
        onClose={() => setIsNoonModalOpen(false)}
      />

      {/* Alarms Drawer */}
      <AlarmsDrawer
        isOpen={isAlarmsDrawerOpen}
        onClose={() => setIsAlarmsDrawerOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <MarineProvider>
      <DashboardContent />
    </MarineProvider>
  );
}
