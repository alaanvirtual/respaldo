import {
  IPerfumeRepository,
  PerfumeFilterOptions,
} from '../../../domain/repositories/IPerfumeRepository';
import { Perfume } from '../../../domain/entities/Perfume';

export class InMemoryPerfumeRepository implements IPerfumeRepository {
  private readonly perfumes = new Map<string, Perfume>();

  constructor(initialPerfumes: Perfume[] = []) {
    initialPerfumes.forEach((p) => this.perfumes.set(p.id, p));
  }

  public async findById(id: string): Promise<Perfume | null> {
    const perfume = this.perfumes.get(id);
    return perfume ? Perfume.reconstitute(perfume.toJSON()) : null;
  }

  public async findAll(filters?: PerfumeFilterOptions): Promise<Perfume[]> {
    let result = Array.from(this.perfumes.values());

    if (filters) {
      if (filters.brand) {
        const brandQuery = filters.brand.toLowerCase();
        result = result.filter((p) => p.brand.toLowerCase().includes(brandQuery));
      }
      if (filters.concentration) {
        result = result.filter((p) => p.concentration === filters.concentration);
      }
      if (filters.minPrice !== undefined) {
        result = result.filter((p) => p.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        result = result.filter((p) => p.price <= filters.maxPrice!);
      }
      if (filters.inStockOnly) {
        result = result.filter((p) => p.stock > 0);
      }
    }

    return result.map((p) => Perfume.reconstitute(p.toJSON()));
  }

  public async findByNameAndBrand(name: string, brand: string): Promise<Perfume | null> {
    const normalizedName = name.trim().toLowerCase();
    const normalizedBrand = brand.trim().toLowerCase();

    for (const perfume of this.perfumes.values()) {
      if (
        perfume.name.toLowerCase() === normalizedName &&
        perfume.brand.toLowerCase() === normalizedBrand
      ) {
        return Perfume.reconstitute(perfume.toJSON());
      }
    }

    return null;
  }

  public async save(perfume: Perfume): Promise<void> {
    this.perfumes.set(perfume.id, Perfume.reconstitute(perfume.toJSON()));
  }

  public async update(perfume: Perfume): Promise<void> {
    if (!this.perfumes.has(perfume.id)) {
      throw new Error(`No se puede actualizar: Perfume '${perfume.id}' no existe.`);
    }
    this.perfumes.set(perfume.id, Perfume.reconstitute(perfume.toJSON()));
  }

  public async delete(id: string): Promise<boolean> {
    return this.perfumes.delete(id);
  }

  public async count(): Promise<number> {
    return this.perfumes.size;
  }
}
