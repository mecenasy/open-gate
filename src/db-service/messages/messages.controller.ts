import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type {
  MessagesServiceController,
  MessageResponse,
  GetAllMessagesResponse,
  AddMessageRequest,
  GetMessageRequest,
  UpdateMessageRequest,
  RemoveMessageRequest,
  GetAllMessagesRequest,
  Message,
} from 'src/proto/messages';
import { MESSAGES_SERVICE_NAME } from 'src/proto/messages';
import { AddMessageCommand } from './commands/impl/add-message.command';
import { UpdateMessageCommand } from './commands/impl/update-message.command';
import { RemoveMessageCommand } from './commands/impl/remove-message.command';
import { GetMessageQuery } from './queries/impl/get-message.query';
import { GetAllMessagesQuery } from './queries/impl/get-all-messages.query';

@Controller()
export class MessagesController implements MessagesServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod(MESSAGES_SERVICE_NAME, 'AddMessage')
  async addMessage(request: AddMessageRequest): Promise<MessageResponse> {
    try {
      const data = await this.commandBus.execute<AddMessageCommand, Message>(
        new AddMessageCommand(request.key, request.value),
      );
      return { status: true, message: 'Message added successfully', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to add message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(MESSAGES_SERVICE_NAME, 'GetMessage')
  async getMessage(request: GetMessageRequest): Promise<MessageResponse> {
    try {
      const data = await this.queryBus.execute<GetMessageQuery, Message | null>(new GetMessageQuery(request.key));
      if (!data) {
        return { status: false, message: 'Message not found' };
      }
      return { status: true, message: 'Message found', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to get message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(MESSAGES_SERVICE_NAME, 'GetAllMessages')
  async getAllMessages(request: GetAllMessagesRequest): Promise<GetAllMessagesResponse> {
    try {
      const result = await this.queryBus.execute<GetAllMessagesQuery, { data: Message[]; total: number }>(
        new GetAllMessagesQuery(request.page, request.limit),
      );
      return { status: true, message: 'Messages retrieved successfully', ...result };
    } catch (error) {
      return {
        status: false,
        message: `Failed to get messages: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: [],
        total: 0,
      };
    }
  }

  @GrpcMethod(MESSAGES_SERVICE_NAME, 'UpdateMessage')
  async updateMessage(request: UpdateMessageRequest): Promise<MessageResponse> {
    try {
      const data = await this.commandBus.execute<UpdateMessageCommand, Message | null>(
        new UpdateMessageCommand(request.key, request.value),
      );
      if (!data) {
        return { status: false, message: 'Message not found' };
      }
      return { status: true, message: 'Message updated successfully', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to update message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(MESSAGES_SERVICE_NAME, 'RemoveMessage')
  async removeMessage(request: RemoveMessageRequest): Promise<MessageResponse> {
    try {
      const success = await this.commandBus.execute<RemoveMessageCommand, boolean>(
        new RemoveMessageCommand(request.key),
      );
      if (!success) {
        return { status: false, message: 'Message not found' };
      }
      return { status: true, message: 'Message removed successfully' };
    } catch (error) {
      return {
        status: false,
        message: `Failed to remove message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
