export const PILLARS = {
  1: { name: 'Política y datos',    color: 'var(--pillar-1)' },
  2: { name: 'Marketing analytics', color: 'var(--pillar-2)' },
  3: { name: 'Ingeniería GCP',      color: 'var(--pillar-3)' },
  4: { name: 'IA aplicada',         color: 'var(--pillar-4)' },
  5: { name: 'Estadística',         color: 'var(--pillar-5)' },
} as const;

export type PillarKey = keyof typeof PILLARS;
