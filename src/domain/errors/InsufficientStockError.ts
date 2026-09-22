import { DomainError } from './DomainError';

export class InsufficientStockError extends DomainError {
  constructor(perfumeId: string, requested: number, available: number) {
    super(
      `Stock insuficiente para el perfume con ID '${perfumeId}'. Solicitado: ${requested}, Disponible: ${available}.`,
    );
  }
}
