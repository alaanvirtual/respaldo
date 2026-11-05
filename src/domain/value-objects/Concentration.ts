export type Concentration = 'EDT' | 'EDP' | 'Parfum' | 'Extrait';

export const CONCENTRATIONS: readonly Concentration[] = [
  'EDT',
  'EDP',
  'Parfum',
  'Extrait',
] as const;

export function isValidConcentration(value: unknown): value is Concentration {
  return typeof value === 'string' && CONCENTRATIONS.includes(value as Concentration);
}
