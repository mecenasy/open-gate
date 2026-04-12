module.exports = {
  client: {
    service: {
      name: 'my-backend',
      url: 'http://localhost:3001/graphql',
    },
    includes: ['src/app/**/*.tsx', 'src/app/**/*.ts'],
    tagName: 'graphql'
  },
};