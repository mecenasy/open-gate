import { Module } from '@nestjs/common';
import { SocketSaga } from './socket.saga';
import { SocketCodeHandler } from './commands/handler/socket-code.handler';

@Module({
  providers: [SocketSaga, SocketCodeHandler],
})
export class SocketModule {}
