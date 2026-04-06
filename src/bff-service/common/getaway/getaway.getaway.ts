import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface CustomQuery {
  challenge: string;
  [key: string]: string | string[] | undefined;
}

interface AuthenticatedSocket extends Socket {
  handshake: Socket['handshake'] & {
    query: CustomQuery;
  };
}

@WebSocketGateway({
  namespace: 'getaway',
  cors: { origin: '*' },
})
export class Getaway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;
  logger: Logger;

  constructor() {
    this.logger = new Logger(Getaway.name);
  }

  async handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
    this.logger.log(`🚀 Client connected: ${client.handshake.query.challenge}`);
    const challenge = client.handshake.query.challenge;
    if (!challenge) {
      this.logger.warn('❌ No challenge provided, disconnecting client');
      client.disconnect();
      return;
    }
    await client.join(challenge);
  }
}
