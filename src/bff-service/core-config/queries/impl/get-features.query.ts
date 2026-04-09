import { Query } from '@nestjs/cqrs';
import { GetAllResponse } from 'src/proto/config';

export class GetFeaturesQuery extends Query<GetAllResponse> {}
