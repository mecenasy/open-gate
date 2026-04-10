import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Messages } from './entity/messages.entity';
import { Message } from 'src/proto/messages';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Messages)
    private readonly messagesRepository: Repository<Messages>,
  ) {}

  async add(key: string, value: string): Promise<Messages> {
    const message = this.messagesRepository.create({ key, value });
    return this.messagesRepository.save(message);
  }

  async get(key: string): Promise<Messages | null> {
    return this.messagesRepository.findOne({ where: { key } });
  }

  async getAll(page: number = 1, limit: number = 10): Promise<{ messages: Messages[]; total: number }> {
    const [messages, total] = await this.messagesRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { key: 'ASC' },
    });
    return { messages, total };
  }

  async update(key: string, value: string): Promise<Messages | null> {
    const message = await this.get(key);
    if (!message) return null;
    message.value = value;
    return this.messagesRepository.save(message);
  }

  async remove(key: string): Promise<boolean> {
    const result = await this.messagesRepository.delete({ key });
    return (result.affected || 0) > 0;
  }

  entityToProto(entity: Messages): Message {
    return { key: entity.key, value: entity.value };
  }
}
