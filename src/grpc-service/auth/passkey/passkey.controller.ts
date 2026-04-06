import { Controller } from '@nestjs/common';
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
import { PasskeyService } from './passkey.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller('passkey')
export class PasskeyController implements PasskeyProxyServiceController {
  constructor(private readonly passkeyService: PasskeyService) {}

  @GrpcMethod(PASSKEY_PROXY_SERVICE_NAME, 'RemovePasskey')
  async removePasskey(request: RemovePasskeyRequest): Promise<PasskeyResponse> {
    return await this.passkeyService.removePasskey(request);
  }

  @GrpcMethod(PASSKEY_PROXY_SERVICE_NAME, 'AddPasskey')
  async addPasskey(request: AddPasskeyRequest): Promise<PasskeyResponse> {
    return await this.passkeyService.addPasskey(request);
  }

  @GrpcMethod(PASSKEY_PROXY_SERVICE_NAME, 'GetPasskey')
  async getPasskey(request: GetPasskeyRequest): Promise<GetPasskeyResponse> {
    return await this.passkeyService.getPasskey(request);
  }
  @GrpcMethod(PASSKEY_PROXY_SERVICE_NAME, 'GetPasskeys')
  async getPasskeys(request: GetPasskeysRequest): Promise<GetPasskeysResponse> {
    return await this.passkeyService.getPasskeys(request);
  }
  @GrpcMethod(PASSKEY_PROXY_SERVICE_NAME, 'SetCounter')
  async setCounter(request: SetCounterRequest): Promise<PasskeyResponse> {
    return await this.passkeyService.setCounter(request);
  }
}
