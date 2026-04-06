import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AddPasskeyRequest,
  GetPasskeyRequest,
  GetPasskeyResponse,
  GetPasskeysRequest,
  GetPasskeysResponse,
  PasskeyResponse,
  RemovePasskeyRequest,
  SetCounterRequest,
} from 'src/proto/passkey';
import { Repository } from 'typeorm';
import { PassKey } from './entity/passkey.entity';
import { UserService } from 'src/grpc-service/user/user.service';

@Injectable()
export class PasskeyService {
  constructor(
    @InjectRepository(PassKey)
    private readonly passkeyRepository: Repository<PassKey>,
    private readonly userService: UserService,
  ) {}
  async removePasskey({ id }: RemovePasskeyRequest): Promise<PasskeyResponse> {
    const result = await this.passkeyRepository.delete({ id });
    const removed = (result.affected || 0) > 0;
    return {
      success: removed,
      message: removed ? 'Passkey removed successfully' : 'Passkey not found',
    };
  }

  async addPasskey({ credentialID, deviceName, publicKey, userId }: AddPasskeyRequest): Promise<PasskeyResponse> {
    const user = await this.userService.findUserById(userId);

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    const passkey = this.passkeyRepository.create({
      credentialID,
      deviceName,
      publicKey,
      user,
    });

    await this.passkeyRepository.save(passkey);

    return {
      success: true,
      message: 'Passkey added successfully',
    };
  }

  async getPasskey({ credentialID }: GetPasskeyRequest): Promise<GetPasskeyResponse> {
    const passkey = await this.passkeyRepository.findOne({
      where: { credentialID },
      relations: ['user'],
    });

    if (!passkey) {
      return {
        success: false,
        message: 'Passkey not found',
      };
    }

    return {
      success: true,
      message: 'Passkey found successfully',
      credentialID: passkey.credentialID,
      publicKey: passkey.publicKey,
      counter: passkey.counter,
      userId: passkey.user.id,
    };
  }

  async getPasskeys({ userId }: GetPasskeysRequest): Promise<GetPasskeysResponse> {
    const passkeys = await this.passkeyRepository.find({
      where: { user: { id: userId } },
    });

    return {
      passkeys: passkeys.map<GetPasskeysResponse['passkeys'][number]>((passkey) => ({
        id: passkey.id,
        createAt: passkey.createdAt.toISOString(),
        deviceName: passkey.deviceName,
        credentialID: passkey.credentialID,
      })),
    };
  }

  async setCounter({ credentialID, counter }: SetCounterRequest): Promise<PasskeyResponse> {
    const passkey = await this.passkeyRepository.findOneByOrFail({
      credentialID,
    });

    passkey.counter = counter;
    await this.passkeyRepository.save(passkey);

    return {
      success: true,
      message: 'Counter updated successfully',
    };
  }
}
