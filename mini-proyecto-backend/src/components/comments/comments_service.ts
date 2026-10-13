// src/components/comments/comments_service.ts
import { Repository } from 'typeorm';
import { BaseService } from '../../utils/base_service';
import { DatabaseUtil } from '../../utils/db';
import { Comments } from './comments_entity';

export class CommentsService extends BaseService<Comments> {
  constructor() {
    const dbUtil = new DatabaseUtil();
    const repository: Repository<Comments> = dbUtil.getRepository(Comments);
    super(repository);
  }
}
