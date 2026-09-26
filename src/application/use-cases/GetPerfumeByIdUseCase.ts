import { IPerfumeRepository } from '../../domain/repositories/IPerfumeRepository';
import { mapPerfumeToResponseDTO, PerfumeResponseDTO } from '../dtos/PerfumeResponseDTO';

export class GetPerfumeByIdUseCase {
  constructor(private readonly perfumeRepository: IPerfumeRepository) {}

  public async execute(id: string): Promise<PerfumeResponseDTO | null> {
    const perfume = await this.perfumeRepository.findById(id);
    if (!perfume) {
      return null;
    }
    return mapPerfumeToResponseDTO(perfume);
  }
}
