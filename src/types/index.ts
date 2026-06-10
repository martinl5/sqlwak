export type Epoch = 'Foundational' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Level {
  id: number;
  title: string;
  description: string;
  hint: string;
  seedQuery: string;
  solutionQuery: string;
  epoch: Epoch;
  difficulty: number;
  /**
   * When true the user's rows must appear in the same order as the solution's.
   * When omitted, ordering is required only if the solution query has a
   * top-level ORDER BY (see solutionRequiresOrder in lib/validator.ts).
   */
  orderMatters?: boolean;
}

export interface QueryResult {
  columns: string[];
  values: unknown[][];
  rowCount?: number;
}

export interface Boid {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  level: number;
  species: string;
  color: string;
  size: number;
  trail: { x: number; y: number }[];
}
