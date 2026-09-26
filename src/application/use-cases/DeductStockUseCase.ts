import { IPerfumeRepository } from '../../domain/repositories/IPerfumeRepository';
import { InvalidPerfumeDataError } from '../../domain/errors/InvalidPerfumeDataError';
import { mapPerfumeToResponseDTO, PerfumeResponseDTO } from '../dtos/PerfumeResponseDTO';

export class DeductStockUseCase {
  constructor(private readonly perfumeRepository: IPerfumeRepository) {}

  public async execute(perfumeId: string, quantity: number): Promise<PerfumeResponseDTO> {
    const perfume = await this.perfumeRepository.findById(perfumeId);
    if (!perfume) {
      throw new InvalidPerfumeDataError(`Perfume con ID '${perfumeId}' no encontrado.`);
    }

    // Ejecuta la invariante del dominio
    perfume.deductStock(quantity);

    // Persiste el cambio de estado
    await this.perfumeRepository.update(perfume);

    return mapPerfumeToResponseDTO(perfume);
  }
}
