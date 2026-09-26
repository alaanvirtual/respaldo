import { Concentration } from '../../domain/value-objects/Concentration';

export interface CreatePerfumeDTO {
  name: string;
  brand: string;
  concentration: Concentration;
  sizeMl: number;
  price: number;
  stock: number;
}
