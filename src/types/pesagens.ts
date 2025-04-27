export interface Measurement {
  date: string;
  time: string;
  weight: number;
  muscleMassPercent: number;
  muscleMassKg: number;
  fatMassPercent: number;
  waterPercent: number;
  height: number;
  visceralFat: number;
  metabolicAge: number;
  // Medidas de circunferência
  waistCircumference?: number;  // cintura em cm
  hipCircumference?: number;    // quadril em cm
  armCircumference?: number;    // braço em cm
  thighCircumference?: number;  // coxa em cm
  chestCircumference?: number;  // peito em cm
  neckCircumference?: number;   // pescoço em cm
  calfCircumference?: number;   // panturrilha em cm
}

export interface BodyTarget {
  value: number;
  targetDate: string;
  createdAt: string;
  achieved: boolean;
  description?: string;
  initialValue?: number;
}

export interface BodyTargets {
  weightTarget?: BodyTarget;
  fatPercentTarget?: BodyTarget;
  musclePercentTarget?: BodyTarget;
  waistCircumferenceTarget?: BodyTarget;
  hipCircumferenceTarget?: BodyTarget;
  armCircumferenceTarget?: BodyTarget;
  thighCircumferenceTarget?: BodyTarget;
  chestCircumferenceTarget?: BodyTarget;
  neckCircumferenceTarget?: BodyTarget;
  calfCircumferenceTarget?: BodyTarget;
}

export interface MeasurementProgress {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  isImprovement: boolean;
}

export interface MeasurementExport {
  date: string;
  measurements: Measurement[];
  targets?: BodyTargets;
}