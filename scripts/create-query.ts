import path from 'path';
import { createFile } from './create-dir';
import { toPascalCase } from './to-pascal-case';

const queryClass = (name: string) => `import { Query } from '@nestjs/cqrs';

export class ${toPascalCase(name)}Query extends Query<any> {
  constructor() {
    super();
  }
}
`;

export const createQuery = async (modulePath: string, queryName: string) => {
  const filePath = path.join(__dirname, '../src/user-service', modulePath, 'queries/impl', `${queryName}.query.ts`);
  await createFile(filePath, queryClass(queryName));
  console.log(`Creating query: ${queryName}`, filePath);
};
