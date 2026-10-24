import React, { useState } from 'react';
import { useMarine } from '../context/MarineContext';
import { X, FileSpreadsheet, Download, Check, Printer, Ship } from 'lucide-react';

interface NoonReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoonReportModal: React.FC<NoonReportModalProps> = ({ isOpen, onClose }) => {
  const { activeVessel, language } = useMarine();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const me = activeVessel.mainEngine;
  const nav = activeVessel.navigation;
  const res = activeVessel.resources;

  const reportDate = new Date().toISOString().slice(0, 10);
  const nowTime = '12:00 LT (Noon)';

  const downloadCsv = () => {
    const csvContent = [
      'MARINETEK VESSEL CMS - DAILY NOON REPORT (LAPORAN NOON RESMI)',
      `Vessel Name,${activeVessel.name}`,
      `IMO Number,${activeVessel.imoNumber}`,
      `Call Sign,${activeVessel.callSign}`,
      `Report Date,${reportDate} ${nowTime}`,
      `Position,${nav.latitude.toFixed(4)} S / ${nav.longitude.toFixed(4)} E`,
      `Destination,${nav.destinationPort}`,
      `ETA,${nav.eta}`,
      '',
      'VOYAGE & PROPULSION PERFORMANCE',
      `Steaming Time,24.0 Hours`,
      `Distance Run (24h),${(nav.speedOverGroundKnots * 24).toFixed(1)} NM`,
      `Average SOG,${nav.speedOverGroundKnots.toFixed(1)} Knots`,
      `Engine Avg RPM,${me.rpm.toFixed(1)} RPM`,
      `Engine Power,${me.powerKw} kW (${Math.round(me.powerKw * 1.341)} BHP)`,
      `Propeller Slip,3.8%`,
      `Wind / Sea,Force ${nav.seaStateBeaufort} / ${nav.windSpeedKnots.toFixed(1)} kn`,
      '',
      'BUNKER & RESOURCE LOG (TONNES / M3)',
      `HFO Consumption (24h),${res.fuelConsumptionRateTonsDay.toFixed(1)} MT`,
      `HFO Remaining Onboard (ROB),${res.totalFuelTonnes.toFixed(1)} MT`,
      `Days Fuel Autonomy,${res.daysFuelRemaining.toFixed(1)} Days`,
      `Fresh Water Produced (24h),${res.freshWaterProductionM3Day} m3`,
      `Fresh Water Consumed (24h),${res.dailyFreshWaterConsumptionM3} m3`,
      `Fresh Water ROB,${res.totalFreshWaterM3} m3`,
      `Lube Oil Consumed,140 Litres`,
      `Sludge Generated,0.6 m3`,
      `Bilge Overboard OWS PPM,${res.owsOverboardPpm.toFixed(1)} PPM (MARPOL Compliant)`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Noon_Report_${activeVessel.name.replace(/\s+/g, '_')}_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {language === 'id' ? 'Laporan Tengah Hari Kapal (Noon Report)' : 'Official Vessel Noon Report'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {activeVessel.name} · {reportDate} 12:00 LT · Posisi {nav.latitude}°S, {nav.longitude}°E
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

        {/* Official Marine Document View */}
        <div className="mt-5 p-5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-4">
          {/* Header Row */}
          <div className="flex justify-between border-b border-slate-800 pb-3 text-[11px]">
            <div>
              <div className="text-white font-bold text-sm">{activeVessel.name}</div>
              <div className="text-slate-400">{activeVessel.callSign} · {activeVessel.imoNumber} · Bendera {activeVessel.flag}</div>
            </div>
            <div className="text-right">
              <div className="text-cyan-400 font-bold">STATUS: ON VOYAGE</div>
              <div className="text-slate-400">Rute: {nav.destinationPort}</div>
            </div>
          </div>

          {/* Section 1: Navigation & Distance */}
          <div>
            <div className="text-white font-bold uppercase tracking-wider text-[11px] text-cyan-300 mb-2">
              1. Navigasi & Kinerja Propulsi (24 Jam Terakhir)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] block">JARAK TEMPUH</span>
                <span className="text-white font-bold">{(nav.speedOverGroundKnots * 24).toFixed(1)} NM</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">KECEPATAN RATA-RATA</span>
                <span className="text-white font-bold">{nav.speedOverGroundKnots.toFixed(1)} Knots</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">PUTARAN MESIN (ME)</span>
                <span className="text-white font-bold">{me.rpm.toFixed(1)} RPM</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">DAYA POROS</span>
                <span className="text-white font-bold">{me.powerKw} kW</span>
              </div>
            </div>
          </div>

          {/* Section 2: Fuel Bunker & Consumables */}
          <div>
            <div className="text-white font-bold uppercase tracking-wider text-[11px] text-amber-400 mb-2">
              2. Pemakaian Sumber Daya & Cadangan Bahan Bakar (ROB)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] block">KONSUMSI HFO (24H)</span>
                <span className="text-amber-300 font-bold">{res.fuelConsumptionRateTonsDay.toFixed(1)} MT</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">SISA HFO (ROB)</span>
                <span className="text-white font-bold">{res.totalFuelTonnes.toFixed(1)} MT</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">OTONOMI BAHAN BAKAR</span>
                <span className="text-white font-bold">{res.daysFuelRemaining.toFixed(1)} Hari</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">JARAK JELAJAH AMAN</span>
                <span className="text-white font-bold">{res.steamingRangeNm} NM</span>
              </div>
            </div>
          </div>

          {/* Section 3: Water, Lube & Environment */}
          <div>
            <div className="text-white font-bold uppercase tracking-wider text-[11px] text-sky-400 mb-2">
              3. Air Tawar & Kepatuhan Lingkungan (MARPOL)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] block">PRODUKSI FW (RO)</span>
                <span className="text-emerald-400 font-bold">+{res.freshWaterProductionM3Day} m³/hari</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">KONSUMSI FW (24H)</span>
                <span className="text-white font-bold">{res.dailyFreshWaterConsumptionM3} m³/hari</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">CADANGAN AIR (ROB)</span>
                <span className="text-sky-300 font-bold">{res.totalFreshWaterM3} m³</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">BUANGAN OWS (PPM)</span>
                <span className="text-emerald-400 font-bold">{res.owsOverboardPpm.toFixed(1)} PPM (&lt;15)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-mono">
            Disahkan oleh Kepala Kamar Mesin (KKM) & Nakhoda
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadCsv}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Download className="w-4 h-4" />}
              <span>{copied ? 'Telah Diunduh!' : 'Unduh CSV'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
