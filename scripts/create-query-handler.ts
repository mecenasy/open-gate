import path from 'path';
import { createFile } from './create-dir';
import { toPascalCase } from './to-pascal-case';

const commandHandlerTemplate = (
  handlerName: string,
  noQuery: boolean = false,
) => `import { Handler } from '@app/handler';
import { QueryHandler } from '@nestjs/cqrs';
${noQuery ? '' : `import { ${toPascalCase(handlerName)}Query } from '../impl/${handlerName}.query';`}

@QueryHandler(${noQuery ? '' : toPascalCase(handlerName)}Query)
export class ${toPascalCase(handlerName)}Handler extends Handler<${noQuery ? '' : toPascalCase(handlerName)}Query, any, ProxyServiceClient> {
  constructor() {
    super(PROXY_SERVICE_NAME);
  }
  async execute({ }: ${noQuery ? '' : toPascalCase(handlerName)}Query): Promise<any> {

  }
}`;

export const createQueryHandler = async (modulePath: string, queryName: string, noQuery: boolean = false) => {
  const filePath = path.join(
    __dirname,
    '../src/core-service',
    modulePath,
    'queries/handlers',
    `${queryName}.handler.ts`,
  );
  await createFile(filePath, commandHandlerTemplate(queryName, noQuery));
  console.log(`Creating query: ${queryName}`, filePath);
};
