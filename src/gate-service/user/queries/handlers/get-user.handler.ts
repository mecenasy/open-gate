import { Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import { type ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { GrpcProxyKey, ProxyKey } from 'src/gate-service/common/proxy/constance';
import { GetUserQuery } from '../impl/get-user.query';
import { Handler } from 'src/gate-service/common/handler/handler';
import { USER_PROXY_SERVICE_NAME, UserProxyServiceClient } from 'src/proto/user';

@QueryHandler(GetUserQuery)
export class GetUserHandler extends Handler<GetUserQuery, any, UserProxyServiceClient> {
  constructor(
    @Inject(GrpcProxyKey) public readonly grpcClient: ClientGrpc,
    @Inject(ProxyKey) public readonly client: ClientProxy,
  ) {
    super(USER_PROXY_SERVICE_NAME);
  }

  async execute(query: GetUserQuery) {
    throw new NotFoundException('User not found');
  }
}
