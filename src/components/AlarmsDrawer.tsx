import React, { useState } from 'react';
import { useMarine } from '../context/MarineContext';
import { X, ShieldAlert, AlertTriangle, AlertCircle, Check, CheckCheck, Trash2, Bell } from 'lucide-react';
import { AlarmSeverity } from '../types/marine';

interface AlarmsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlarmsDrawer: React.FC<AlarmsDrawerProps> = ({ isOpen, onClose }) => {
  const { alarms, acknowledgeAlarm, acknowledgeAllAlarms, clearAlarm, language } = useMarine();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredAlarms = filterSeverity === 'ALL'
    ? alarms
    : alarms.filter(a => a.severity === filterSeverity);

  const getSeverityStyle = (severity: AlarmSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          icon: ShieldAlert,
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          indicator: 'bg-rose-500',
          title: 'KRITIS / ALARM',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          indicator: 'bg-amber-500',
          title: 'PERINGATAN / WARNING',
        };
      case 'caution':
        return {
          icon: AlertCircle,
          badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          indicator: 'bg-sky-500',
          title: 'PERHATIAN / CAUTION',
        };
      default:
        return {
          icon: Bell,
          badge: 'bg-slate-700 text-slate-300 border-slate-600',
          indicator: 'bg-slate-400',
          title: 'NOMINAL',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {language === 'id' ? 'Sistem Manajemen Alarm Kamar Mesin (IMO MSC.302)' : 'Marine Machinery Alert Management (IMO MSC.302)'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {alarms.length} Total Alarm Tercatat · {alarms.filter(a => !a.acknowledged).length} Belum Diakui (Unacknowledged)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={acknowledgeAllAlarms}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{language === 'id' ? 'Akui Semua' : 'Ack All'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Severity Filter Tabs */}
        <div className="py-3 flex items-center justify-between gap-4 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg text-xs font-medium border border-slate-800">
            {['ALL', 'critical', 'warning', 'caution'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded capitalize transition-colors ${
                  filterSeverity === sev
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev === 'ALL' ? 'Semua' : sev}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Standar BKI / SOLAS Bab II-1
          </div>
        </div>

        {/* Alarm List Table */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {filteredAlarms.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-mono text-xs">
              Tidak ada alarm aktif pada kriteria ini. Seluruh sistem beroperasi dalam batas nominal.
            </div>
          ) : (
            filteredAlarms.map(alarm => {
              const style = getSeverityStyle(alarm.severity);
              const Icon = style.icon;

              return (
                <div
                  key={alarm.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    !alarm.acknowledged
                      ? 'bg-slate-950 border-rose-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 opacity-90'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${style.indicator} ${
                        !alarm.acknowledged ? 'animate-ping' : ''
                      }`} />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${style.badge}`}>
                            {style.title}
                          </span>
                          <span className="font-mono text-xs font-bold text-white">
                            {alarm.tag}
                          </span>
                          <span className="text-slate-500 text-xs">·</span>
                          <span className="text-xs text-slate-300 font-semibold">
                            {alarm.source}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 mt-1 leading-snug">
                          {alarm.description}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-slate-400">
                          <span>Waktu: <span className="text-slate-200">{alarm.timestamp}</span></span>
                          <span>
                            Nilai Aktual: <span className="text-rose-400 font-bold">{alarm.value} {alarm.unit}</span>
                          </span>
                          <span>
                            Ambang Batas: <span className="text-slate-300">{alarm.threshold} {alarm.unit}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!alarm.acknowledged ? (
                        <button
                          onClick={() => acknowledgeAlarm(alarm.id)}
                          className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-mono text-xs font-semibold rounded transition-colors shadow-sm"
                        >
                          AKUI ALARM (ACK)
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1">
                          <Check className="w-3 h-3" /> SUDAH DIAKUI
                        </span>
                      )}

                      <button
                        onClick={() => clearAlarm(alarm.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                        title="Hapus log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Alarm Buzzer Terkoneksi ke Bridge & Chief Engineer Cabin</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
