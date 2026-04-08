import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt } from './entity/prompt.entity';
import { AddPromptRequest, UserType } from 'src/proto/prompt';
import { protoToJsUserType } from 'src/utils/user-type-converter';

@Injectable()
export class PromptService {
  constructor(
    @InjectRepository(Prompt)
    private readonly promptRepository: Repository<Prompt>,
  ) {}

  async create(promptData: AddPromptRequest): Promise<Prompt> {
    const prompt = this.promptRepository.create({
      ...promptData,
      userType: protoToJsUserType(promptData.userType),
    });
    return await this.promptRepository.save(prompt);
  }

  async findById(id: string): Promise<Prompt | null> {
    return await this.promptRepository.findOne({ where: { id } });
  }

  async findByUserType(userType: UserType): Promise<Prompt | null> {
    return await this.promptRepository.findOne({ where: { userType: protoToJsUserType(userType) } });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    userType?: UserType,
  ): Promise<{ prompts: Prompt[]; total: number }> {
    const whereCondition = userType ? { userType: protoToJsUserType(userType) } : {};

    const [prompts, total] = await this.promptRepository.findAndCount({
      where: whereCondition,
      skip: (page - 1) * limit,
      take: limit,
    });
    return { prompts, total };
  }

  async update(id: string, updateData: Partial<AddPromptRequest>): Promise<Prompt | null> {
    await this.promptRepository.update(id, {
      ...updateData,
      userType: updateData.userType ? protoToJsUserType(updateData.userType) : undefined,
    });
    return await this.findById(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.promptRepository.delete(id);
    return (result.affected || 0) > 0;
  }
}
