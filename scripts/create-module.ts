import p from 'path';
import { ensureDirectory } from './create-dir';

export const createModule = async (moduleName: string, path: string = '') => {
  const modulePath = p.join(__dirname, '../src/user-service', path, moduleName);
  await ensureDirectory(modulePath);
};
