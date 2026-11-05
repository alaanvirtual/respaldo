import {
  IPerfumeRepository,
  PerfumeFilterOptions,
} from '../../domain/repositories/IPerfumeRepository';
import { mapPerfumeToResponseDTO, PerfumeResponseDTO } from '../dtos/PerfumeResponseDTO';

export class ListPerfumesUseCase {
  constructor(private readonly perfumeRepository: IPerfumeRepository) {}

  public async execute(filters?: PerfumeFilterOptions): Promise<PerfumeResponseDTO[]> {
    const perfumes = await this.perfumeRepository.findAll(filters);
    return perfumes.map(mapPerfumeToResponseDTO);
  }
}
