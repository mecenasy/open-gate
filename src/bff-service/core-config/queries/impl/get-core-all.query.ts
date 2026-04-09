import { Query } from '@nestjs/cqrs';
import { GetAllResponse } from 'src/proto/config';

export class GetCoreAllQuery extends Query<GetAllResponse> {}
