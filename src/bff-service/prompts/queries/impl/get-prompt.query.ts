import { Query } from '@nestjs/cqrs';
import { PromptResponse } from 'src/proto/prompt';
import { UserType } from '../../dto/enums';

export class GetPromptQuery extends Query<PromptResponse> {
  constructor(public readonly userType: UserType) {
    super();
  }
}
