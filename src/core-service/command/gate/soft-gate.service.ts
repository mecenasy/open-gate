import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SoftGateService {
  logger: Logger;

  constructor() {
    this.logger = new Logger(SoftGateService.name);
  }

  async open(data: number) {
    await new Promise((resolve) => {
      // TODO: Implement gate opening logic
      this.logger.log(`Opening soft gate with data: ${data}`);
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });
  }
}
