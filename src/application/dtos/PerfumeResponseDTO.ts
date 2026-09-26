import { Perfume } from '../../domain/entities/Perfume';
import { Concentration } from '../../domain/value-objects/Concentration';

export interface PerfumeResponseDTO {
  id: string;
  name: string;
  brand: string;
  concentration: Concentration;
  sizeMl: number;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export function mapPerfumeToResponseDTO(perfume: Perfume): PerfumeResponseDTO {
  return {
    id: perfume.id,
    name: perfume.name,
    brand: perfume.brand,
    concentration: perfume.concentration,
    sizeMl: perfume.sizeMl,
    price: perfume.price,
    stock: perfume.stock,
    createdAt: perfume.createdAt.toISOString(),
    updatedAt: perfume.updatedAt.toISOString(),
  };
}
