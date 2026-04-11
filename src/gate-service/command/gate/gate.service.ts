import { Injectable, Logger } from '@nestjs/common';
import { CommandType } from 'src/gate-service/common/types/command';

@Injectable()
export class GateService {
  logger: Logger;
  constructor() {
    this.logger = new Logger(GateService.name);
  }
  async open(type: CommandType.Gate | CommandType.SideGate, data: number) {
    await new Promise((resolve) => {
      // TODO: Implement gate opening logic

      setTimeout(() => {
        this.logger.log(`Opened: ${type}: ${data}`);
        resolve(true);
      }, 10000);
    });
  }

  async close(type: CommandType.Gate | CommandType.SideGate, data: number) {
    await new Promise((resolve) => {
      // TODO: Implement gate closing logic

      setTimeout(() => {
        this.logger.log(`Closed: ${type}: ${data}`);
        resolve(true);
      }, 10000);
    });
  }
}
