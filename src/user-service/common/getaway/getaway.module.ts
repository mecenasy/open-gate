import { Global, Module } from '@nestjs/common';
import { AuthGetaway } from './getaway.getaway';

@Global()
@Module({
  providers: [AuthGetaway],
  exports: [AuthGetaway],
})
export class GetawayModule {}
