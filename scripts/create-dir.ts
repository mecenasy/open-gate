import * as fs from 'fs/promises';
import path from 'path';

export const ensureDirectory = async (dir: string) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

export const createFile = async (filePath: string, content: string) => {
  try {
    // 1. Wyciągamy ścieżkę do samego katalogu (bez nazwy pliku)
    const dir = path.dirname(filePath);

    // 2. Tworzymy foldery rekurencyjnie (jeśli istnieją, nic nie zrobi)
    await fs.mkdir(dir, { recursive: true });

    // 3. Sprawdzamy czy plik istnieje, jeśli nie - tworzymy go
    try {
      await fs.access(filePath);
      console.log(`⚠️ Plik już istnieje: ${filePath}`);
    } catch {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Utworzono plik: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Błąd podczas tworzenia pliku/folderu: ${error.message}`);
  }
};
