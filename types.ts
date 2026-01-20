
export enum IntensityType {
  WARMUP1 = 'Warm-up 1',
  WARMUP2 = 'Warm-up 2',
  WARMUP3 = 'Warm-up 3',
  TOPSET = 'TOP SET',
  BACKOFF = 'BACK OFF',
  METABOLIC = 'DROP METABOLICO'
}

export interface TrainingSet {
  type: IntensityType;
  percentage: number;
  reps: string;
  rpe: number;
  rest: string;
  description: string;
  weight: number;
  color: string;
}

export interface CalculatorState {
  topSetWeight: number;
  exerciseName: string;
  unit: 'kg' | 'lb';
}

export interface SavedEntry {
  id: string;
  exerciseName: string;
  topSetWeight: number;
  unit: string;
  date: string;
}
