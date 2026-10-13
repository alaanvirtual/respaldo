// src/components/users/users_service.ts
import { Repository } from 'typeorm';
import { BaseService } from '../../utils/base_service';
import { DatabaseUtil } from '../../utils/db';
import { Users } from './users_entity';

export class UsersService extends BaseService<Users> {
  constructor() {
    const dbUtil = new DatabaseUtil();
    const repository: Repository<Users> = dbUtil.getRepository(Users);
    super(repository);
  }
}
