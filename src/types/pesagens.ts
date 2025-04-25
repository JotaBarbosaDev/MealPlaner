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
  // Novas propriedades para medidas de circunferências
  waistCircumference?: number; // cintura em cm
  hipCircumference?: number;   // quadril em cm
  armCircumference?: number;   // braço em cm
  thighCircumference?: number; // coxa em cm
  chestCircumference?: number; // peito em cm
  neckCircumference?: number;  // pescoço em cm
}

export interface BodyTarget {
  value: number;
  targetDate: string;
  createdAt: string;
  achieved: boolean;
}

export interface BodyTargets {
  weightTarget?: BodyTarget;
  fatPercentTarget?: BodyTarget;
  musclePercentTarget?: BodyTarget;
  waistCircumferenceTarget?: BodyTarget;
}