import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type {
  AddPasskeyRequest,
  GetPasskeyRequest,
  GetPasskeyResponse,
  GetPasskeysRequest,
  GetPasskeysResponse,
  PasskeyResponse,
  RemovePasskeyRequest,
  SetCounterRequest,
} from 'src/proto/passkey';
import { PASSKEY_PROXY_SERVICE_NAME, PasskeyProxyServiceController } from 'src/proto/passkey';
import { GrpcMethod } from '@nestjs/microservices';
import { AddPasskeyCommand } from './commands/impl/add-passkey.command';
import { RemovePasskeyCommand } from './commands/impl/remove-passkey.command';
import { SetCounterCommand } from './commands/impl/set-counter.command';
import { GetPasskeyQuery } from './queries/impl/get-passkey.query';
import { GetPasskeysQuery } from './queries/impl/get-passkeys.query';

@Controller('passkey')
export class PasskeyController implements PasskeyProxyServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod(PASSKEY_PROXY_SERVICE_NAME, 'RemovePasskey')
  removePasskey(request: RemovePasskeyRequest): Promise<PasskeyResponse> {
    return this.commandBus.execute(new RemovePasskeyCommand(request));
  }

  @GrpcMethod(PASSKEY_PROXY_SERVICE_NAME, 'AddPasskey')
  addPasskey(request: AddPasskeyRequest): Promise<PasskeyResponse> {
    return this.commandBus.execute(new AddPasskeyCommand(request));
  }

  @GrpcMethod(PASSKEY_PROXY_SERVICE_NAME, 'GetPasskey')
  getPasskey(request: GetPasskeyRequest): Promise<GetPasskeyResponse> {
    return this.queryBus.execute(new GetPasskeyQuery(request));
  }

  @GrpcMethod(PASSKEY_PROXY_SERVICE_NAME, 'GetPasskeys')
  getPasskeys(request: GetPasskeysRequest): Promise<GetPasskeysResponse> {
    return this.queryBus.execute(new GetPasskeysQuery(request));
  }

  @GrpcMethod(PASSKEY_PROXY_SERVICE_NAME, 'SetCounter')
  setCounter(request: SetCounterRequest): Promise<PasskeyResponse> {
    return this.commandBus.execute(new SetCounterCommand(request));
  }
}
