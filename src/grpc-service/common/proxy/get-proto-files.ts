import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

export const getGrpcOptions = (protoDir: string) => {
  const posixProtoDir = protoDir.split(path.sep).join('/');
  const protoFiles = glob.sync(`${posixProtoDir}/**/*.proto`);

  const packages = new Set<string>();

  protoFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const match = content.match(/^package\s+([^;\s]+)/m);
    if (match && match[1]) {
      packages.add(match[1]);
    }
  });

  return {
    protoPath: protoFiles,
    package: Array.from(packages),
  };
};
