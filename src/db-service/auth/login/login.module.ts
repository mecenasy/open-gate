import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { loginCommandHandlers } from './commands/handlers';
import { loginQueryHandlers } from './queries/handlers';

@Module({
  imports: [CqrsModule],
  controllers: [LoginController],
  providers: [LoginService, ...loginCommandHandlers, ...loginQueryHandlers],
})
export class LoginModule {}
