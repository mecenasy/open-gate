import type { Socket } from 'socket.io';

/**
 * Fired after a client joins its challenge room. Subscribers can use the
 * room name to decide whether the new socket needs any one-shot priming
 * (e.g. flushing a buffered verification code).
 */
export class GatewayClientConnectedEvent {
  constructor(
    public readonly client: Socket,
    public readonly room: string,
  ) {}
}
