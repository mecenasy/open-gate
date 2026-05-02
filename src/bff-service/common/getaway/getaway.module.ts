import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Getaway } from './getaway.getaway';

@Global()
@Module({
  imports: [CqrsModule],
  providers: [Getaway],
  exports: [Getaway],
})
export class GetawayModule {}
