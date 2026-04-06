import fs from 'fs/promises';
import path from 'path';
import { toPascalCase } from './to-pascal-case';

export const updateModule = async (modulePath: string, moduleName: string) => {
  const pascalModuleName = toPascalCase(moduleName);
  const moduleFilePath = path.join(__dirname, '../src/gate-service', modulePath, `${moduleName}.module.ts`);

  try {
    // Check if module file exists
    let content = '';
    let fileExists = false;

    try {
      content = await fs.readFile(moduleFilePath, 'utf8');
      fileExists = true;
    } catch {
      // File doesn't exist, create new module
      fileExists = false;
    }

    // Collect providers and imports
    const providers: string[] = [];
    const imports: string[] = [];
    const importStatements: string[] = [];

    // 1. Find resolver files
    const moduleDir = path.join(__dirname, '../src/gate-service', modulePath);

    try {
      const files = await fs.readdir(moduleDir);

      // Look for command resolver
      const commandResolverFile = files.find((f) => f.includes(`${moduleName}-commands.resolver.ts`));
      if (commandResolverFile) {
        const resolverName = `${pascalModuleName}CommandsResolver`;
        providers.push(resolverName);
        importStatements.push(`import { ${resolverName} } from './${commandResolverFile.replace('.ts', '')}';`);
      }

      // Look for query resolver
      const queryResolverFile = files.find((f) => f.includes(`${moduleName}-queries.resolver.ts`));
      if (queryResolverFile) {
        const resolverName = `${pascalModuleName}QueriesResolver`;
        providers.push(resolverName);
        importStatements.push(`import { ${resolverName} } from './${queryResolverFile.replace('.ts', '')}';`);
      }

      // Look for combined resolver (fallback)
      const combinedResolverFile = files.find((f) => f.includes(`${moduleName}.resolver.ts`));
      if (combinedResolverFile && !commandResolverFile && !queryResolverFile) {
        const resolverName = `${pascalModuleName}Resolver`;
        providers.push(resolverName);
        importStatements.push(`import { ${resolverName} } from './${combinedResolverFile.replace('.ts', '')}';`);
      }
    } catch (error: unknown) {
      console.log(`⚠️ Could not read module directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 2. Find command and query handlers from index files
    try {
      const commandsIndexPath = path.join(moduleDir, 'commands/handlers', 'index.ts');
      const queriesIndexPath = path.join(moduleDir, 'queries/handlers', 'index.ts');

      // Check commands index
      try {
        const commandsIndex = await fs.readFile(commandsIndexPath, 'utf8');
        const exportMatch = commandsIndex.match(/export\s+const\s+(\w+)\s*=/);
        if (exportMatch) {
          const variableName = exportMatch[1];
          providers.push(`...${variableName}`);
          importStatements.push(`import { ${variableName} } from './commands/handlers';`);
        }
      } catch (error: unknown) {
        console.log(
          `⚠️ Could not read commands index file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }

      // Check queries index
      try {
        const queriesIndex = await fs.readFile(queriesIndexPath, 'utf8');
        const exportMatch = queriesIndex.match(/export\s+const\s+(\w+)\s*=/);
        if (exportMatch) {
          const variableName = exportMatch[1];
          providers.push(`...${variableName}`);
          importStatements.push(`import { ${variableName} } from './queries/handlers';`);
        }
      } catch (error: unknown) {
        console.log(
          `⚠️ Could not read queries index file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    } catch (error: unknown) {
      console.log(`⚠️ Could not read handler index files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 3. Update parent modules to import this module (if this is a new module)
    if (!fileExists) {
      try {
        const parentDir = path.dirname(moduleDir);
        const parentFiles = await fs.readdir(parentDir);

        for (const file of parentFiles) {
          if (file.endsWith('.module.ts')) {
            const parentModulePath = path.join(parentDir, file);

            try {
              let parentContent = await fs.readFile(parentModulePath, 'utf8');
              const pascalModuleName = toPascalCase(moduleName);

              // Check if this module is already imported
              if (!parentContent.includes(`import { ${pascalModuleName}Module }`)) {
                // Add import statement
                const lastImportIndex = parentContent.indexOf('import');
                const endOfImports = parentContent.indexOf('\n', lastImportIndex) + 1;

                const importStatement = `import { ${pascalModuleName}Module } from './${moduleName}/${moduleName}.module';\n`;
                parentContent =
                  parentContent.slice(0, endOfImports) + importStatement + parentContent.slice(endOfImports);

                // Add to imports array in @Module decorator
                const importsMatch = parentContent.match(/imports:\s*\[([^\]]*)\]/);
                if (importsMatch) {
                  const currentImports = importsMatch[1];
                  const newImports = currentImports.trim()
                    ? `${currentImports.trim()}, ${pascalModuleName}Module`
                    : `${pascalModuleName}Module`;

                  parentContent = parentContent.replace(/imports:\s*\[([^\]]*)\]/, `imports: [${newImports}]`);
                }

                await fs.writeFile(parentModulePath, parentContent, 'utf8');
                console.log(`✅ Updated parent module: ${file} to import ${pascalModuleName}Module`);
              }
            } catch (parentError: unknown) {
              console.log(
                `⚠️ Could not update parent module ${file}: ${
                  parentError instanceof Error ? parentError.message : 'Unknown error'
                }`,
              );
            }
          }
        }
      } catch (error: unknown) {
        console.log(`⚠️ Could not read parent directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Generate module content
    if (!fileExists) {
      // Create new module file
      content = `import { Module } from '@nestjs/common';
${importStatements.sort().join('\n')}

@Module({
  ${imports.length > 0 ? `imports: [${imports.join(', ')}],` : ''}
  providers: [
    ${providers.join(',\n    ')}
  ],
})
export class ${pascalModuleName}Module { }
`;
    } else {
      // Update existing module file
      // Parse existing module to find current providers and imports
      const providersMatch = content.match(/providers:\s*\[([\s\S]*?)\]/);
      const importsMatch = content.match(/imports:\s*\[([\s\S]*?)\]/);

      let existingProviders: string[] = [];
      let existingImports: string[] = [];

      if (providersMatch) {
        const providersContent = providersMatch[1];
        existingProviders = providersContent
          .split(',')
          .map((p) => p.trim().replace(/^\.\.\./, ''))
          .filter((p) => p && !p.includes('//'));
      }

      if (importsMatch) {
        const importsContent = importsMatch[1];
        existingImports = importsContent
          .split(',')
          .map((i) => i.trim())
          .filter((i) => i && !i.includes('//'));
      }

      // Find missing providers
      const missingProviders = providers.filter((p) => {
        const cleanP = p.replace('...', '');
        return !existingProviders.some((ep) => ep.replace('...', '') === cleanP);
      });

      // Find missing imports
      const missingImports = imports.filter((i) => !existingImports.includes(i));

      if (missingProviders.length > 0 || missingImports.length > 0) {
        // Add missing import statements at the top
        const lastImportIndex = content.lastIndexOf('import');
        const endOfImports = content.indexOf('\n', lastImportIndex) + 1;

        const newImportStatements = importStatements.filter((stmt) => {
          return !content.includes(stmt);
        });

        if (newImportStatements.length > 0) {
          content = `${content.slice(0, endOfImports)}
${newImportStatements.join('\n')}
${content.slice(endOfImports)}`;
        }

        // Update providers array
        if (missingProviders.length > 0) {
          const newProviders = [...existingProviders, ...missingProviders];
          const providersRegex = /providers:\s*\[([\s\S]*?)\]/;
          const newProvidersContent = newProviders.join(',\n    ');
          content = content.replace(providersRegex, `providers: [\n    ${newProvidersContent}\n  ]`);
        }

        // Update imports array
        if (missingImports.length > 0) {
          const newImports = [...existingImports, ...missingImports];
          const importsRegex = /imports:\s*\[([\s\S]*?)\]/;
          const newImportsContent = newImports.join(', ');
          content = content.replace(importsRegex, `imports: [${newImportsContent}]`);
        }
      }
    }

    // Write the file
    await fs.writeFile(moduleFilePath, content, 'utf8');
    console.log(`✅ ${fileExists ? 'Updated' : 'Created'} module file: ${moduleFilePath}`);
  } catch (error: unknown) {
    console.error(`❌ Error updating module: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
