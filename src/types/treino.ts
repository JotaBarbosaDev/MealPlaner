export type DayOfWeek =
  | "Segunda-feira"
  | "Terça-feira"
  | "Quarta-feira"
  | "Quinta-feira"
  | "Sexta-feira"
  | "Sábado"
  | "Domingo";

export interface Exercise {
  name: string;
  series: number;
  repetitions: number;
  pause: number; // segundos
}

export interface Workout {
  name: string;
  exerciseIds?: number[];
  exercises?: Exercise[];
}

export interface WeeklyPlan {
  [key: string]: string; // Dia -> Nome do Treino ou "Descanso"
}

export interface TrainingSet {
  reps: number;
  weight: number;
}

export interface ExerciseLog {
  exerciseName: string;
  sets: TrainingSet[];
}

export interface TrainingLogEntry {
  date: string;
  dayOfWeek: DayOfWeek;
  workoutName: string;
  exerciseLogs: ExerciseLog[];
}