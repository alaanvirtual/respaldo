export type Concentration = 'EDT' | 'EDP' | 'Parfum' | 'Extrait';
export interface IPerfume {
  id: string;
  name: string;
  brand: string;
  concentration: Concentration;
  price: number;
  stock: number;
}
