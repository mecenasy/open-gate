import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type {
  PromptProxyServiceController,
  PromptResponse,
  GetAllPromptsResponse,
  AddPromptRequest,
  GetPromptByIdRequest,
  UpdatePromptRequest,
  RemovePromptRequest,
  GetAllPromptsRequest,
  GetPromptByKeyRequest,
  Prompt as PromptProto,
  PromptSimply,
} from 'src/proto/prompt';
import { PROMPT_PROXY_SERVICE_NAME } from 'src/proto/prompt';
import { AddPromptCommand } from './commands/impl/add-prompt.command';
import { UpdatePromptCommand } from './commands/impl/update-prompt.command';
import { RemovePromptCommand } from './commands/impl/remove-prompt.command';
import { GetPromptByIdQuery } from './queries/impl/get-prompt-by-id.query';
import { GetPromptByKeyQuery } from './queries/impl/get-prompt-by-key.query';
import { GetAllPromptsQuery } from './queries/impl/get-all-prompts.query';

@Controller()
export class PromptGrpcController implements PromptProxyServiceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod(PROMPT_PROXY_SERVICE_NAME, 'AddPrompt')
  async addPrompt(request: AddPromptRequest): Promise<PromptResponse> {
    try {
      const data = await this.commandBus.execute<AddPromptCommand, PromptProto>(new AddPromptCommand(request));
      return { status: true, message: 'Prompt created successfully', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to create prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(PROMPT_PROXY_SERVICE_NAME, 'GetPromptById')
  async getPromptById(request: GetPromptByIdRequest): Promise<PromptResponse> {
    try {
      const data = await this.queryBus.execute<GetPromptByIdQuery, PromptProto | null>(
        new GetPromptByIdQuery(request.id),
      );
      if (!data) {
        return { status: false, message: 'Prompt not found' };
      }
      return { status: true, message: 'Prompt found', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to get prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(PROMPT_PROXY_SERVICE_NAME, 'GetPromptByKey')
  async getPromptByKey(request: GetPromptByKeyRequest): Promise<PromptResponse> {
    try {
      const data = await this.queryBus.execute<GetPromptByKeyQuery, PromptProto | null>(
        new GetPromptByKeyQuery(request.key),
      );
      if (!data) {
        return { status: false, message: 'Prompt not found' };
      }
      return { status: true, message: 'Prompt found', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to get prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(PROMPT_PROXY_SERVICE_NAME, 'UpdatePrompt')
  async updatePrompt(request: UpdatePromptRequest): Promise<PromptResponse> {
    try {
      const updateData: Partial<AddPromptRequest> = {};
      if (request.userType !== undefined) updateData.userType = request.userType;
      if (request.prompt) updateData.prompt = request.prompt;
      if (request.key) updateData.key = request.key;
      if (request.description) updateData.description = request.description;
      if (request.commandName) updateData.commandName = request.commandName;

      const data = await this.commandBus.execute<UpdatePromptCommand, PromptProto | null>(
        new UpdatePromptCommand(request.id, updateData),
      );
      if (!data) {
        return { status: false, message: 'Prompt not found' };
      }
      return { status: true, message: 'Prompt updated successfully', data };
    } catch (error) {
      return {
        status: false,
        message: `Failed to update prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(PROMPT_PROXY_SERVICE_NAME, 'RemovePrompt')
  async removePrompt(request: RemovePromptRequest): Promise<PromptResponse> {
    try {
      const success = await this.commandBus.execute<RemovePromptCommand, boolean>(new RemovePromptCommand(request.id));
      if (!success) {
        return { status: false, message: 'Prompt not found' };
      }
      return { status: true, message: 'Prompt removed successfully' };
    } catch (error) {
      return {
        status: false,
        message: `Failed to remove prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(PROMPT_PROXY_SERVICE_NAME, 'GetAllPrompts')
  async getAllPrompts(request: GetAllPromptsRequest): Promise<GetAllPromptsResponse> {
    try {
      const result = await this.queryBus.execute<GetAllPromptsQuery, { data: PromptSimply[]; total: number }>(
        new GetAllPromptsQuery(request.page, request.limit, request.userType),
      );
      return { status: true, message: 'Prompts retrieved successfully', ...result };
    } catch (error) {
      return {
        status: false,
        message: `Failed to get prompts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: [],
        total: 0,
      };
    }
  }
}
