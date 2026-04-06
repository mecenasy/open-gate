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
        promptType: request.promptType,
        prompt: request.prompt,
      });

      return {
        status: true,
        message: 'Prompt created successfully',
        data: {
          id: prompt.id,
          promptType: jsToProtoUserType(prompt.promptType),
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
      const prompt = await this.promptService.findByPromptType(request.promptType);

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
          promptType: jsToProtoUserType(prompt.promptType),
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
      if (request.promptType !== undefined) updateData.promptType = request.promptType;
      if (request.prompt) updateData.prompt = request.prompt;

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
          promptType: jsToProtoUserType(prompt.promptType),
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
      const { prompts, total } = await this.promptService.findAll(request.page, request.limit, request.promptType);

      return {
        status: true,
        message: 'Prompts retrieved successfully',
        data: prompts.map((prompt) => ({
          id: prompt.id,
          promptType: jsToProtoUserType(prompt.promptType),
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
