import fs from 'fs/promises';
import { toPascalCase } from './to-pascal-case';
import path from 'path';

export const updateResolver = async (filePath: string, moduleName: string, name: string, type: 'command' | 'query') => {
  const pascalModuleName = toPascalCase(moduleName);
  const pascalType = toPascalCase(name);
  const methodName = pascalType.charAt(0).toLowerCase() + pascalType.slice(1);
  const upperType = type.charAt(0).toUpperCase() + type.slice(1);

  // 1. Definicje nowych fragmentów kodu
  const typeImport = `import { ${pascalType}${upperType} } from './${type === 'command' ? 'commands' : 'queries'}/impl/${name}.${type}';`;
  const responseTypeImport = `import { ${pascalType}Type } from './object-types/${name}.type';`;
  const responseInputImport = `import { ${pascalType}Input } from './input-types/${name}.input';`;

  const newMethod = `
  @${upperType === 'Command' ? 'Mutation' : 'Query'}(() => ${pascalType}Type)
  async ${methodName}(
    @CurrentUserId() userId: string,
    @Args('input') input: any,
  ) {
    return this.${type}Bus.execute<${pascalType}${upperType}, any>(
      new ${pascalType}${upperType}(userId, input),
    );
  }
`;

  const file = path.join(
    __dirname,
    '../src/core-service',
    moduleName,
    `${moduleName}-${type === 'command' ? 'commands' : 'queries'}.resolver.ts`,
  );
  try {
    let content = '';
    try {
      content = await fs.readFile(file, 'utf8');
    } catch {
      content = `import { ${upperType}Bus } from '@nestjs/cqrs';
import { Args, ${upperType === 'Command' ? 'Mutation' : 'Query'}, Resolver } from '@nestjs/graphql';
import { CurrentUserId } from 'src/core-service/common/decorators/current-user-id.decorator';

@Resolver('${pascalModuleName}')
export class ${pascalModuleName}${upperType === 'Command' ? 'Commands' : 'Queries'}Resolver {
  constructor(private readonly ${type}Bus: ${upperType}Bus) {}
}
`;
    }

    // 3. OCHRONA: Jeśli metoda już jest, nic nie rób
    if (content.includes(`async ${methodName}(`)) {
      console.log(`⚠️ Metoda ${methodName} już istnieje.`);
      return;
    }

    // 4. DYNAMICZNE IMPORTY: Dodaj tylko te, których brakuje
    const requiredImports = [typeImport, responseTypeImport, responseInputImport];
    let importsToAdd = '';

    for (const imp of requiredImports) {
      if (!content.includes(imp)) {
        importsToAdd += imp + '\n';
      }
    }

    if (importsToAdd) {
      content = importsToAdd + content;
    }

    const lastBraceIndex = content.lastIndexOf('}');
    if (lastBraceIndex === -1) {
      console.error('❌ Nie znaleziono klamry zamykającej klasę! Plik może być uszkodzony.');
      return;
    }

    const updatedContent = content.substring(0, lastBraceIndex) + newMethod + content.substring(lastBraceIndex);

    // KLUCZOWY MOMENT:
    console.log(`💾 Próba zapisu do: ${file}`);
    await fs.writeFile(file, updatedContent, 'utf8');
    console.log(`✅ Plik zapisany pomyślnie!`);
  } catch (error) {
    console.error(`❌ Błąd: ${error.message}`);
  }
};
