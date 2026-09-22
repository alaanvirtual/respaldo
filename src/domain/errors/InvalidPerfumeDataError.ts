import { DomainError } from './DomainError';

export class InvalidPerfumeDataError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
