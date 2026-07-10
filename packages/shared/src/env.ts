import { existsSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';
import { config } from 'dotenv';

function findUp(fileName: string, startDirectory: string): string | undefined {
  let currentDirectory = startDirectory;

  while (true) {
    const filePath = join(currentDirectory, fileName);

    if (existsSync(filePath)) {
      return filePath;
    }

    const parentDirectory = dirname(currentDirectory);

    if (parentDirectory === currentDirectory || currentDirectory === parse(currentDirectory).root) {
      return undefined;
    }

    currentDirectory = parentDirectory;
  }
}

export function loadRootEnvFile(startDirectory: string = process.cwd()): void {
  const envPath = findUp('.env', startDirectory);

  if (envPath) {
    config({ path: envPath });
  }
}
