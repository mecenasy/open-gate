import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignalModule } from './signal/signal.module';

@Module({
  imports: [CqrsModule, SignalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
