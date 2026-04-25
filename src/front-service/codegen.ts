import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../bff-service/common/graph-ql/schema.gql',
  documents: 'src/**/*.{tsx,ts}',
  generates: {
    'src/app/gql/': {
      preset: 'client',
      config: {
        enumsAsTypes: false, // Jeśli chcesz prawdziwe TS Enums zamiast unii stringów
        futureProofEnums: true,
      },
    },
  },
};

export default config;
