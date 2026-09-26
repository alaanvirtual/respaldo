import { IPerfumeRepository } from '../../domain/repositories/IPerfumeRepository';
import { Perfume } from '../../domain/entities/Perfume';
import { InvalidPerfumeDataError } from '../../domain/errors/InvalidPerfumeDataError';
import { CreatePerfumeDTO } from '../dtos/CreatePerfumeDTO';
import { mapPerfumeToResponseDTO, PerfumeResponseDTO } from '../dtos/PerfumeResponseDTO';

export class CreatePerfumeUseCase {
  constructor(private readonly perfumeRepository: IPerfumeRepository) {}

  public async execute(dto: CreatePerfumeDTO): Promise<PerfumeResponseDTO> {
    const existing = await this.perfumeRepository.findByNameAndBrand(dto.name, dto.brand);
    if (existing) {
      throw new InvalidPerfumeDataError(
        `Ya existe una fragancia registrada con el nombre '${dto.name}' y la marca '${dto.brand}'.`,
      );
    }

    const perfume = Perfume.create({
      name: dto.name,
      brand: dto.brand,
      concentration: dto.concentration,
      sizeMl: dto.sizeMl,
      price: dto.price,
      stock: dto.stock,
    });

    await this.perfumeRepository.save(perfume);

    return mapPerfumeToResponseDTO(perfume);
  }
}
