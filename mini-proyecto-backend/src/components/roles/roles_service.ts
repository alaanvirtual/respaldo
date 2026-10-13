// src/components/roles/roles_service.ts
import { Repository } from 'typeorm';
import { BaseService } from '../../utils/base_service';
import { DatabaseUtil } from '../../utils/db';
import { Roles } from './roles_entity';

export class RolesService extends BaseService<Roles> {
  constructor() {
    const dbUtil = new DatabaseUtil();
    const repository: Repository<Roles> = dbUtil.getRepository(Roles);
    super(repository);
  }
}
