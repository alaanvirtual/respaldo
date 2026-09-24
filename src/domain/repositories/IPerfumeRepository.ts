import { Perfume } from '../entities/Perfume';
import { Concentration } from '../value-objects/Concentration';

export interface PerfumeFilterOptions {
  brand?: string;
  concentration?: Concentration;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}

export interface IPerfumeRepository {
  findById(id: string): Promise<Perfume | null>;
  findAll(filters?: PerfumeFilterOptions): Promise<Perfume[]>;
  findByNameAndBrand(name: string, brand: string): Promise<Perfume | null>;
  save(perfume: Perfume): Promise<void>;
  update(perfume: Perfume): Promise<void>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}
