import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  PromptProxyServiceController,
  PromptResponse,
  GetAllPromptsResponse,
  AddPromptRequest,
  GetPromptRequest,
  UpdatePromptRequest,
  RemovePromptRequest,
  GetAllPromptsRequest,
} from 'src/proto/prompt';
import { PROMPT_PROXY_SERVICE_NAME } from 'src/proto/prompt';
import { PromptService } from './prompt.service';
import { jsToProtoUserType } from 'src/utils/user-type-converter';

@Controller()
export class PromptGrpcController implements PromptProxyServiceController {
  constructor(private readonly promptService: PromptService) {}

  @GrpcMethod(PROMPT_PROXY_SERVICE_NAME, 'AddPrompt')
  async addPrompt(request: AddPromptRequest): Promise<PromptResponse> {
    try {
      const prompt = await this.promptService.create({
        commandName: request.commandName,
        description: request.description,
        key: request.key,
        userType: request.userType,
        prompt: request.prompt,
      });

      return {
        status: true,
        message: 'Prompt created successfully',
        data: {
          id: prompt.id,
          key: prompt.key,
          commandName: prompt.commandName,
          description: prompt.description,
          userType: jsToProtoUserType(prompt.userType),
          prompt: prompt.prompt,
        },
      };
    } catch (error) {
      return {
        status: false,
        message: `Failed to create prompt: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  @GrpcMethod(PROMPT_PROXY_SERVICE_NAME, 'GetPrompt')
  async getPrompt(request: GetPromptRequest): Promise<PromptResponse> {
    try {
      const prompt = await this.promptService.findByUserType(request.userType);

      if (!prompt) {
        return {
          status: false,
          message: 'Prompt not found',
        };
      }

      return {
        status: true,
        message: 'Prompt found',
        data: {
          id: prompt.id,
          commandName: prompt.commandName,
          description: prompt.description,
          key: prompt.key,
          userType: jsToProtoUserType(prompt.userType),
          prompt: prompt.prompt,
        },
      };
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

      const prompt = await this.promptService.update(request.id, updateData);

      if (!prompt) {
        return {
          status: false,
          message: 'Prompt not found',
        };
      }

      return {
        status: true,
        message: 'Prompt updated successfully',
        data: {
          id: prompt.id,
          key: prompt.key,
          description: prompt.description,
          commandName: prompt.commandName,
          userType: jsToProtoUserType(prompt.userType),
          prompt: prompt.prompt,
        },
      };
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
      const success = await this.promptService.remove(request.id);

      if (!success) {
        return {
          status: false,
          message: 'Prompt not found',
        };
      }

      return {
        status: true,
        message: 'Prompt removed successfully',
      };
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
      const { prompts, total } = await this.promptService.findAll(request.page, request.limit, request.userType);

      return {
        status: true,
        message: 'Prompts retrieved successfully',
        data: prompts.map((prompt) => ({
          id: prompt.id,
          key: prompt.key,
          description: prompt.description,
          commandName: prompt.commandName,
          userType: jsToProtoUserType(prompt.userType),
          prompt: prompt.prompt,
        })),
        total,
      };
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
