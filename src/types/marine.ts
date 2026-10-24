/**
 * Vessel Condition & Resource Monitoring System Types
 * Standar Klasifikasi Maritim (BKI / DNV / Lloyd's Register)
 */

export type AlarmSeverity = 'critical' | 'warning' | 'caution' | 'nominal';

export interface MarineAlarm {
  id: string;
  tag: string;
  timestamp: string;
  severity: AlarmSeverity;
  source: string; // e.g., "Mesin Utama - Bantalan No. 4", "Tangki Servis HFO"
  description: string;
  value: number;
  threshold: number;
  unit: string;
  acknowledged: boolean;
  active: boolean;
}

export interface CylinderTelemetry {
  cylinderNumber: number;
  exhaustTemp: number; // °C (normal ~360-410°C)
  pMax: number; // bar (peak pressure)
  pComp: number; // bar (compression pressure)
  coolingWaterTempOut: number; // °C
}

export interface MainEngineData {
  name: string;
  model: string;
  status: 'running' | 'standby' | 'stopped' | 'warning' | 'critical';
  telegraph: 'Full Ahead' | 'Half Ahead' | 'Slow Ahead' | 'Dead Slow Ahead' | 'Stop' | 'Astern';
  rpm: number; // e.g., 90 - 115 rpm
  maxRpm: number;
  loadPercent: number; // %
  powerKw: number;
  torqueKnm: number;
  runningHours: number;
  cylinders: CylinderTelemetry[];
  
  // Lube Oil System
  lubeOilPressure: number; // bar (nom 3.8 - 4.5)
  lubeOilTempIn: number; // °C (nom 42 - 48)
  lubeOilTempOut: number; // °C (nom 55 - 62)
  
  // Cooling System
  jacketWaterPressure: number; // bar
  jacketWaterTempIn: number; // °C
  jacketWaterTempOut: number; // °C
  seaWaterPressure: number; // bar
  
  // Scavenge & Turbocharger
  scavengeAirPressure: number; // bar (nom 1.8 - 2.4)
  scavengeAirTemp: number; // °C (nom 40 - 48)
  turbochargerRpm: number; // nom 12,500 - 18,000
  
  // Vibration (ISO 10816-6 Zone classification)
  thrustBearingVibration: number; // mm/s RMS (nom < 4.5)
  turbochargerVibration: number; // mm/s RMS
  thrustBearingTemp: number; // °C (nom 60 - 75)
  flywheelVibration: number; // mm/s RMS
}

export interface GeneratorData {
  id: string;
  name: string;
  status: 'running' | 'standby' | 'stopped' | 'alarm';
  voltage: number; // V (440V)
  frequency: number; // Hz (60.0)
  activePowerKw: number;
  maxPowerKw: number;
  currentAmps: number;
  powerFactor: number; // cos phi (e.g. 0.85)
  loadPercent: number;
  runningHours: number;
  fuelConsumptionRateLh: number;
}

export interface TankData {
  id: string;
  name: string;
  type: 'HFO' | 'MGO' | 'FW' | 'BALLAST' | 'BILGE' | 'SLUDGE';
  location: string;
  capacityM3: number;
  currentM3: number;
  currentPercent: number;
  temperatureC?: number;
  density?: number; // kg/m³
  soundingCm: number;
  maxSoundingCm: number;
  transferPumpActive?: boolean;
}

export interface ElectricalSystem {
  totalLoadKw: number;
  totalCapacityKw: number;
  gridFrequency: number;
  busTieClosed: boolean;
  batteryBankVoltage: number; // V DC (nom 24.8V)
  batteryStateOfCharge: number; // %
  shoreConnectionActive: boolean;
}

export interface NavigationTelemetry {
  speedOverGroundKnots: number; // SOG
  speedThroughWaterKnots: number; // STW
  courseOverGroundDeg: number; // COG
  headingDeg: number;
  rudderAngleDeg: number; // Port/Stbd
  trimMeters: number; // Trim (+ by stern)
  heelDeg: number; // Heel (+ to stbd)
  depthMeters: number;
  windSpeedKnots: number;
  windDirectionDeg: number;
  seaStateBeaufort: number;
  latitude: number;
  longitude: number;
  destinationPort: string;
  eta: string;
}

export interface ResourceSummary {
  totalFuelTonnes: number;
  fuelConsumptionRateTonsDay: number;
  daysFuelRemaining: number;
  steamingRangeNm: number;
  totalFreshWaterM3: number;
  freshWaterProductionM3Day: number; // RO Watermaker
  dailyFreshWaterConsumptionM3: number;
  daysWaterRemaining: number;
  bilgeLevelMm: number;
  owsOverboardPpm: number; // Oily water separator PPM (<15 IMO)
}

export interface Vessel {
  id: string;
  name: string;
  callSign: string;
  imoNumber: string;
  vesselType: string;
  flag: string;
  yearBuilt: number;
  deadweightTonnage: number; // DWT
  lengthOverallMeters: number; // LOA
  beamMeters: number;
  draughtMeters: number;
  mainEngine: MainEngineData;
  generators: GeneratorData[];
  tanks: TankData[];
  electrical: ElectricalSystem;
  navigation: NavigationTelemetry;
  resources: ResourceSummary;
}

export interface VibrationHarmonicPoint {
  frequencyHz: number;
  amplitudeMmS: number;
  order: string;
  status: 'normal' | 'elevated' | 'critical';
}
