import React, { useState } from 'react';
import { useMarine } from '../context/MarineContext';
import { Gauge, Flame, Droplets, Zap, Activity, AlertCircle, Compass, Wind, Anchor } from 'lucide-react';

interface VesselSchematicProps {
  onSelectComponent?: (componentName: string) => void;
}

export const VesselSchematic: React.FC<VesselSchematicProps> = ({ onSelectComponent }) => {
  const { activeVessel, language } = useMarine();
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>('main_engine');

  const me = activeVessel.mainEngine;
  const nav = activeVessel.navigation;
  const tanks = activeVessel.tanks;

  const hfoTank = tanks.find(t => t.id === 'tk-hfo-1p') || tanks[0];
  const fwTank = tanks.find(t => t.id === 'tk-fw-dom') || tanks[4];
  const ballastFp = tanks.find(t => t.id === 'tk-ballast-fp') || tanks[6];
  const bilgeTk = tanks.find(t => t.id === 'tk-bilge-well') || tanks[8];

  const handleHotspotClick = (key: string) => {
    setSelectedHotspot(key);
    if (onSelectComponent) {
      onSelectComponent(key);
    }
  };

  // Rotation animation duration based on RPM (min 0.4s at 100rpm to stopped)
  const isEngineRunning = me.status === 'running' && me.rpm > 5;
  const propAnimDuration = isEngineRunning ? Math.max(0.2, (60 / me.rpm) * 0.5) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Vessel Sub-Header with Route, SOG, Trim & Sea Conditions */}
      <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{activeVessel.name}</span>
            <span className="text-slate-400 font-mono text-[11px]">{activeVessel.imoNumber}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">{activeVessel.vesselType}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-300 font-mono text-[11px] overflow-x-auto py-0.5">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">{language === 'id' ? 'Haluan' : 'HDG'}:</span>
            <span className="text-white font-semibold tabular-nums">{nav.headingDeg.toFixed(1)}°</span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">SOG:</span>
            <span className="text-cyan-300 font-semibold tabular-nums">{nav.speedOverGroundKnots.toFixed(1)} kn</span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Anchor className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">{language === 'id' ? 'Sarat Air (Draft)' : 'Draft'}:</span>
            <span className="text-white font-semibold tabular-nums">{activeVessel.draughtMeters.toFixed(1)} m</span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">{language === 'id' ? 'Angin' : 'Wind'}:</span>
            <span className="text-white font-semibold tabular-nums">{nav.windSpeedKnots.toFixed(1)} kn</span>
            <span className="text-slate-500 font-sans">({nav.windDirectionDeg}°)</span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap text-slate-400">
            <span>{language === 'id' ? 'Tujuan' : 'Dest'}:</span>
            <span className="text-white truncate max-w-[180px]">{nav.destinationPort}</span>
          </div>
        </div>
      </div>

      {/* Interactive Architectural Cross-Section Schematic SVG */}
      <div className="relative p-4 lg:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-x-auto">
        <div className="min-w-[920px] max-w-[1400px] mx-auto select-none">
          <svg
            viewBox="0 0 1100 340"
            className="w-full h-auto drop-shadow-md"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Sea Water Gradient */}
              <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.05" />
              </linearGradient>

              {/* Hull Metallic Gradient */}
              <linearGradient id="hullGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="60%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#090d16" />
              </linearGradient>

              {/* Deck Superstructure Gradient */}
              <linearGradient id="superGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>

              {/* Fuel Level Gradient */}
              <linearGradient id="fuelFill" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#b45309" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
              </linearGradient>

              {/* Water Level Gradient */}
              <linearGradient id="waterFill" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
              </linearGradient>

              {/* Bilge Level Gradient */}
              <linearGradient id="bilgeFill" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#475569" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#64748b" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* Sea Water Base Line & Depth */}
            <rect x="0" y="240" width="1100" height="90" fill="url(#seaGrad)" />
            <line x1="0" y1="240" x2="1100" y2="240" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="6 3" strokeOpacity="0.7" />
            <text x="10" y="255" fill="#38bdf8" fontSize="10" fontFamily="monospace" opacity="0.8">
              WATERLINE (DRAFT {activeVessel.draughtMeters}m)
            </text>

            {/* --- MAIN SHIP HULL PROFILE --- */}
            {/* Stern overhang, keel, bulbous bow */}
            <path
              d="
                M 120,120
                L 240,120
                L 920,120
                Q 990,125 1040,150
                L 1060,200
                Q 1070,225 1050,250
                L 1020,265
                Q 1000,270 940,270
                L 220,270
                Q 140,270 110,240
                L 90,210
                L 90,140
                Z
              "
              fill="url(#hullGrad)"
              stroke="#334155"
              strokeWidth="2"
            />

            {/* Antifouling Boot-topping line (Red hull bottom) */}
            <path
              d="
                M 100,225
                L 1065,225
                L 1050,250
                L 1020,265
                Q 1000,270 940,270
                L 220,270
                Q 140,270 110,240
                Z
              "
              fill="#7f1d1d"
              opacity="0.35"
            />

            {/* --- SUPERSTRUCTURE / WHEELHOUSE BRIDGE (AFT) --- */}
            {/* Tier 1 Deckhouse */}
            <rect x="140" y="70" width="150" height="50" rx="3" fill="url(#superGrad)" stroke="#475569" strokeWidth="1.5" />
            {/* Tier 2 Wheelhouse */}
            <rect x="155" y="30" width="120" height="40" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            {/* Bridge Windows */}
            <rect x="165" y="38" width="100" height="14" rx="1" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="0.8" />
            {/* Navigation Radar Mast */}
            <line x1="215" y1="30" x2="215" y2="8" stroke="#94a3b8" strokeWidth="2" />
            <line x1="200" y1="12" x2="230" y2="12" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Radar scanner */}
            <line x1="205" y1="8" x2="225" y2="8" stroke="#38bdf8" strokeWidth="2" />

            {/* Funnel (Exhaust Chimney) */}
            <path d="M 125,50 L 145,50 L 142,120 L 125,120 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <rect x="123" y="46" width="24" height="6" fill="#38bdf8" />
            {/* Exhaust plume animation */}
            {isEngineRunning && (
              <g opacity="0.6">
                <circle cx="135" cy="38" r="4" fill="#94a3b8">
                  <animate attributeName="cy" values="38;10" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="r" values="4;14" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
            )}

            {/* --- CARGO CONTAINER STACKS (MIDSHIP TO FORWARD) --- */}
            <g opacity="0.85">
              {/* Bay 1 */}
              <rect x="310" y="65" width="110" height="55" fill="#1e3a5f" stroke="#0284c7" strokeWidth="1" rx="2" />
              <line x1="310" y1="92" x2="420" y2="92" stroke="#0f172a" strokeWidth="1" />
              <text x="365" y="97" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">HOLD #4</text>

              {/* Bay 2 */}
              <rect x="440" y="65" width="110" height="55" fill="#713f12" stroke="#d97706" strokeWidth="1" rx="2" />
              <line x1="440" y1="92" x2="550" y2="92" stroke="#0f172a" strokeWidth="1" />
              <text x="495" y="97" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">HOLD #3</text>

              {/* Bay 3 */}
              <rect x="570" y="65" width="110" height="55" fill="#1e3a5f" stroke="#0284c7" strokeWidth="1" rx="2" />
              <line x1="570" y1="92" x2="680" y2="92" stroke="#0f172a" strokeWidth="1" />
              <text x="625" y="97" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">HOLD #2</text>

              {/* Bay 4 */}
              <rect x="700" y="75" width="110" height="45" fill="#064e3b" stroke="#059669" strokeWidth="1" rx="2" />
              <text x="755" y="102" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">HOLD #1</text>
            </g>

            {/* --- INTERNAL COMPARTMENTS (CUTAWAY VIEW) --- */}

            {/* 1. Forepeak Ballast Tank (FP) - Forward */}
            <g
              onClick={() => handleHotspotClick('ballast_fp')}
              className="cursor-pointer transition-transform hover:opacity-90"
            >
              <polygon
                points="930,140 1020,160 1040,240 930,240"
                fill="#0f172a"
                stroke={selectedHotspot === 'ballast_fp' ? '#38bdf8' : '#334155'}
                strokeWidth={selectedHotspot === 'ballast_fp' ? 2 : 1}
              />
              {/* Ballast liquid fill */}
              <polygon
                points={`930,${240 - (ballastFp.currentPercent / 100) * 80} 1030,${240 - (ballastFp.currentPercent / 100) * 75} 1040,240 930,240`}
                fill="url(#waterFill)"
                opacity="0.75"
              />
              <text x="970" y="200" fill="#bae6fd" fontSize="9" fontWeight="bold" textAnchor="middle">
                FP BALAS
              </text>
              <text x="970" y="215" fill="#e0f2fe" fontSize="10" fontFamily="monospace" textAnchor="middle">
                {ballastFp.currentPercent.toFixed(0)}%
              </text>
            </g>

            {/* 2. Double Bottom Fuel Tanks (HFO / MGO) */}
            <g
              onClick={() => handleHotspotClick('hfo_tanks')}
              className="cursor-pointer hover:opacity-90"
            >
              <rect
                x="320"
                y="215"
                width="360"
                height="45"
                fill="#0f172a"
                stroke={selectedHotspot === 'hfo_tanks' ? '#f59e0b' : '#334155'}
                strokeWidth={selectedHotspot === 'hfo_tanks' ? 2 : 1}
                rx="2"
              />
              {/* Dynamic HFO fuel fill */}
              <rect
                x="322"
                y={215 + (45 - (hfoTank.currentPercent / 100) * 43)}
                width="356"
                height={(hfoTank.currentPercent / 100) * 43}
                fill="url(#fuelFill)"
                rx="1"
              />
              <text x="500" y="235" fill="#fef3c7" fontSize="10" fontWeight="bold" textAnchor="middle">
                TANGKI DASAR BERGANDA HFO (DOUBLE BOTTOM)
              </text>
              <text x="500" y="249" fill="#fde68a" fontSize="10" fontFamily="monospace" textAnchor="middle">
                {activeVessel.resources.totalFuelTonnes.toFixed(1)} MT · {hfoTank.currentPercent.toFixed(1)}% ({hfoTank.temperatureC}°C)
              </text>
            </g>

            {/* 3. Fresh Water Tank (Aft) */}
            <g
              onClick={() => handleHotspotClick('fw_tank')}
              className="cursor-pointer hover:opacity-90"
            >
              <rect
                x="120"
                y="140"
                width="50"
                height="65"
                fill="#0f172a"
                stroke={selectedHotspot === 'fw_tank' ? '#38bdf8' : '#334155'}
                strokeWidth={selectedHotspot === 'fw_tank' ? 2 : 1}
                rx="2"
              />
              <rect
                x="122"
                y={140 + (65 - (fwTank.currentPercent / 100) * 63)}
                width="46"
                height={(fwTank.currentPercent / 100) * 63}
                fill="url(#waterFill)"
                rx="1"
              />
              <text x="145" y="170" fill="#e0f2fe" fontSize="8" fontWeight="bold" textAnchor="middle">
                FW DOM
              </text>
              <text x="145" y="185" fill="#bae6fd" fontSize="9" fontFamily="monospace" textAnchor="middle">
                {fwTank.currentPercent.toFixed(0)}%
              </text>
            </g>

            {/* 4. ENGINE ROOM (KAMAR MESIN) - AFT COMPARTMENT */}
            <g
              onClick={() => handleHotspotClick('main_engine')}
              className="cursor-pointer"
            >
              {/* ER Boundary */}
              <rect
                x="175"
                y="130"
                width="140"
                height="130"
                fill="#0b1120"
                stroke={selectedHotspot === 'main_engine' ? '#06b6d4' : '#1e293b'}
                strokeWidth={selectedHotspot === 'main_engine' ? 2 : 1.5}
                rx="3"
              />

              {/* Bilge Well in ER floor */}
              <rect x="180" y="245" width="45" height="13" fill="url(#bilgeFill)" rx="1" />
              <text x="202" y="254" fill="#cbd5e1" fontSize="7" textAnchor="middle" fontFamily="monospace">
                BILGE {bilgeTk.currentPercent.toFixed(0)}%
              </text>

              {/* Main Engine Silhouette (Two-Stroke Diesel with 6 Cylinder Heads) */}
              <rect x="215" y="170" width="85" height="70" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="2" />
              {/* Cylinder tops */}
              {[0, 1, 2, 3, 4, 5].map(idx => {
                const cyl = me.cylinders[idx];
                const isOverheated = cyl && cyl.exhaustTemp > 415;
                return (
                  <rect
                    key={idx}
                    x={220 + idx * 13}
                    y={163}
                    width={10}
                    height={8}
                    fill={isOverheated ? '#f43f5e' : '#0284c7'}
                    stroke="#0f172a"
                    strokeWidth="0.8"
                    rx="1"
                  >
                    {isOverheated && (
                      <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
                    )}
                  </rect>
                );
              })}

              {/* Turbocharger casing */}
              <circle
                cx="290"
                cy="165"
                r="10"
                fill="#334155"
                stroke={me.turbochargerVibration > 4.5 ? '#f59e0b' : '#38bdf8'}
                strokeWidth="1.5"
              />
              <text x="290" y="168" fill="#e2e8f0" fontSize="7" textAnchor="middle" fontWeight="bold">TC</text>

              {/* Label */}
              <text x="257" y="195" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">
                MESIN UTAMA
              </text>
              <text x="257" y="210" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                {me.rpm.toFixed(1)} RPM
              </text>
              <text x="257" y="224" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                {me.loadPercent.toFixed(0)}% LOAD · {me.powerKw} kW
              </text>

              {/* Auxiliary Diesel Generator (DG1 / DG2) */}
              <rect x="180" y="145" width="30" height="20" fill="#1e293b" stroke="#10b981" strokeWidth="1" rx="1" />
              <text x="195" y="158" fill="#34d399" fontSize="7" fontWeight="bold" textAnchor="middle">DG 1-2</text>
            </g>

            {/* 5. SHAFT LINE, THRUST BEARING, PROPELLER & RUDDER */}
            {/* Shaft line */}
            <line x1="80" y1="235" x2="215" y2="235" stroke="#94a3b8" strokeWidth="4" />

            {/* Thrust Bearing block */}
            <g
              onClick={() => handleHotspotClick('thrust_bearing')}
              className="cursor-pointer"
            >
              <rect
                x="150"
                y="226"
                width="18"
                height="18"
                fill={me.thrustBearingVibration > 7.1 ? '#f43f5e' : me.thrustBearingVibration > 4.5 ? '#f59e0b' : '#0284c7'}
                stroke="#ffffff"
                strokeWidth="1"
                rx="2"
              >
                {me.thrustBearingVibration > 7.1 && (
                  <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite" />
                )}
              </rect>
              <text x="159" y="222" fill="#38bdf8" fontSize="7" textAnchor="middle" fontWeight="bold">
                THRUST
              </text>
            </g>

            {/* Propeller Hub & Spinning Blades */}
            <g transform="translate(75, 235)">
              <circle cx="0" cy="0" r="4" fill="#f59e0b" />
              {/* Rotating Propeller blades */}
              <g>
                {isEngineRunning && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0"
                    to="360"
                    dur={`${propAnimDuration}s`}
                    repeatCount="indefinite"
                  />
                )}
                {/* 4 Blades */}
                <ellipse cx="0" cy="-14" rx="3.5" ry="12" fill="#d97706" stroke="#b45309" strokeWidth="0.8" />
                <ellipse cx="0" cy="14" rx="3.5" ry="12" fill="#d97706" stroke="#b45309" strokeWidth="0.8" />
                <ellipse cx="-14" cy="0" rx="12" ry="3.5" fill="#d97706" stroke="#b45309" strokeWidth="0.8" />
                <ellipse cx="14" cy="0" rx="12" ry="3.5" fill="#d97706" stroke="#b45309" strokeWidth="0.8" />
              </g>
              {/* Water wash cavitation bubbles if running */}
              {isEngineRunning && (
                <circle cx="-16" cy="0" r="2" fill="#ffffff" opacity="0.6">
                  <animate attributeName="cx" values="-10;-40" dur="0.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0" dur="0.6s" repeatCount="indefinite" />
                </circle>
              )}
            </g>

            {/* Semi-balanced Spade Rudder */}
            <path
              d="M 50,215 L 62,215 L 58,265 L 45,260 Z"
              fill="#334155"
              stroke="#64748b"
              strokeWidth="1.2"
            />
            <text x="52" y="275" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">
              RUDDER {nav.rudderAngleDeg > 0 ? `${nav.rudderAngleDeg}°S` : `${Math.abs(nav.rudderAngleDeg)}°P`}
            </text>

            {/* Interactive Inspection Callouts */}
            {selectedHotspot === 'main_engine' && (
              <g>
                <circle cx="257" cy="190" r="14" fill="none" stroke="#06b6d4" strokeWidth="1.5">
                  <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
            )}

            {selectedHotspot === 'thrust_bearing' && (
              <g>
                <circle cx="159" cy="235" r="12" fill="none" stroke="#f43f5e" strokeWidth="2">
                  <animate attributeName="r" values="12;18;12" dur="1s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
          </svg>
        </div>

        {/* Selected Component Quick Telemetry Bar */}
        <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                {selectedHotspot === 'main_engine' && (language === 'id' ? 'Permesinan Utama: MAN B&W 6S50ME-C' : 'Main Engine: MAN B&W 6S50ME-C')}
                {selectedHotspot === 'thrust_bearing' && (language === 'id' ? 'Bantalan Poros Dorong (Thrust Bearing)' : 'Thrust Bearing')}
                {selectedHotspot === 'hfo_tanks' && (language === 'id' ? 'Tangki Bahan Bakar HFO/VLSFO' : 'HFO/VLSFO Fuel Bunker Tanks')}
                {selectedHotspot === 'fw_tank' && (language === 'id' ? 'Tangki Air Tawar Domestik & Minum' : 'Fresh Water Domestic & Potable Tanks')}
                {selectedHotspot === 'ballast_fp' && (language === 'id' ? 'Tangki Balas Forepeak (Trim & Stabilitas)' : 'Forepeak Ballast Tank (Trim & Stability)')}
              </div>
              <div className="text-[11px] text-slate-400">
                {selectedHotspot === 'main_engine' && (language === 'id' ? 'Status: Operasi Nominal · 6 Silinder · Turbocharger Aktif' : 'Status: Running Nominal · 6 Cylinders · Turbocharger Active')}
                {selectedHotspot === 'thrust_bearing' && (language === 'id' ? 'Sensor: Getaran ISO 10816 + Suhu Termokopel Pt100' : 'Sensors: ISO 10816 Vibration + Pt100 Bearing Temp')}
                {selectedHotspot === 'hfo_tanks' && (language === 'id' ? 'Level Sounding Otomatis + Pemanas Steam Coil' : 'Automatic Sounding Radar + Steam Heating Coil')}
                {selectedHotspot === 'fw_tank' && (language === 'id' ? 'Suplai Akomodasi & Produksi Watermaker Reverse Osmosis' : 'Accommodation Supply & Reverse Osmosis Production')}
                {selectedHotspot === 'ballast_fp' && (language === 'id' ? 'Koreksi Trim Haluan & Hambatan Gelombang' : 'Bow Trim Correction & Wave Resistance')}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {selectedHotspot === 'main_engine' && (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400">PUTARAN</span>
                  <span className="text-cyan-300 font-bold tabular-nums">{me.rpm.toFixed(1)} RPM</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400">BEBAN</span>
                  <span className="text-white font-bold tabular-nums">{me.loadPercent.toFixed(1)}%</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400">MINYAK PELUMAS</span>
                  <span className={`font-bold tabular-nums ${me.lubeOilPressure < 3.2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {me.lubeOilPressure.toFixed(2)} Bar
                  </span>
                </div>
              </>
            )}

            {selectedHotspot === 'thrust_bearing' && (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400">GETARAN (RMS)</span>
                  <span className={`font-bold tabular-nums ${me.thrustBearingVibration > 7.1 ? 'text-rose-400' : me.thrustBearingVibration > 4.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {me.thrustBearingVibration.toFixed(2)} mm/s
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400">SUHU BANTALAN</span>
                  <span className={`font-bold tabular-nums ${me.thrustBearingTemp > 80 ? 'text-rose-400' : 'text-white'}`}>
                    {me.thrustBearingTemp.toFixed(1)} °C
                  </span>
                </div>
              </>
            )}

            {selectedHotspot === 'hfo_tanks' && (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400">TOTAL TONASE</span>
                  <span className="text-amber-300 font-bold tabular-nums">{activeVessel.resources.totalFuelTonnes.toFixed(1)} MT</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400">KONSUMSI HARIAN</span>
                  <span className="text-white font-bold tabular-nums">{activeVessel.resources.fuelConsumptionRateTonsDay.toFixed(1)} MT/hari</span>
                </div>
              </>
            )}

            {selectedHotspot === 'fw_tank' && (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400">SISA AIR</span>
                  <span className="text-sky-300 font-bold tabular-nums">{activeVessel.resources.totalFreshWaterM3} m³</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400">OTONOMI</span>
                  <span className="text-white font-bold tabular-nums">{activeVessel.resources.daysWaterRemaining.toFixed(1)} Hari</span>
                </div>
              </>
            )}

            {selectedHotspot === 'ballast_fp' && (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400">VOLUME</span>
                  <span className="text-cyan-300 font-bold tabular-nums">{ballastFp.currentM3} m³</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400">TRIM KAPAL</span>
                  <span className="text-white font-bold tabular-nums">+{nav.trimMeters.toFixed(2)} m (Stern)</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
