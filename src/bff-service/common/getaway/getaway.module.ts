import { Global, Module } from '@nestjs/common';
import { Getaway } from './getaway.getaway';

@Global()
@Module({
  providers: [Getaway],
  exports: [Getaway],
})
export class GetawayModule {}
