// src/clean-architecture/domain/repositories/ITaskRepository.ts - Capa 1: Contrato de Repositorio
import { DomainTask } from '../entities/Task';

export interface ICleanTaskRepository {
  save(task: DomainTask): Promise<void>;
  findById(id: string): Promise<DomainTask | null>;
  findByProjectId(projectId: string): Promise<DomainTask[]>;
}
