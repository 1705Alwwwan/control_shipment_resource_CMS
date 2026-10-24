import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Vessel, MarineAlarm, AlarmSeverity } from '../types/marine';
import { INITIAL_VESSELS, INITIAL_ALARMS } from '../data/mockVessels';

interface MarineContextType {
  vessels: Vessel[];
  activeVessel: Vessel;
  selectedVesselId: string;
  setSelectedVesselId: (id: string) => void;
  alarms: MarineAlarm[];
  activeAlarmCount: number;
  unacknowledgedCount: number;
  isMuted: boolean;
  toggleMute: () => void;
  acknowledgeAlarm: (id: string) => void;
  clearAlarm: (id: string) => void;
  acknowledgeAllAlarms: () => void;
  setTelegraph: (order: Vessel['mainEngine']['telegraph']) => void;
  triggerFault: (faultType: 'thrust_vibration' | 'cylinder_temp' | 'low_lube_oil' | 'high_bilge' | 'ows_violation' | 'reset') => void;
  activeFault: string | null;
  toggleTransferPump: (tankId: string) => void;
  simSpeed: number;
  setSimSpeed: (speed: number) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  language: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;
}

const MarineContext = createContext<MarineContextType | undefined>(undefined);

export const MarineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vessels, setVessels] = useState<Vessel[]>(INITIAL_VESSELS);
  const [selectedVesselId, setSelectedVesselId] = useState<string>('mv-nusantara-pioneer');
  const [alarms, setAlarms] = useState<MarineAlarm[]>(INITIAL_ALARMS);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeFault, setActiveFault] = useState<string | null>(null);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [language, setLanguage] = useState<'id' | 'en'>('id');

  const activeVessel = vessels.find(v => v.id === selectedVesselId) || vessels[0];

  const unacknowledgedCount = alarms.filter(a => a.active && !a.acknowledged).length;
  const activeAlarmCount = alarms.filter(a => a.active).length;

  const toggleMute = () => setIsMuted(prev => !prev);

  const acknowledgeAlarm = (id: string) => {
    setAlarms(prev =>
      prev.map(a => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const acknowledgeAllAlarms = () => {
    setAlarms(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  const clearAlarm = (id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  };

  const addOrUpdateAlarm = useCallback((
    tag: string,
    source: string,
    description: string,
    severity: AlarmSeverity,
    value: number,
    threshold: number,
    unit: string
  ) => {
    setAlarms(prev => {
      const existing = prev.find(a => a.tag === tag);
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour12: false });
      if (existing) {
        return prev.map(a =>
          a.tag === tag
            ? {
                ...a,
                value,
                active: true,
                severity,
                timestamp: nowStr,
              }
            : a
        );
      }
      const newAlarm: MarineAlarm = {
        id: `alm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tag,
        source,
        description,
        severity,
        value,
        threshold,
        unit,
        acknowledged: false,
        active: true,
        timestamp: nowStr,
      };
      return [newAlarm, ...prev];
    });
  }, []);

  const removeAlarmByTag = useCallback((tag: string) => {
    setAlarms(prev => prev.map(a => a.tag === tag ? { ...a, active: false } : a));
  }, []);

  // Handle Engine Telegraph Lever changes
  const setTelegraph = (order: Vessel['mainEngine']['telegraph']) => {
    setVessels(prev =>
      prev.map(v => {
        if (v.id !== selectedVesselId) return v;

        let targetRpm = 96.8;
        let targetLoad = 78.5;
        let targetKw = 8850;
        let targetSog = 15.4;

        switch (order) {
          case 'Full Ahead':
            targetRpm = 98.0;
            targetLoad = 82.0;
            targetKw = 9100;
            targetSog = 15.8;
            break;
          case 'Half Ahead':
            targetRpm = 75.0;
            targetLoad = 55.0;
            targetKw = 6200;
            targetSog = 12.2;
            break;
          case 'Slow Ahead':
            targetRpm = 50.0;
            targetLoad = 32.0;
            targetKw = 3600;
            targetSog = 8.5;
            break;
          case 'Dead Slow Ahead':
            targetRpm = 35.0;
            targetLoad = 18.0;
            targetKw = 1900;
            targetSog = 5.2;
            break;
          case 'Stop':
            targetRpm = 0;
            targetLoad = 0;
            targetKw = 0;
            targetSog = 1.2; // drifting
            break;
          case 'Astern':
            targetRpm = 45.0;
            targetLoad = 35.0;
            targetKw = 3800;
            targetSog = -3.5;
            break;
        }

        return {
          ...v,
          mainEngine: {
            ...v.mainEngine,
            telegraph: order,
            status: order === 'Stop' ? 'standby' : 'running',
            rpm: targetRpm,
            loadPercent: targetLoad,
            powerKw: targetKw,
          },
          navigation: {
            ...v.navigation,
            speedOverGroundKnots: targetSog,
            speedThroughWaterKnots: Math.max(0, targetSog - 0.3),
          },
        };
      })
    );
  };

  // Fault Injection Triggers (for Marine Drills / Testing)
  const triggerFault = (faultType: 'thrust_vibration' | 'cylinder_temp' | 'low_lube_oil' | 'high_bilge' | 'ows_violation' | 'reset') => {
    setActiveFault(faultType === 'reset' ? null : faultType);

    if (faultType === 'reset') {
      // Clear fault alarms
      removeAlarmByTag('THRUST-VIB-01');
      removeAlarmByTag('CYL-TEMP-04');
      removeAlarmByTag('LO-PRESS-01');
      removeAlarmByTag('BILGE-HI-01');
      removeAlarmByTag('OWS-ALARM-01');

      setVessels(prev =>
        prev.map(v => {
          if (v.id !== selectedVesselId) return v;
          return {
            ...v,
            mainEngine: {
              ...v.mainEngine,
              thrustBearingVibration: 3.12,
              thrustBearingTemp: 64.2,
              lubeOilPressure: 4.2,
              cylinders: v.mainEngine.cylinders.map(c => ({
                ...c,
                exhaustTemp: c.cylinderNumber === 4 ? 395 : c.exhaustTemp,
              })),
            },
            resources: {
              ...v.resources,
              bilgeLevelMm: 450,
              owsOverboardPpm: 4.8,
            },
          };
        })
      );
      return;
    }

    if (faultType === 'thrust_vibration') {
      addOrUpdateAlarm(
        'THRUST-VIB-01',
        'Bantalan Poros Utama (Thrust Bearing)',
        'Getaran Kritis ISO 10816 Zone D (> 7.1 mm/s RMS) & Suhu Bantalan Meningkat',
        'critical',
        7.85,
        7.1,
        'mm/s RMS'
      );
      setVessels(prev =>
        prev.map(v => {
          if (v.id !== selectedVesselId) return v;
          return {
            ...v,
            mainEngine: {
              ...v.mainEngine,
              thrustBearingVibration: 7.85,
              thrustBearingTemp: 84.5,
            },
          };
        })
      );
    } else if (faultType === 'cylinder_temp') {
      addOrUpdateAlarm(
        'CYL-TEMP-04',
        'Silinder Mesin Utama No. 4',
        'Temperatur Gas Buang Silinder #4 Sangat Tinggi (Exhaust Gas High Deviation)',
        'critical',
        438,
        415,
        '°C'
      );
      setVessels(prev =>
        prev.map(v => {
          if (v.id !== selectedVesselId) return v;
          return {
            ...v,
            mainEngine: {
              ...v.mainEngine,
              cylinders: v.mainEngine.cylinders.map(c =>
                c.cylinderNumber === 4 ? { ...c, exhaustTemp: 438, pMax: 154 } : c
              ),
            },
          };
        })
      );
    } else if (faultType === 'low_lube_oil') {
      addOrUpdateAlarm(
        'LO-PRESS-01',
        'Sistem Minyak Pelumas (Lube Oil)',
        'Tekanan Minyak Pelumas Mesin Utama Rendah (< 3.2 Bar) - Bahaya Kerusakan Metal',
        'critical',
        2.85,
        3.2,
        'Bar'
      );
      setVessels(prev =>
        prev.map(v => {
          if (v.id !== selectedVesselId) return v;
          return {
            ...v,
            mainEngine: {
              ...v.mainEngine,
              lubeOilPressure: 2.85,
            },
          };
        })
      );
    } else if (faultType === 'high_bilge') {
      addOrUpdateAlarm(
        'BILGE-HI-01',
        'Got Kamar Mesin (ER Bilge Well)',
        'Level Air Got Kamar Mesin Tinggi (> 800 mm) - Deteksi Genangan / Kebocoran Air Laut',
        'warning',
        860,
        800,
        'mm'
      );
      setVessels(prev =>
        prev.map(v => {
          if (v.id !== selectedVesselId) return v;
          return {
            ...v,
            resources: {
              ...v.resources,
              bilgeLevelMm: 860,
            },
          };
        })
      );
    } else if (faultType === 'ows_violation') {
      addOrUpdateAlarm(
        'OWS-ALARM-01',
        'Oily Water Separator (OWS 15 PPM)',
        'Kandungan Minyak Air Buangan Melebihi Batas IMO MARPOL 15 PPM - Katup 3-Way Otomatis Tertutup',
        'critical',
        18.4,
        15.0,
        'PPM'
      );
      setVessels(prev =>
        prev.map(v => {
          if (v.id !== selectedVesselId) return v;
          return {
            ...v,
            resources: {
              ...v.resources,
              owsOverboardPpm: 18.4,
            },
          };
        })
      );
    }
  };

  const toggleTransferPump = (tankId: string) => {
    setVessels(prev =>
      prev.map(v => {
        if (v.id !== selectedVesselId) return v;
        return {
          ...v,
          tanks: v.tanks.map(t =>
            t.id === tankId ? { ...t, transferPumpActive: !t.transferPumpActive } : t
          ),
        };
      })
    );
  };

  // Real-time Telemetry Simulator Loop (Runs every second)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setVessels(prevVessels =>
        prevVessels.map(v => {
          if (v.id !== selectedVesselId) return v;

          const me = v.mainEngine;
          if (me.status === 'stopped' || me.telegraph === 'Stop') {
            return v;
          }

          // Subtle realistic sensor drift (noise)
          const rpmJitter = (Math.random() - 0.5) * 0.4;
          const newRpm = Math.max(0, Number((me.rpm + rpmJitter).toFixed(1)));
          const freqJitter = (Math.random() - 0.5) * 0.04;
          const newFreq = Number((60.0 + freqJitter).toFixed(2));
          
          // Fuel burn decrement calculation
          const burnRatePerSec = (v.resources.fuelConsumptionRateTonsDay / (24 * 3600)) * simSpeed;
          const newFuelTonnes = Math.max(0, Number((v.resources.totalFuelTonnes - burnRatePerSec).toFixed(3)));

          // Check if active fault is overriding specific sensors
          const isThrustFault = activeFault === 'thrust_vibration';
          const isLubeFault = activeFault === 'low_lube_oil';
          const isCylFault = activeFault === 'cylinder_temp';

          const thrustVib = isThrustFault
            ? 7.85 + (Math.random() - 0.5) * 0.15
            : 3.12 + (Math.random() - 0.5) * 0.12;
            
          const lubePress = isLubeFault
            ? 2.85 + (Math.random() - 0.5) * 0.05
            : 4.2 + (Math.random() - 0.5) * 0.04;

          return {
            ...v,
            mainEngine: {
              ...me,
              rpm: newRpm,
              thrustBearingVibration: Number(thrustVib.toFixed(2)),
              lubeOilPressure: Number(lubePress.toFixed(2)),
              cylinders: me.cylinders.map(c => {
                if (c.cylinderNumber === 4 && isCylFault) {
                  return { ...c, exhaustTemp: 438 + Math.round((Math.random() - 0.5) * 3) };
                }
                const tempDrift = Math.round((Math.random() - 0.5) * 2);
                return { ...c, exhaustTemp: c.exhaustTemp + tempDrift };
              }),
            },
            electrical: {
              ...v.electrical,
              gridFrequency: newFreq,
            },
            resources: {
              ...v.resources,
              totalFuelTonnes: newFuelTonnes,
            },
          };
        })
      );
    }, 1000 / simSpeed);

    return () => clearInterval(interval);
  }, [selectedVesselId, isPaused, simSpeed, activeFault]);

  return (
    <MarineContext.Provider
      value={{
        vessels,
        activeVessel,
        selectedVesselId,
        setSelectedVesselId,
        alarms,
        activeAlarmCount,
        unacknowledgedCount,
        isMuted,
        toggleMute,
        acknowledgeAlarm,
        clearAlarm,
        acknowledgeAllAlarms,
        setTelegraph,
        triggerFault,
        activeFault,
        toggleTransferPump,
        simSpeed,
        setSimSpeed,
        isPaused,
        setIsPaused,
        language,
        setLanguage,
      }}
    >
      {children}
    </MarineContext.Provider>
  );
};

export const useMarine = () => {
  const context = useContext(MarineContext);
  if (!context) {
    throw new Error('useMarine must be used within a MarineProvider');
  }
  return context;
};
