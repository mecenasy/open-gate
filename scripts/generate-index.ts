import fs from 'fs/promises';
import path from 'path';

export const generateIndex = async (modulePath: string, arrayName: string) => {
  const dirPath = path.join(__dirname, '../src/core-service', modulePath, arrayName, 'handlers');
  try {
    // 1. Pobierz wszystkie pliki w katalogu
    const files = await fs.readdir(dirPath);

    const imports: string[] = [];
    const classNames: string[] = [];

    for (const file of files) {
      // Ignorujemy index.ts, pliki testowe i wszystko co nie jest .ts
      if (file === 'index.ts' || !file.endsWith('.ts') || file.includes('.spec.')) {
        continue;
      }

      const filePath = path.join(dirPath, file);
      const content = await fs.readFile(filePath, 'utf8');

      // 2. Szukamy nazwy klasy (export class NazwaKlasy)
      const classMatch = content.match(/export class (\w+)/);

      if (classMatch && classMatch[1]) {
        const className = classMatch[1];
        const fileNameNoExt = file.replace('.ts', '');

        imports.push(`import { ${className} } from './${fileNameNoExt}';`);
        classNames.push(className);
      }
    }

    const indexContent = [
      ...imports,
      '',
      `export const ${arrayName}Handlers = [`,
      ...classNames.map((name) => `  ${name},`),
      `];`,
      '',
    ].join('\n');

    // 4. Zapisywanie (nadpisuje stary plik automatycznie)
    const indexPath = path.join(dirPath, 'index.ts');
    await fs.writeFile(indexPath, indexContent, 'utf8');

    console.log(`✨ Wygenerowano: ${indexPath}`);
  } catch (error) {
    console.error(`❌ Błąd generowania indeksu: ${error.message}`);
  }
};
