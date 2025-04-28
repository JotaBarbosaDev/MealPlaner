export interface Streak {
  count: number;
  lastUpdate: string; // data em formato ISO
  startDate: string; // data em formato ISO
}

export interface UserStreaks {
  diet: Streak;
  training: Streak;
  measurements: Streak; // Para acompanhar sequência de medições
  steps: Streak; // Nova adição para acompanhar sequência de passos
}