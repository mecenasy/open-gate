import { prompt } from 'enquirer';

type ArrayPromptOptions = {
  type: string;
  name: string;
  message: string;
  choices: string[];
  initial?: string | number;
};
import { createQueryHandler } from './create-query-handler';
import { createQuery } from './create-query';
import { createCommandHandler } from './create-command-handler';
import { createCommand } from './create-command';
import p from 'path';
import { generateIndex } from './generate-index';
import { updateResolver } from './update-resolver';
import { updateModule } from './update-module';
import { createInputType } from './create-input-type';
import { createObjectType } from './create-object-type';
interface Prompt {
  module: string;
  path: string;
  flags: string[];
}

const run = async () => {
  const namePrompt = await prompt<Prompt>([
    {
      type: 'input',
      name: 'module',
      message: 'Podaj nazwę (np. User):',
      initial: 'module',
    },
    {
      type: 'input',
      name: 'path',
      message: 'Podaj ścieżkę (np. auth/mfa):',
      initial: '',
    },
    {
      type: 'multiselect',
      name: 'flags',
      message: 'Podaj flagi (np. -c -q):',
      choices: ['-c', '-q', '-no-query', '-no-command'],
    } as ArrayPromptOptions,
  ]);

  const { module, path, flags } = namePrompt;

  if (flags.includes('-q')) {
    try {
      const res = await prompt<{
        queries: string;
      }>({
        type: 'input',
        name: 'queries',
        message: 'Podaj nawy query handlerów  (np. get-user get-all-users):',
        initial: 'get-user',
      });

      const queries = res.queries.trim().split(' ').filter(Boolean);


      const noQuery = flags.includes('-no-query');
      await Promise.all([
        ...queries.map(async (query) => {
          await createQueryHandler(p.join(path, module), query, noQuery);
          return Promise.resolve();
        }),
        ...queries.map(async (query) => {
          await createInputType(p.join(path, module), query);
        }),
        ...queries.map(async (query) => {
          await createObjectType(p.join(path, module), query);
        }),
      ]);
      await generateIndex(p.join(path, module), 'queries');

      for (const qr of queries) {
        await updateResolver(p.join(path, module), module, qr, 'query');
      }
      if (!noQuery) {
        await Promise.all(
          queries.map(async (query) => {
            await createQuery(p.join(path, module), query);
            return Promise.resolve();
          }),
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (flags.includes('-c')) {
    try {
      const res = await prompt<{
        commands: string;
      }>({
        type: 'input',
        name: 'commands',
        message: 'Podaj nawy command handlerów  (np. create-user update-user):',
        initial: 'create-user',
      });
      const commands = res.commands.trim().split(' ').filter(Boolean);

      const noCommand = flags.includes('-no-command');

      await Promise.all([
        ...commands.map(async (command) => {
          await createCommandHandler(p.join(path, module), command, noCommand);
          return Promise.resolve();
        }),
        ...commands.map(async (command) => {
          await createInputType(p.join(path, module), command);
        }),
        ...commands.map(async (command) => {
          await createObjectType(p.join(path, module), command);
        }),
      ]);
      await generateIndex(p.join(path, module), 'commands');

      for (const com of commands) {
        await updateResolver(p.join(path, module), module, com, 'command');
      }
      if (!noCommand) {
        await Promise.all(
          commands.map(async (command) => {
            await createCommand(p.join(path, module), command);
            return Promise.resolve();
          }),
        );
      }
    } catch (error) {
      console.error(error);
    }

    await updateModule(p.join(path, module), module);
  }
};

run()
  .catch(() => {
    process.exit(1);
  })
  .finally(() => {
    // console.log(`Creating module: ${moduleName}`);
  });
