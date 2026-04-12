/**
 * Script to add logger to all handler files
 * Automatically injects CustomLogger and wraps execute method with logging
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const HANDLER_PATTERN = 'src/**/*.handler.ts';
const LOGGER_IMPORT = "import { CustomLogger } from '@app/logger';";

function getHandlerClassNameFromFile(content) {
  const classMatch = content.match(/export class (\w+Handler)/);
  return classMatch ? classMatch[1] : 'Handler';
}

function hasLoggerImport(content) {
  return content.includes("from '@app/logger'") || content.includes("import { Logger }");
}

function hasLoggerInjection(content) {
  return content.includes('private readonly logger: CustomLogger') ||
    content.includes('private logger:') ||
    content.includes('this.logger.setContext');
}

function addLoggerImport(content) {
  if (hasLoggerImport(content)) return content;

  // Find last import statement
  const lastImportMatch = content.match(/import .* from ['"][^'"]+['"];/g);
  if (!lastImportMatch) return content;

  const lastImport = lastImportMatch[lastImportMatch.length - 1];
  const insertPosition = content.lastIndexOf(lastImport) + lastImport.length;

  return content.slice(0, insertPosition) + '\n' + LOGGER_IMPORT + content.slice(insertPosition);
}

function addLoggerToConstructor(content, className) {
  if (hasLoggerInjection(content)) return content;

  // Find constructor pattern
  const constructorPattern = /constructor\(([\s\S]*?)\)\s*{/;
  const constructorMatch = content.match(constructorPattern);

  if (!constructorMatch) return content;

  let constructorContent = constructorMatch[1];
  const isEmptyConstructor = constructorContent.trim() === '';

  let newConstructor;
  if (isEmptyConstructor) {
    newConstructor = `constructor(private readonly logger: CustomLogger) {\n    this.logger.setContext(${className}.name);`;
  } else {
    // Add logger as last parameter
    newConstructor = `constructor(\n    ${constructorContent},\n    private readonly logger: CustomLogger,\n  ) {\n    this.logger.setContext(${className}.name);`;
  }

  return content.replace(constructorPattern, newConstructor + '\n  }');
}

function wrapExecuteWithLogging(content, className) {
  // Check if already wrapped (has logger.setContext at execute start)
  if (content.includes('this.logger.setContext') && content.includes('Executing')) return content;

  // Find execute method
  const executePattern = /async execute\((.*?)\):\s*Promise<(.*?)>\s*{([\s\S]*?)(?=\n\s*(async|private|constructor|\}}))/;
  const executeMatch = content.match(executePattern);

  if (!executeMatch) return content;

  const [fullMatch, params, returnType, body] = executeMatch;

  // Extract command param name
  const commandParamMatch = params.match(/(\w+)\s*:/);
  const commandVar = commandParamMatch ? commandParamMatch[1] : 'command';

  const bodyTrimmed = body.trim();

  // Add logging
  const wrappedBody = `
    this.logger.log('Executing ${className}', { 
      commandType: '${className}',
      ${commandVar}: ${commandVar},
    });
    
    try {
      ${bodyTrimmed}
      this.logger.log('${className} completed successfully');
    } catch (error) {
      this.logger.error('${className} failed', error, { 
        commandType: '${className}',
      });
      throw error;
    }`;

  return content.replace(fullMatch, `async execute(${params}): Promise<${returnType}> {${wrappedBody}\n  }`);
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Skip if already has extensive logging
    if (content.includes('this.logger.log(') && content.includes('this.logger.error(')) {
      console.log(`✓ SKIP: ${filePath} (already has logging)`);
      return { status: 'skip', file: filePath };
    }

    const className = getHandlerClassNameFromFile(content);

    // Add logger import
    if (!hasLoggerImport(content)) {
      content = addLoggerImport(content);
    }

    // Add logger to constructor (db-service handlers don't have it)
    if (!hasLoggerInjection(content) && !content.includes('extends BaseCommandHandler') && !content.includes('extends Handler')) {
      content = addLoggerToConstructor(content, className);
    }

    // Write back
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ UPDATED: ${filePath}`);

    return { status: 'updated', file: filePath };
  } catch (error) {
    console.error(`✗ ERROR: ${filePath}`, error.message);
    return { status: 'error', file: filePath, error: error.message };
  }
}

// Main execution
console.log('🔧 Adding logger to all handler files...\n');

const handlerFiles = glob.sync(HANDLER_PATTERN, {
  cwd: process.cwd(),
  ignore: ['node_modules/**', 'dist/**'],
});

console.log(`Found ${handlerFiles.length} handler files\n`);

let updated = 0;
let skipped = 0;
let errors = 0;

handlerFiles.forEach(file => {
  const result = processFile(file);
  if (result.status === 'updated') updated++;
  if (result.status === 'skip') skipped++;
  if (result.status === 'error') errors++;
});

console.log(`\n📊 Summary:`);
console.log(`  Updated: ${updated}`);
console.log(`  Skipped: ${skipped}`);
console.log(`  Errors: ${errors}`);
console.log(`\n✅ Done!`);
